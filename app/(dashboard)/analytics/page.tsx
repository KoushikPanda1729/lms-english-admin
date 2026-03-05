'use client';

import { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Typography, Tag, Spin } from 'antd';
import {
  UserOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/shared/PageHeader';
import StatsCard from '@/components/dashboard/StatsCard';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import api from '@/lib/api';
import type { StatsCardData } from '@/types';

const { Title, Text } = Typography;

interface AnalyticsData {
  payments: {
    totalRevenue: number;
    paidCount: number;
    pendingCount: number;
    failedCount: number;
  };
  topCourses: {
    id: string;
    title: string;
    enrolledCount: number;
    completedCount: number;
    completionRate: number;
    paidCount: number;
  }[];
  userGrowth: {
    month: string;
    newUsers: number;
  }[];
}

function formatMonth(ym: string): string {
  const [year, month] = ym.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function AnalyticsPage() {
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/analytics')
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const analyticsStats: StatsCardData[] = data
    ? [
        {
          title: 'Total Revenue',
          value: `₹${data.payments.totalRevenue.toLocaleString()}`,
          icon: <DollarOutlined />,
          color: '#6C5CE7',
        },
        {
          title: 'Paid Orders',
          value: data.payments.paidCount,
          icon: <TrophyOutlined />,
          color: '#00B894',
        },
        {
          title: 'Pending (Not Paid)',
          value: data.payments.pendingCount,
          icon: <ClockCircleOutlined />,
          color: '#FDCB6E',
        },
        {
          title: 'User Growth (6mo)',
          value: `+${data.userGrowth.reduce((s, r) => s + r.newUsers, 0)}`,
          icon: <RiseOutlined />,
          color: '#74B9FF',
        },
      ]
    : [];

  const topCoursesColumns = [
    {
      title: 'Course',
      dataIndex: 'title',
      key: 'title',
      render: (name: string) => (
        <Text strong style={{ color: t.textPrimary }}>
          {name}
        </Text>
      ),
    },
    {
      title: 'Enrolled',
      dataIndex: 'enrolledCount',
      key: 'enrolledCount',
      render: (count: number) => (
        <Text style={{ color: t.textPrimary }}>{count.toLocaleString()}</Text>
      ),
    },
    {
      title: 'Paid',
      dataIndex: 'paidCount',
      key: 'paidCount',
      render: (count: number) => (
        <Tag
          style={{
            background: 'rgba(0, 184, 148, 0.12)',
            color: '#00B894',
            border: '1px solid rgba(0, 184, 148, 0.25)',
            borderRadius: 6,
          }}
        >
          {count}
        </Tag>
      ),
    },
    {
      title: 'Completion',
      dataIndex: 'completionRate',
      key: 'completionRate',
      render: (rate: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 100 }}>
          <div
            style={{
              flex: 1,
              height: 6,
              background: t.border,
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${rate}%`,
                background: rate >= 75 ? '#00B894' : rate >= 50 ? '#FDCB6E' : '#FF7675',
                borderRadius: 3,
              }}
            />
          </div>
          <Text style={{ color: t.textSecondary, fontSize: 12 }}>{rate}%</Text>
        </div>
      ),
    },
  ];

  const growthColumns = [
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
      render: (m: string) => (
        <Text style={{ color: t.textPrimary, fontWeight: 500 }}>{formatMonth(m)}</Text>
      ),
    },
    {
      title: 'New Users',
      dataIndex: 'newUsers',
      key: 'newUsers',
      render: (count: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowUpOutlined style={{ color: '#00B894', fontSize: 12 }} />
          <Text style={{ color: '#00B894' }}>{count.toLocaleString()}</Text>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Track platform performance and user engagement metrics"
      />
      <Row gutter={[20, 20]} className="animate-stagger">
        {analyticsStats.map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <StatsCard data={stat} />
          </Col>
        ))}
      </Row>
      <Row gutter={[20, 20]} style={{ marginTop: 28 }}>
        <Col xs={24} xl={14}>
          <Card
            className="glass-card"
            style={{ borderRadius: 14 }}
            styles={{ body: { padding: 0 } }}
          >
            <div style={{ padding: '20px 24px 12px' }}>
              <Title level={5} style={{ margin: 0, color: t.textPrimary, fontWeight: 600 }}>
                Top Performing Courses
              </Title>
              <Text style={{ color: t.textMuted, fontSize: 13 }}>Ranked by enrolled students</Text>
            </div>
            <Table
              columns={topCoursesColumns}
              dataSource={(data?.topCourses ?? []).map((c) => ({ ...c, key: c.id }))}
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card
            className="glass-card"
            style={{ borderRadius: 14 }}
            styles={{ body: { padding: 0 } }}
          >
            <div style={{ padding: '20px 24px 12px' }}>
              <Title level={5} style={{ margin: 0, color: t.textPrimary, fontWeight: 600 }}>
                User Growth
              </Title>
              <Text style={{ color: t.textMuted, fontSize: 13 }}>
                Monthly new user registrations (last 6 months)
              </Text>
            </div>
            <Table
              columns={growthColumns}
              dataSource={(data?.userGrowth ?? []).map((r) => ({ ...r, key: r.month }))}
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
