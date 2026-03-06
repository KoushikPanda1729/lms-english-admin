'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Layout,
  Input,
  Badge,
  Avatar,
  Dropdown,
  Typography,
  Space,
  Tooltip,
  Drawer,
  Spin,
} from 'antd';
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  SunOutlined,
  MoonOutlined,
  UserAddOutlined,
  ShoppingCartOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleTheme } from '@/store/slices/themeSlice';
import { clearCurrentUser } from '@/store/slices/userSlice';
import { getTokens } from '@/lib/theme';
import { authService } from '@/lib/services/auth';
import { adminActivityService, type AdminActivity } from '@/lib/services/notification';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

function ActivityIcon({ type }: { type: AdminActivity['type'] }) {
  if (type === 'user_registered') {
    return (
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'rgba(108,92,231,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <UserAddOutlined style={{ fontSize: 16, color: '#6C5CE7' }} />
      </div>
    );
  }
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: 'rgba(0,184,148,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <ShoppingCartOutlined style={{ fontSize: 16, color: '#00B894' }} />
    </div>
  );
}

export default function Header() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);

  const [bellOpen, setBellOpen] = useState(false);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCount = useCallback(async () => {
    try {
      const res = await adminActivityService.getRecent();
      setUnseenCount(res.unseenCount);
    } catch {
      /* ignore */
    }
  }, []);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminActivityService.getRecent();
      setActivities(res.activities);
      setUnseenCount(res.unseenCount);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBellOpen = (open: boolean) => {
    setBellOpen(open);
    if (open) loadActivities();
  };

  const handleMarkSeen = useCallback(async (id: string) => {
    try {
      await adminActivityService.markSeen(id);
      setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, seen: true } : a)));
      setUnseenCount((c) => Math.max(0, c - 1));
    } catch {
      /* ignore */
    }
  }, []);

  const handleMarkAllSeen = async () => {
    setMarking(true);
    try {
      await adminActivityService.markAllSeen();
      setActivities((prev) => prev.map((a) => ({ ...a, seen: true })));
      setUnseenCount(0);
    } catch {
      /* ignore */
    } finally {
      setMarking(false);
    }
  };

  // Poll unseen count every 60s
  useEffect(() => {
    fetchCount();
    pollRef.current = setInterval(fetchCount, 60_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchCount]);

  const handleMenuClick = async ({ key }: { key: string }) => {
    if (key === 'logout') {
      await authService.logout();
      dispatch(clearCurrentUser());
      router.push('/login');
    }
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
  ];

  return (
    <AntHeader
      style={{
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${t.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
        background: t.bgHeader,
      }}
    >
      {/* Search */}
      <div className="header-search">
        <Input
          prefix={<SearchOutlined style={{ color: t.textMuted }} />}
          placeholder="Search anything..."
          variant="borderless"
          style={{
            width: 300,
            background: t.bgInput,
            borderRadius: 10,
            padding: '6px 16px',
            color: t.textPrimary,
          }}
        />
      </div>

      {/* Right section */}
      <Space size={16} align="center">
        {/* Theme Toggle */}
        <Tooltip title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          <div
            onClick={() => dispatch(toggleTheme())}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: t.bgInput,
              border: `1px solid ${t.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#6C5CE7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = t.border;
            }}
          >
            {mode === 'dark' ? (
              <SunOutlined style={{ fontSize: 18, color: '#FDCB6E' }} />
            ) : (
              <MoonOutlined style={{ fontSize: 18, color: '#6C5CE7' }} />
            )}
          </div>
        </Tooltip>

        {/* Notifications Bell */}
        <Badge count={unseenCount} size="small" offset={[-2, 2]}>
          <div
            onClick={() => handleBellOpen(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: t.bgInput,
              border: `1px solid ${t.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#6C5CE7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = t.border;
            }}
          >
            <BellOutlined style={{ fontSize: 18, color: t.textSecondary }} />
          </div>
        </Badge>

        {/* User Avatar & Name */}
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleMenuClick }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Space
            style={{
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: 10,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = t.bgHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Avatar
              style={{
                background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
                fontWeight: 600,
              }}
              icon={<UserOutlined />}
              size={36}
            />
            <div style={{ lineHeight: 1.3 }}>
              <Text
                strong
                style={{
                  display: 'block',
                  fontSize: 13,
                  color: t.textPrimary,
                }}
              >
                {currentUser?.name || 'Admin'}
              </Text>
              <Text
                style={{
                  display: 'block',
                  fontSize: 11,
                  color: t.textMuted,
                }}
              >
                {currentUser?.role === 'super_admin' ? 'Super Admin' : currentUser?.role || 'Admin'}
              </Text>
            </div>
          </Space>
        </Dropdown>
      </Space>
      {/* Activity Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text strong style={{ fontSize: 15, color: t.textPrimary }}>
              Activity
            </Text>
            {unseenCount > 0 && (
              <button
                onClick={handleMarkAllSeen}
                disabled={marking}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  color: '#6C5CE7',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: marking ? 0.5 : 1,
                  padding: '2px 8px',
                  borderRadius: 6,
                }}
              >
                <CheckOutlined style={{ fontSize: 11 }} />
                Mark all seen
              </button>
            )}
          </div>
        }
        placement="right"
        open={bellOpen}
        onClose={() => setBellOpen(false)}
        width={380}
        styles={{
          header: { background: t.bgCard, borderBottom: `1px solid ${t.border}` },
          body: { padding: 0, background: t.bgCard },
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <Spin />
          </div>
        ) : activities.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '48px 16px',
              gap: 12,
            }}
          >
            <BellOutlined style={{ fontSize: 36, color: t.textMuted }} />
            <Text style={{ fontSize: 13, color: t.textMuted }}>No activity yet</Text>
          </div>
        ) : (
          <div style={{ overflowY: 'auto', height: '100%' }}>
            {activities.map((a) => (
              <div
                key={a.id}
                onClick={() => !a.seen && handleMarkSeen(a.id)}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '14px 20px',
                  borderBottom: `1px solid ${t.border}`,
                  cursor: !a.seen ? 'pointer' : 'default',
                  background: !a.seen
                    ? mode === 'dark'
                      ? 'rgba(108,92,231,0.06)'
                      : 'rgba(108,92,231,0.04)'
                    : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <ActivityIcon type={a.type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    strong={!a.seen}
                    style={{
                      display: 'block',
                      fontSize: 13,
                      color: t.textPrimary,
                      lineHeight: 1.4,
                    }}
                  >
                    {a.title}
                  </Text>
                  <Text
                    style={{ display: 'block', fontSize: 12, color: t.textSecondary, marginTop: 2 }}
                  >
                    {a.body}
                  </Text>
                  <Text
                    style={{ display: 'block', fontSize: 11, color: t.textMuted, marginTop: 4 }}
                  >
                    {a.timeAgo}
                  </Text>
                  <Text
                    style={{ display: 'block', fontSize: 11, color: t.textMuted, marginTop: 1 }}
                  >
                    {a.displayTime}
                  </Text>
                </div>
                {!a.seen && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#6C5CE7',
                      flexShrink: 0,
                      marginTop: 6,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </Drawer>
    </AntHeader>
  );
}
