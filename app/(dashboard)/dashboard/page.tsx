'use client';

import { Row, Col, Card, Typography } from 'antd';
import { UserOutlined, BookOutlined, ReadOutlined, DollarOutlined } from '@ant-design/icons';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import PageHeader from '@/components/shared/PageHeader';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import type { StatsCardData } from '@/types';

const { Title, Text } = Typography;

const statsData: StatsCardData[] = [
  {
    title: 'Total Users',
    value: '12,847',
    change: 12.5,
    changeType: 'increase',
    icon: <UserOutlined />,
    color: '#6C5CE7',
  },
  {
    title: 'Active Courses',
    value: '48',
    change: 8.2,
    changeType: 'increase',
    icon: <BookOutlined />,
    color: '#00B894',
  },
  {
    title: 'Total Lessons',
    value: '324',
    change: 15.3,
    changeType: 'increase',
    icon: <ReadOutlined />,
    color: '#74B9FF',
  },
  {
    title: 'Revenue',
    value: '₹8.4L',
    change: 3.1,
    changeType: 'decrease',
    icon: <DollarOutlined />,
    color: '#FDCB6E',
  },
];

export default function DashboardPage() {
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your app."
      />

      {/* Stats Cards */}
      <Row gutter={[20, 20]} className="animate-stagger">
        {statsData.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <StatsCard data={stat} />
          </Col>
        ))}
      </Row>

      {/* Content Row */}
      <Row gutter={[20, 20]} style={{ marginTop: 28 }}>
        {/* Recent Activity */}
        <Col xs={24} xl={16}>
          <Card
            className="glass-card"
            style={{ borderRadius: 14 }}
            styles={{ body: { padding: 0 } }}
          >
            <div style={{ padding: '20px 24px 12px' }}>
              <Title level={5} style={{ margin: 0, color: t.textPrimary, fontWeight: 600 }}>
                Recent Activity
              </Title>
              <Text style={{ color: t.textMuted, fontSize: 13 }}>
                Latest user actions across the platform
              </Text>
            </div>
            <RecentActivity />
          </Card>
        </Col>

        {/* Quick Stats Sidebar */}
        <Col xs={24} xl={8}>
          <Card
            className="glass-card"
            style={{ borderRadius: 14 }}
            styles={{ body: { padding: 24 } }}
          >
            <Title
              level={5}
              style={{ margin: 0, color: t.textPrimary, fontWeight: 600, marginBottom: 20 }}
            >
              Quick Overview
            </Title>

            {[
              { label: 'Active Today', value: '1,284', pct: '10%' },
              { label: 'New This Week', value: '342', pct: '2.7%' },
              { label: 'Avg. Session', value: '18 min', pct: '5.2%' },
              { label: 'Completion Rate', value: '73%', pct: '1.8%' },
              { label: 'Lessons/User', value: '4.2', pct: '3.5%' },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 0',
                  borderBottom: i < 4 ? `1px solid ${t.border}` : 'none',
                }}
              >
                <Text style={{ color: t.textSecondary, fontSize: 14 }}>{item.label}</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Text strong style={{ color: t.textPrimary, fontSize: 15 }}>
                    {item.value}
                  </Text>
                  <Text style={{ color: '#00B894', fontSize: 12 }}>+{item.pct}</Text>
                </div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
