'use client';

import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Spin, message, Skeleton } from 'antd';
import { UserOutlined, BookOutlined, WarningOutlined, StopOutlined } from '@ant-design/icons';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import PageHeader from '@/components/shared/PageHeader';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import { adminService } from '@/lib/services/admin';
import type { StatsCardData } from '@/types';

const { Title, Text } = Typography;

interface OverviewItem {
  label: string;
  value: string;
}

export default function DashboardPage() {
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<StatsCardData[]>([]);
  const [overviewItems, setOverviewItems] = useState<OverviewItem[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const stats = await adminService.getStats();
        setStatsData([
          {
            title: 'Total Users',
            value: stats.totalUsers.toLocaleString(),
            change: 0,
            changeType: 'increase',
            icon: <UserOutlined />,
            color: '#6C5CE7',
          },
          {
            title: 'Total Sessions',
            value: stats.totalSessions.toLocaleString(),
            change: 0,
            changeType: 'increase',
            icon: <BookOutlined />,
            color: '#00B894',
          },
          {
            title: 'Active Reports',
            value: stats.activeReports.toLocaleString(),
            change: 0,
            changeType: stats.activeReports > 0 ? 'decrease' : 'increase',
            icon: <WarningOutlined />,
            color: '#FDCB6E',
          },
          {
            title: 'Banned Users',
            value: stats.bannedUsers.toLocaleString(),
            change: 0,
            changeType: 'decrease',
            icon: <StopOutlined />,
            color: '#FF7675',
          },
        ]);
        setOverviewItems([
          { label: 'Sessions Today', value: stats.sessionsToday.toLocaleString() },
          { label: 'New This Week', value: stats.newUsersThisWeek.toLocaleString() },
          { label: 'Avg. Session', value: `${stats.avgSessionMinutes} min` },
          { label: 'Total Courses', value: stats.totalCourses.toLocaleString() },
          { label: 'Published Courses', value: stats.publishedCourses.toLocaleString() },
        ]);
      } catch {
        messageApi.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [messageApi]);

  return (
    <div>
      {contextHolder}
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your app."
      />

      {/* Stats Cards */}
      <Spin spinning={loading}>
        <Row gutter={[20, 20]} className="animate-stagger">
          {statsData.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <StatsCard data={stat} />
            </Col>
          ))}
        </Row>
      </Spin>

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

            {loading ? (
              <Skeleton active paragraph={{ rows: 5 }} title={false} />
            ) : (
              overviewItems.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 0',
                    borderBottom: i < overviewItems.length - 1 ? `1px solid ${t.border}` : 'none',
                  }}
                >
                  <Text style={{ color: t.textSecondary, fontSize: 14 }}>{item.label}</Text>
                  <Text strong style={{ color: t.textPrimary, fontSize: 15 }}>
                    {item.value}
                  </Text>
                </div>
              ))
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
