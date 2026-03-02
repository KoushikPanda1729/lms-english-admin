'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Badge, Button, Empty, Input, Spin, Typography } from 'antd';
import { SendOutlined, CustomerServiceOutlined, UserOutlined } from '@ant-design/icons';
import { getAdminSocket, disconnectAdminSocket } from '@/lib/socket';
import { supportService, type Conversation, type SupportMsg } from '@/lib/services/support';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import type { Socket } from 'socket.io-client';

const { Text, Title } = Typography;

interface LiveMessage {
  id: string;
  text: string;
  fromAdmin: boolean;
  createdAt: string;
}

export default function SupportPage() {
  const mode = useAppSelector((s) => s.theme.mode);
  const t = getTokens(mode);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [input, setInput] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  // WhatsApp-style indicators
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedUserIdRef = useRef<string | null>(null);
  const adminTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep ref in sync so socket callbacks always have the latest value
  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  // ── Load conversation list ────────────────────────────────────────────────

  const loadConversations = useCallback(async () => {
    try {
      const data = await supportService.listConversations();
      setConversations(data);
    } catch {
      // ignore
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ── Connect socket ────────────────────────────────────────────────────────

  useEffect(() => {
    const socket = getAdminSocket();
    socketRef.current = socket;

    socket.off('support_new_message');
    socket.off('support_read');
    socket.off('support_user_typing');
    socket.off('support_user_status');
    socket.off('support_initial_online_users');

    // New message from any user (or admin echo)
    socket.on(
      'support_new_message',
      (payload: {
        messageId: string;
        userId: string;
        displayName: string;
        avatarUrl: string | null;
        text: string;
        fromAdmin: boolean;
        createdAt: string;
      }) => {
        // Update the conversation list in real-time
        setConversations((prev) => {
          const idx = prev.findIndex((c) => c.userId === payload.userId);
          const updated: Conversation = {
            userId: payload.userId,
            displayName: payload.displayName || 'User',
            avatarUrl: payload.avatarUrl,
            lastMessage: payload.text,
            lastMessageAt: payload.createdAt,
            unreadCount:
              idx >= 0
                ? payload.fromAdmin
                  ? prev[idx].unreadCount
                  : prev[idx].unreadCount + 1
                : payload.fromAdmin
                  ? 0
                  : 1,
          };
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = updated;
            next.splice(idx, 1);
            return [updated, ...next];
          }
          return [updated, ...prev];
        });

        // If this message belongs to the currently open thread, append it
        if (selectedUserIdRef.current === payload.userId) {
          setMessages((prev) => [
            ...prev,
            {
              id: payload.messageId,
              text: payload.text,
              fromAdmin: payload.fromAdmin,
              createdAt: payload.createdAt,
            },
          ]);
        }
      },
    );

    // When unread is cleared (e.g. another admin opened this thread)
    socket.on('support_read', ({ userId }: { userId: string }) => {
      setConversations((prev) =>
        prev.map((c) => (c.userId === userId ? { ...c, unreadCount: 0 } : c)),
      );
    });

    // User is typing / stopped typing
    socket.on('support_user_typing', ({ userId, typing }: { userId: string; typing: boolean }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (typing) next.add(userId);
        else next.delete(userId);
        return next;
      });
    });

    // User came online or went offline
    socket.on('support_user_status', ({ userId, online }: { userId: string; online: boolean }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (online) next.add(userId);
        else next.delete(userId);
        return next;
      });
    });

    // Initial list of online users when admin socket connects
    socket.on('support_initial_online_users', ({ userIds }: { userIds: string[] }) => {
      setOnlineUsers(new Set(userIds));
    });

    if (!socket.connected) socket.connect();

    return () => {
      socket.off('support_new_message');
      socket.off('support_read');
      socket.off('support_user_typing');
      socket.off('support_user_status');
      socket.off('support_initial_online_users');
      disconnectAdminSocket();
    };
  }, []);

  // ── Auto-scroll ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  // ── Select a user / open thread ───────────────────────────────────────────

  const openThread = useCallback(async (userId: string) => {
    // Leave previous room
    if (selectedUserIdRef.current && selectedUserIdRef.current !== userId) {
      socketRef.current?.emit('admin_support_leave', { userId: selectedUserIdRef.current });
      // Stop typing timer for previous user
      if (adminTypingTimerRef.current) clearTimeout(adminTypingTimerRef.current);
      socketRef.current?.emit('admin_support_typing', {
        userId: selectedUserIdRef.current,
        typing: false,
      });
    }

    setSelectedUserId(userId);
    setLoadingMsgs(true);
    setMessages([]);

    try {
      const data = await supportService.getConversation(userId);
      setMessages(
        data.map((m: SupportMsg) => ({
          id: m.id,
          text: m.text,
          fromAdmin: m.fromAdmin,
          createdAt: m.createdAt,
        })),
      );
    } catch {
      // ignore
    } finally {
      setLoadingMsgs(false);
    }

    // Join support room for this user (marks messages as read)
    socketRef.current?.emit('admin_support_join', { userId });

    // Clear unread locally
    setConversations((prev) =>
      prev.map((c) => (c.userId === userId ? { ...c, unreadCount: 0 } : c)),
    );
  }, []);

  // ── Send reply ────────────────────────────────────────────────────────────

  const sendReply = useCallback(() => {
    if (!input.trim() || !selectedUserId || !socketRef.current?.connected) return;

    // Stop admin typing indicator before sending
    if (adminTypingTimerRef.current) clearTimeout(adminTypingTimerRef.current);
    socketRef.current.emit('admin_support_typing', { userId: selectedUserId, typing: false });

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, text: input.trim(), fromAdmin: true, createdAt: new Date().toISOString() },
    ]);

    socketRef.current.emit('admin_support_send', {
      userId: selectedUserId,
      text: input.trim(),
    });

    // Update conversation list preview
    setConversations((prev) =>
      prev.map((c) => (c.userId === selectedUserId ? { ...c, lastMessage: input.trim() } : c)),
    );

    setInput('');
  }, [input, selectedUserId]);

  // ── Admin typing emit (debounced) ─────────────────────────────────────────

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
      if (!selectedUserId || !socketRef.current?.connected) return;
      if (!e.target.value.trim()) return;

      socketRef.current.emit('admin_support_typing', { userId: selectedUserId, typing: true });

      if (adminTypingTimerRef.current) clearTimeout(adminTypingTimerRef.current);
      adminTypingTimerRef.current = setTimeout(() => {
        socketRef.current?.emit('admin_support_typing', { userId: selectedUserId, typing: false });
      }, 2000);
    },
    [selectedUserId],
  );

  // ── Format time ──────────────────────────────────────────────────────────

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* ── Page header ── */}
      <div style={{ padding: '24px 24px 16px', borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CustomerServiceOutlined style={{ fontSize: 22, color: '#6C5CE7' }} />
          <Title level={4} style={{ margin: 0, color: t.textPrimary }}>
            Customer Support
          </Title>
          {totalUnread > 0 && <Badge count={totalUnread} style={{ backgroundColor: '#6C5CE7' }} />}
        </div>
        <Text style={{ color: t.textSecondary, fontSize: 13 }}>
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </Text>
      </div>

      {/* ── Two-panel layout ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* ── Left: conversation list ── */}
        <div
          style={{
            width: 300,
            flexShrink: 0,
            borderRight: `1px solid ${t.border}`,
            overflowY: 'auto',
            background: t.bgCard,
          }}
        >
          {loadingConvs ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <Spin />
            </div>
          ) : conversations.length === 0 ? (
            <Empty
              description="No conversations yet"
              style={{ padding: 40, color: t.textSecondary }}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.userId}
                onClick={() => openThread(conv.userId)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 16px',
                  cursor: 'pointer',
                  borderBottom: `1px solid ${t.border}`,
                  background:
                    selectedUserId === conv.userId
                      ? mode === 'dark'
                        ? 'rgba(108,92,231,0.15)'
                        : 'rgba(108,92,231,0.07)'
                      : 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (selectedUserId !== conv.userId) {
                    e.currentTarget.style.background =
                      mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedUserId !== conv.userId) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {/* Avatar with online dot */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar
                    src={conv.avatarUrl || undefined}
                    icon={!conv.avatarUrl ? <UserOutlined /> : undefined}
                    size={44}
                    style={{ background: '#a29bfe' }}
                  />
                  {/* Unread badge */}
                  {conv.unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        background: '#6C5CE7',
                        color: '#fff',
                        borderRadius: 99,
                        fontSize: 10,
                        fontWeight: 700,
                        minWidth: 18,
                        height: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 4px',
                        border: `2px solid ${t.bgCard}`,
                      }}
                    >
                      {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                    </span>
                  )}
                  {/* Online green dot */}
                  {onlineUsers.has(conv.userId) && conv.unreadCount === 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 1,
                        right: 1,
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: '#22c55e',
                        border: `2px solid ${t.bgCard}`,
                      }}
                    />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                    <Text
                      strong
                      style={{
                        color: t.textPrimary,
                        fontSize: 13,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 140,
                      }}
                    >
                      {conv.displayName}
                    </Text>
                    <Text style={{ color: t.textSecondary, fontSize: 11, flexShrink: 0 }}>
                      {fmtTime(conv.lastMessageAt)}
                    </Text>
                  </div>
                  {/* Typing indicator in list */}
                  {typingUsers.has(conv.userId) ? (
                    <Text
                      style={{
                        color: '#6C5CE7',
                        fontSize: 12,
                        fontStyle: 'italic',
                        display: 'block',
                      }}
                    >
                      typing...
                    </Text>
                  ) : (
                    <Text
                      style={{
                        color: conv.unreadCount > 0 ? t.textPrimary : t.textSecondary,
                        fontSize: 12,
                        fontWeight: conv.unreadCount > 0 ? 500 : 400,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                      }}
                    >
                      {conv.lastMessage}
                    </Text>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Right: chat thread ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selectedUserId ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                color: t.textSecondary,
              }}
            >
              <CustomerServiceOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
              <Text style={{ color: t.textSecondary }}>Select a conversation to start</Text>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div
                style={{
                  padding: '14px 20px',
                  borderBottom: `1px solid ${t.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                {(() => {
                  const conv = conversations.find((c) => c.userId === selectedUserId);
                  return conv ? (
                    <>
                      <div style={{ position: 'relative' }}>
                        <Avatar
                          src={conv.avatarUrl || undefined}
                          icon={!conv.avatarUrl ? <UserOutlined /> : undefined}
                          size={36}
                          style={{ background: '#a29bfe' }}
                        />
                        {onlineUsers.has(conv.userId) && (
                          <span
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              background: '#22c55e',
                              border: `2px solid ${t.bgCard}`,
                            }}
                          />
                        )}
                      </div>
                      <div>
                        <Text
                          strong
                          style={{ color: t.textPrimary, fontSize: 14, display: 'block' }}
                        >
                          {conv.displayName}
                        </Text>
                        {typingUsers.has(selectedUserId) ? (
                          <Text style={{ fontSize: 11, color: '#6C5CE7', fontStyle: 'italic' }}>
                            typing...
                          </Text>
                        ) : onlineUsers.has(conv.userId) ? (
                          <Text style={{ fontSize: 11, color: '#22c55e' }}>● Online</Text>
                        ) : (
                          <Text style={{ fontSize: 11, color: t.textSecondary }}>● Offline</Text>
                        )}
                      </div>
                    </>
                  ) : null;
                })()}
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '20px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {loadingMsgs ? (
                  <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
                    <Spin />
                  </div>
                ) : messages.length === 0 ? (
                  <Empty
                    description="No messages yet"
                    style={{ paddingTop: 40 }}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        style={{
                          display: 'flex',
                          justifyContent: msg.fromAdmin ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            maxWidth: '70%',
                            padding: '10px 14px',
                            borderRadius: msg.fromAdmin
                              ? '18px 18px 4px 18px'
                              : '18px 18px 18px 4px',
                            background: msg.fromAdmin
                              ? 'linear-gradient(135deg,#6C5CE7,#a29bfe)'
                              : mode === 'dark'
                                ? '#2d2d3d'
                                : '#f0f0f7',
                            color: msg.fromAdmin ? '#fff' : t.textPrimary,
                            fontSize: 13,
                            lineHeight: 1.5,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                          }}
                        >
                          <div>{msg.text}</div>
                          <div
                            style={{
                              fontSize: 10,
                              marginTop: 4,
                              opacity: 0.65,
                              textAlign: 'right',
                            }}
                          >
                            {fmtTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* User typing indicator in thread */}
                    {typingUsers.has(selectedUserId) && (
                      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div
                          style={{
                            padding: '10px 16px',
                            borderRadius: '18px 18px 18px 4px',
                            background: mode === 'dark' ? '#2d2d3d' : '#f0f0f7',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          {[0, 150, 300].map((delay) => (
                            <span
                              key={delay}
                              style={{
                                display: 'inline-block',
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                background: mode === 'dark' ? '#aaa' : '#999',
                                animation: 'supportBounce 1.2s ease-in-out infinite',
                                animationDelay: `${delay}ms`,
                              }}
                            />
                          ))}
                          <style>{`
                            @keyframes supportBounce {
                              0%, 60%, 100% { transform: translateY(0); }
                              30% { transform: translateY(-4px); }
                            }
                          `}</style>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Input bar */}
              <div
                style={{
                  padding: '12px 16px',
                  borderTop: `1px solid ${t.border}`,
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  background: t.bgCard,
                }}
              >
                <Input
                  value={input}
                  onChange={handleInputChange}
                  onPressEnter={sendReply}
                  placeholder="Type a reply..."
                  style={{ flex: 1, borderRadius: 20, paddingLeft: 16 }}
                  size="large"
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<SendOutlined />}
                  size="large"
                  onClick={sendReply}
                  disabled={!input.trim() || !socketRef.current?.connected}
                  style={{ background: '#6C5CE7', borderColor: '#6C5CE7', flexShrink: 0 }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
