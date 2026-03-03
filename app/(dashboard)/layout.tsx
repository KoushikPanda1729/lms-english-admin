'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout, Spin } from 'antd';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import { setCurrentUser } from '@/store/slices/userSlice';
import { authService } from '@/lib/services/auth';

const { Content } = Layout;

const ADMIN_ROLES = ['admin', 'super_admin', 'moderator'];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const collapsed = useAppSelector((state) => state.sidebar.collapsed);
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);
  const router = useRouter();
  const pathname = usePathname();
  // Keep a ref so the one-time effect always sees the latest pathname for the
  // redirect URL, without re-triggering the effect on every navigation.
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const dispatch = useAppDispatch();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Auth is verified ONCE on mount. Subsequent 401s are handled silently by
    // the axios interceptor (token refresh). Re-running this on every pathname
    // change caused a refresh-loop when the access token was expired mid-session.
    authService
      .self()
      .then((user) => {
        if (!ADMIN_ROLES.includes(user.role)) {
          router.replace(`/login?redirect=${encodeURIComponent(pathnameRef.current)}`);
          return;
        }
        dispatch(
          setCurrentUser({
            name: user.email.split('@')[0],
            email: user.email,
            role: user.role as 'admin' | 'super_admin' | 'moderator',
          }),
        );
        setAuthChecked(true);
      })
      .catch(() => {
        router.replace(`/login?redirect=${encodeURIComponent(pathnameRef.current)}`);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — run once on mount only

  // Show full-page spinner while verifying auth — prevents content flash
  if (!authChecked) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: t.bgPrimary,
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: t.bgPrimary }}>
      <Sidebar />
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 260,
          transition: 'margin-left 0.3s cubic-bezier(0.2, 0, 0, 1)',
          background: t.bgPrimary,
        }}
      >
        <Header />
        <Content
          style={{
            padding: 32,
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <div className="page-content">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
}
