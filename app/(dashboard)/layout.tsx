'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from 'antd';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import { setCurrentUser } from '@/store/slices/userSlice';
import { authService } from '@/lib/services/auth';

const { Content } = Layout;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const collapsed = useAppSelector((state) => state.sidebar.collapsed);
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Call /auth/self — if the httpOnly cookie is valid, returns user; else 401 → login
    authService
      .self()
      .then((user) => {
        dispatch(
          setCurrentUser({
            name: user.email.split('@')[0],
            email: user.email,
            role: user.role as 'admin' | 'super_admin' | 'moderator',
          }),
        );
      })
      .catch(() => {
        router.replace('/login');
      });
  }, [router, dispatch]);

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
