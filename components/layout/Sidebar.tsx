'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Layout, Menu, Typography } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  BookOutlined,
  BarChartOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FlagOutlined,
  TagOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleSidebar } from '@/store/slices/sidebarSlice';
import { getTokens } from '@/lib/theme';
import { ROUTES, MENU_KEYS } from '@/lib/constants';

const { Sider } = Layout;
const { Text } = Typography;

const menuItems = [
  {
    key: MENU_KEYS.DASHBOARD,
    icon: <DashboardOutlined />,
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
  },
  { key: MENU_KEYS.USERS, icon: <UserOutlined />, label: 'Users', path: ROUTES.USERS },
  { key: MENU_KEYS.COURSES, icon: <BookOutlined />, label: 'Courses', path: ROUTES.COURSES },
  { key: MENU_KEYS.REPORTS, icon: <FlagOutlined />, label: 'Reports', path: ROUTES.REPORTS },
  { key: MENU_KEYS.COUPONS, icon: <TagOutlined />, label: 'Coupons', path: ROUTES.COUPONS },
  {
    key: MENU_KEYS.NOTIFICATIONS,
    icon: <BellOutlined />,
    label: 'Notifications',
    path: ROUTES.NOTIFICATIONS,
  },
  {
    key: MENU_KEYS.ANALYTICS,
    icon: <BarChartOutlined />,
    label: 'Analytics',
    path: ROUTES.ANALYTICS,
  },
  { key: MENU_KEYS.SETTINGS, icon: <SettingOutlined />, label: 'Settings', path: ROUTES.SETTINGS },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((state) => state.sidebar.collapsed);
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);

  const activeKey =
    menuItems.find((item) => pathname.startsWith(item.path))?.key || MENU_KEYS.DASHBOARD;

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={260}
      collapsedWidth={80}
      theme={t.siderTheme}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        borderRight: `1px solid ${t.border}`,
        zIndex: 100,
        background: t.bgSidebar,
      }}
    >
      {/* Logo */}
      <div
        className="sidebar-logo"
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 24px',
          borderBottom: `1px solid ${t.border}`,
          gap: 10,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: t.logoBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 700,
            color: t.logoColor,
            flexShrink: 0,
          }}
        >
          SE
        </div>
        {!collapsed && (
          <Text strong className="gradient-text" style={{ fontSize: 18, whiteSpace: 'nowrap' }}>
            SpeakEasy
          </Text>
        )}
      </div>

      {/* Navigation Menu */}
      <Menu
        theme={t.siderTheme}
        mode="inline"
        selectedKeys={[activeKey]}
        items={menuItems.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
        }))}
        onClick={({ key }) => {
          const item = menuItems.find((m) => m.key === key);
          if (item) router.push(item.path);
        }}
        style={{
          marginTop: 12,
          background: 'transparent',
          border: 'none',
        }}
      />

      {/* Collapse Toggle */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          onClick={() => dispatch(toggleSidebar())}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: t.toggleBg,
            border: `1px solid ${t.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: t.textSecondary,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#6C5CE7';
            e.currentTarget.style.color = '#6C5CE7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = t.border;
            e.currentTarget.style.color = t.textSecondary;
          }}
        >
          {collapsed ? (
            <MenuUnfoldOutlined style={{ fontSize: 16 }} />
          ) : (
            <MenuFoldOutlined style={{ fontSize: 16 }} />
          )}
        </div>
      </div>
    </Sider>
  );
}
