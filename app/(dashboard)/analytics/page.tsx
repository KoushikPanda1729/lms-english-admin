'use client';

import { Row, Col, Card, Table, Typography, Tag } from 'antd';
import {
  UserOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/shared/PageHeader';
import StatsCard from '@/components/dashboard/StatsCard';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import type { StatsCardData } from '@/types';

const { Title, Text } = Typography;

const analyticsStats: StatsCardData[] = [
  {
    title: 'Daily Active Users',
    value: '2,847',
    change: 8.4,
    changeType: 'increase',
    icon: <UserOutlined />,
    color: '#6C5CE7',
  },
  {
    title: 'Avg. Session Duration',
    value: '22 min',
    change: 5.1,
    changeType: 'increase',
    icon: <ClockCircleOutlined />,
    color: '#00B894',
  },
  {
    title: 'Course Completion',
    value: '73%',
    change: 2.3,
    changeType: 'increase',
    icon: <TrophyOutlined />,
    color: '#FDCB6E',
  },
  {
    title: 'User Growth',
    value: '+342',
    change: 12.7,
    changeType: 'increase',
    icon: <RiseOutlined />,
    color: '#74B9FF',
  },
];

const topCoursesData = [
  { key: '1', course: 'Grammar Fundamentals', students: 4120, completionRate: 78, rating: 4.8 },
  { key: '2', course: 'Everyday Conversations', students: 3456, completionRate: 85, rating: 4.9 },
  { key: '3', course: 'Pronunciation Perfect', students: 2890, completionRate: 72, rating: 4.7 },
  { key: '4', course: 'IELTS Preparation', students: 2105, completionRate: 64, rating: 4.6 },
  { key: '5', course: 'Business English Mastery', students: 1842, completionRate: 69, rating: 4.5 },
];

const userGrowthData = [
  { key: '1', month: 'October 2024', newUsers: 1240, active: 8450, churn: '2.1%' },
  { key: '2', month: 'November 2024', newUsers: 1580, active: 9200, churn: '1.8%' },
  { key: '3', month: 'December 2024', newUsers: 1390, active: 9800, churn: '2.3%' },
  { key: '4', month: 'January 2025', newUsers: 1850, active: 10900, churn: '1.5%' },
  { key: '5', month: 'February 2025', newUsers: 2100, active: 12200, churn: '1.2%' },
  { key: '6', month: 'March 2025', newUsers: 2340, active: 12847, churn: '1.4%' },
];

export default function AnalyticsPage() {
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);

  const topCoursesColumns = [
    {
      title: 'Course',
      dataIndex: 'course',
      key: 'course',
      render: (name: string) => (
        <Text strong style={{ color: t.textPrimary }}>
          {name}
        </Text>
      ),
    },
    {
      title: 'Students',
      dataIndex: 'students',
      key: 'students',
      render: (count: number) => (
        <Text style={{ color: t.textPrimary }}>{count.toLocaleString()}</Text>
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
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => (
        <Tag
          style={{
            background: 'rgba(253, 203, 110, 0.15)',
            color: '#D4A017',
            border: '1px solid rgba(253, 203, 110, 0.25)',
            borderRadius: 6,
          }}
        >
          ⭐ {rating}
        </Tag>
      ),
    },
  ];

  const growthColumns = [
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
      render: (m: string) => <Text style={{ color: t.textPrimary, fontWeight: 500 }}>{m}</Text>,
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
    {
      title: 'Active Users',
      dataIndex: 'active',
      key: 'active',
      render: (count: number) => (
        <Text style={{ color: t.textPrimary }}>{count.toLocaleString()}</Text>
      ),
    },
    {
      title: 'Churn Rate',
      dataIndex: 'churn',
      key: 'churn',
      render: (rate: string) => (
        <Tag
          style={{
            background: 'rgba(231, 76, 60, 0.12)',
            color: '#C0392B',
            border: '1px solid rgba(231, 76, 60, 0.2)',
            borderRadius: 6,
          }}
        >
          {rate}
        </Tag>
      ),
    },
  ];

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
              dataSource={topCoursesData}
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
                Monthly user acquisition & retention
              </Text>
            </div>
            <Table
              columns={growthColumns}
              dataSource={userGrowthData}
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
