'use client';

import { Table, Tag, Avatar, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import type { ActivityItem } from '@/types';

const { Text } = Typography;

const TYPE_COLORS: Record<string, string> = {
  enrollment: '#6C5CE7',
  completion: '#00B894',
  achievement: '#FDCB6E',
  registration: '#74B9FF',
};

const TYPE_LABELS: Record<string, string> = {
  enrollment: 'Enrolled',
  completion: 'Completed',
  achievement: 'Achievement',
  registration: 'Registered',
};

const mockData: ActivityItem[] = [
  {
    id: '1',
    user: 'Rahul Sharma',
    action: 'enrolled in',
    target: 'Business English Mastery',
    timestamp: '2 minutes ago',
    type: 'enrollment',
  },
  {
    id: '2',
    user: 'Priya Patel',
    action: 'completed',
    target: 'Pronunciation Basics',
    timestamp: '15 minutes ago',
    type: 'completion',
  },
  {
    id: '3',
    user: 'Amit Kumar',
    action: 'earned badge',
    target: '7-Day Streak',
    timestamp: '1 hour ago',
    type: 'achievement',
  },
  {
    id: '4',
    user: 'Sneha Gupta',
    action: 'registered for',
    target: 'IELTS Preparation',
    timestamp: '2 hours ago',
    type: 'enrollment',
  },
  {
    id: '5',
    user: 'Vikram Singh',
    action: 'joined the platform',
    target: '',
    timestamp: '3 hours ago',
    type: 'registration',
  },
  {
    id: '6',
    user: 'Ananya Reddy',
    action: 'completed',
    target: 'Grammar Fundamentals',
    timestamp: '4 hours ago',
    type: 'completion',
  },
];

export default function RecentActivity() {
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);

  const columns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (user: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar
            size={32}
            icon={<UserOutlined />}
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)' }}
          />
          <Text style={{ color: t.textPrimary, fontWeight: 500 }}>{user}</Text>
        </div>
      ),
    },
    {
      title: 'Activity',
      key: 'activity',
      render: (_: unknown, record: ActivityItem) => (
        <Text style={{ color: t.textSecondary }}>
          {record.action}{' '}
          {record.target && (
            <Text strong style={{ color: t.textPrimary }}>
              {record.target}
            </Text>
          )}
        </Text>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag
          style={{
            background: `${TYPE_COLORS[type]}18`,
            color: TYPE_COLORS[type],
            border: `1px solid ${TYPE_COLORS[type]}30`,
            borderRadius: 6,
          }}
        >
          {TYPE_LABELS[type]}
        </Tag>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (time: string) => <Text style={{ color: t.textMuted, fontSize: 13 }}>{time}</Text>,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={mockData}
      rowKey="id"
      pagination={false}
      size="middle"
      style={{ marginTop: 4 }}
    />
  );
}
