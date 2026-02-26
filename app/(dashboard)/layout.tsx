'use client';

import { Layout } from 'antd';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';

const { Content } = Layout;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const collapsed = useAppSelector((state) => state.sidebar.collapsed);
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);

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
