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

  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedUserIdRef = useRef<string | null>(null);

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
            // Move to top
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

    if (!socket.connected) socket.connect();

    return () => {
      socket.off('support_new_message');
      socket.off('support_read');
      disconnectAdminSocket();
    };
  }, []);

  // ── Auto-scroll ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Select a user / open thread ───────────────────────────────────────────

  const openThread = useCallback(async (userId: string) => {
    // Leave previous room
    if (selectedUserIdRef.current && selectedUserIdRef.current !== userId) {
      socketRef.current?.emit('admin_support_leave', { userId: selectedUserIdRef.current });
    }

    setSelectedUserId(userId);
    setLoadingMsgs(true);
    setMessages([]);

    try {
      const data = await supportService.getConversation(userId);
      setMessages(
        data.map((m) => ({
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
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar
                    src={conv.avatarUrl || undefined}
                    icon={!conv.avatarUrl ? <UserOutlined /> : undefined}
                    size={44}
                    style={{ background: '#a29bfe' }}
                  />
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
                      <Avatar
                        src={conv.avatarUrl || undefined}
                        icon={!conv.avatarUrl ? <UserOutlined /> : undefined}
                        size={36}
                        style={{ background: '#a29bfe' }}
                      />
                      <div>
                        <Text strong style={{ color: t.textPrimary, fontSize: 14 }}>
                          {conv.displayName}
                        </Text>
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
                  messages.map((msg) => (
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
                          borderRadius: msg.fromAdmin ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
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
                  ))
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
                  onChange={(e) => setInput(e.target.value)}
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
