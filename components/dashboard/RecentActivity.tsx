'use client';

import { useEffect, useState } from 'react';
import { Table, Tag, Avatar, Typography, Space } from 'antd';
import { UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import { sessionAdminService, type Session } from '@/lib/services/session';

dayjs.extend(relativeTime);

const { Text } = Typography;

const LEVEL_COLORS: Record<string, string> = {
  beginner: '#00B894',
  intermediate: '#FDCB6E',
  advanced: '#FF7675',
};

function formatDuration(seconds: number | null): string {
  if (seconds === null) return '—';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function getUserLabel(user?: Session['userA']): string {
  if (!user) return 'Unknown';
  return user.profile?.displayName || user.email;
}

export default function RecentActivity() {
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionAdminService
      .list({ page: 1, limit: 6 })
      .then((res) => setSessions(res.sessions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      title: 'Participants',
      key: 'participants',
      render: (_: unknown, r: Session) => (
        <Space direction="vertical" size={2}>
          <Space size={6}>
            <Avatar
              size={22}
              icon={<UserOutlined />}
              style={{ background: '#6C5CE7', fontSize: 11 }}
            />
            <Text style={{ color: t.textPrimary, fontSize: 13 }}>{getUserLabel(r.userA)}</Text>
          </Space>
          <Space size={6}>
            <Avatar
              size={22}
              icon={<UserOutlined />}
              style={{ background: '#00B894', fontSize: 11 }}
            />
            <Text style={{ color: t.textPrimary, fontSize: 13 }}>{getUserLabel(r.userB)}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Topic / Level',
      key: 'topic',
      render: (_: unknown, r: Session) => (
        <Space direction="vertical" size={2}>
          <Text style={{ color: t.textPrimary, fontSize: 13 }}>{r.topic ?? '—'}</Text>
          {r.level && (
            <Tag
              color={LEVEL_COLORS[r.level] ?? 'default'}
              style={{
                borderRadius: 6,
                textTransform: 'capitalize',
                fontSize: 11,
                marginInlineEnd: 0,
              }}
            >
              {r.level}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_: unknown, r: Session) => (
        <Space size={4}>
          <ClockCircleOutlined style={{ color: t.textMuted, fontSize: 12 }} />
          <Text style={{ color: t.textMuted, fontSize: 13 }}>
            {formatDuration(r.durationSeconds)}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Time',
      key: 'time',
      render: (_: unknown, r: Session) => (
        <Text style={{ color: t.textMuted, fontSize: 12 }}>{dayjs(r.startedAt).fromNow()}</Text>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={sessions}
      rowKey="id"
      loading={loading}
      pagination={false}
      size="middle"
      style={{ marginTop: 4 }}
      locale={{ emptyText: 'No recent sessions' }}
    />
  );
}
