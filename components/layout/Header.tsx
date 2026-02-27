'use client';

import { useRouter } from 'next/navigation';
import { Layout, Input, Badge, Avatar, Dropdown, Typography, Space, Tooltip } from 'antd';
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleTheme } from '@/store/slices/themeSlice';
import { clearCurrentUser } from '@/store/slices/userSlice';
import { getTokens } from '@/lib/theme';
import { authService } from '@/lib/services/auth';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

export default function Header() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);

  const handleMenuClick = async ({ key }: { key: string }) => {
    if (key === 'logout') {
      await authService.logout(); // backend clears httpOnly cookies
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

        {/* Notifications */}
        <Badge count={3} size="small" offset={[-2, 2]}>
          <div
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
    </AntHeader>
  );
}
