'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card,
  Table,
  Input,
  Select,
  DatePicker,
  Space,
  Typography,
  Tag,
  Button,
  Modal,
  Avatar,
  Tooltip,
  Divider,
  Rate,
  Empty,
} from 'antd';
import {
  SearchOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EyeOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import { sessionAdminService, type Session, type SessionRating } from '@/lib/services/session';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Level options ────────────────────────────────────────────────────────────

const LEVEL_OPTIONS = [
  { value: '', label: 'All levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'green',
  intermediate: 'orange',
  advanced: 'red',
};

export default function SessionsPage() {
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Filters
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  // Detail modal
  const [detail, setDetail] = useState<(Session & { ratings: SessionRating[] }) | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSessions = useCallback(
    async (pg = page) => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { page: pg, limit: pageSize };
        if (search) params.search = search;
        if (level) params.level = level;
        if (dateRange) {
          params.dateFrom = dateRange[0];
          params.dateTo = dateRange[1];
        }
        const res = await sessionAdminService.list(params);
        setSessions(res.sessions);
        setTotal(res.total);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize, search, level, dateRange],
  );

  useEffect(() => {
    fetchSessions(1);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, dateRange]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchSessions(1);
      setPage(1);
    }, 350);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    fetchSessions(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const openDetail = async (session: Session) => {
    setDetail(session as Session & { ratings: SessionRating[] });
    setDetailLoading(true);
    try {
      const full = await sessionAdminService.get(session.id);
      setDetail(full);
    } catch {
      // keep partial data
    } finally {
      setDetailLoading(false);
    }
  };

  // ─── Table columns ────────────────────────────────────────────────────────────

  const columns: ColumnsType<Session> = [
    {
      title: 'Participants',
      key: 'participants',
      render: (_, r) => (
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
      title: 'Topic',
      dataIndex: 'topic',
      key: 'topic',
      render: (v) =>
        v ? (
          <Text style={{ color: t.textPrimary }}>{v}</Text>
        ) : (
          <Text style={{ color: t.textMuted }}>—</Text>
        ),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (v) =>
        v ? (
          <Tag
            color={LEVEL_COLORS[v] ?? 'default'}
            style={{ borderRadius: 6, textTransform: 'capitalize' }}
          >
            {v}
          </Tag>
        ) : (
          <Text style={{ color: t.textMuted }}>—</Text>
        ),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_, r) => (
        <Space size={4}>
          <ClockCircleOutlined style={{ color: t.textMuted, fontSize: 12 }} />
          <Text style={{ color: r.durationSeconds ? t.textPrimary : t.textMuted, fontSize: 13 }}>
            {formatDuration(r.durationSeconds)}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Started At',
      dataIndex: 'startedAt',
      key: 'startedAt',
      render: (v) => (
        <Text style={{ color: t.textMuted, fontSize: 12 }}>
          {dayjs(v).format('DD MMM YYYY, HH:mm')}
        </Text>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, r) =>
        r.endedAt ? (
          <Tag color="default" style={{ borderRadius: 6 }}>
            Ended
          </Tag>
        ) : (
          <Tag color="processing" style={{ borderRadius: 6 }}>
            Ongoing
          </Tag>
        ),
    },
    {
      title: 'Ratings',
      key: 'ratings',
      render: (_, r) => {
        const ratings = r.ratings ?? [];
        if (ratings.length === 0)
          return <Text style={{ color: t.textMuted, fontSize: 12 }}>Not rated</Text>;
        return (
          <Space size={4} wrap>
            {ratings.map((rt) => (
              <Rate key={rt.id} disabled value={rt.stars} style={{ fontSize: 12 }} />
            ))}
          </Space>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, r) => (
        <Tooltip title="View details">
          <Button
            size="small"
            icon={<EyeOutlined />}
            style={{ borderRadius: 6 }}
            onClick={() => openDetail(r)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: t.textPrimary }}>
          Sessions
        </Title>
        <Text style={{ color: t.textMuted }}>All call sessions between users</Text>
      </div>

      {/* Filters */}
      <Card
        className="glass-card"
        style={{ borderRadius: 14, marginBottom: 20 }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Space wrap size={12}>
          <Input
            placeholder="Search by name or email..."
            prefix={<SearchOutlined style={{ color: t.textMuted }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 260, borderRadius: 8 }}
            allowClear
          />
          <Select
            value={level}
            onChange={setLevel}
            options={LEVEL_OPTIONS}
            style={{ width: 160, borderRadius: 8 }}
          />
          <RangePicker
            onChange={(_, strs: [string, string]) => {
              if (strs[0] && strs[1]) setDateRange([strs[0], strs[1]]);
              else setDateRange(null);
            }}
            style={{ borderRadius: 8 }}
            placeholder={['From date', 'To date']}
          />
          {(search || level || dateRange) && (
            <Button
              onClick={() => {
                setSearch('');
                setLevel('');
                setDateRange(null);
              }}
              style={{ borderRadius: 8 }}
            >
              Clear filters
            </Button>
          )}
        </Space>
      </Card>

      {/* Table */}
      <Card className="glass-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={sessions}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: setPage,
            showTotal: (t) => `${t} sessions`,
            style: { padding: '12px 20px' },
          }}
          style={{ borderRadius: 14 }}
        />
      </Card>

      {/* ─── Detail Modal ──────────────────────────────────────────────────────── */}
      <Modal
        title={
          <Space>
            <PhoneOutlined style={{ color: '#6C5CE7' }} />
            <span>Session Details</span>
          </Space>
        }
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={null}
        width={560}
        destroyOnClose
      >
        {detail && (
          <div style={{ paddingTop: 8 }}>
            {/* Participants */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              {[detail.userA, detail.userB].map((user, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    background: i === 0 ? 'rgba(108,92,231,0.08)' : 'rgba(0,184,148,0.08)',
                    border: `1px solid ${i === 0 ? '#6C5CE7' : '#00B894'}`,
                    borderRadius: 10,
                    padding: '12px 14px',
                  }}
                >
                  <Space>
                    <Avatar
                      size={36}
                      icon={<UserOutlined />}
                      style={{ background: i === 0 ? '#6C5CE7' : '#00B894' }}
                    />
                    <div>
                      <Text strong style={{ color: t.textPrimary, display: 'block', fontSize: 13 }}>
                        {getUserLabel(user)}
                      </Text>
                      <Text style={{ color: t.textMuted, fontSize: 12 }}>{user?.email}</Text>
                    </div>
                  </Space>
                </div>
              ))}
            </div>

            {/* Meta */}
            <div
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}
            >
              <div>
                <Text style={{ color: t.textMuted, fontSize: 12, display: 'block' }}>Duration</Text>
                <Text strong style={{ color: t.textPrimary }}>
                  {formatDuration(detail.durationSeconds)}
                </Text>
              </div>
              <div>
                <Text style={{ color: t.textMuted, fontSize: 12, display: 'block' }}>Status</Text>
                <Tag color={detail.endedAt ? 'default' : 'processing'} style={{ borderRadius: 6 }}>
                  {detail.endedAt ? 'Ended' : 'Ongoing'}
                </Tag>
              </div>
              <div>
                <Text style={{ color: t.textMuted, fontSize: 12, display: 'block' }}>Topic</Text>
                <Text strong style={{ color: t.textPrimary }}>
                  {detail.topic ?? '—'}
                </Text>
              </div>
              <div>
                <Text style={{ color: t.textMuted, fontSize: 12, display: 'block' }}>Level</Text>
                {detail.level ? (
                  <Tag
                    color={LEVEL_COLORS[detail.level] ?? 'default'}
                    style={{ borderRadius: 6, textTransform: 'capitalize' }}
                  >
                    {detail.level}
                  </Tag>
                ) : (
                  <Text strong style={{ color: t.textPrimary }}>
                    —
                  </Text>
                )}
              </div>
              <div>
                <Text style={{ color: t.textMuted, fontSize: 12, display: 'block' }}>
                  Started At
                </Text>
                <Space size={4}>
                  <CalendarOutlined style={{ color: t.textMuted, fontSize: 12 }} />
                  <Text strong style={{ color: t.textPrimary, fontSize: 13 }}>
                    {dayjs(detail.startedAt).format('DD MMM YYYY, HH:mm')}
                  </Text>
                </Space>
              </div>
              <div>
                <Text style={{ color: t.textMuted, fontSize: 12, display: 'block' }}>Ended At</Text>
                <Text strong style={{ color: t.textPrimary, fontSize: 13 }}>
                  {detail.endedAt ? dayjs(detail.endedAt).format('DD MMM YYYY, HH:mm') : '—'}
                </Text>
              </div>
            </div>

            {/* Ratings */}
            <Divider style={{ margin: '12px 0' }} />
            <Text strong style={{ color: t.textPrimary, display: 'block', marginBottom: 10 }}>
              Ratings
            </Text>
            {detailLoading ? (
              <Text style={{ color: t.textMuted }}>Loading...</Text>
            ) : detail.ratings && detail.ratings.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {detail.ratings.map((rt) => (
                  <div
                    key={rt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: `1px solid ${t.border}`,
                    }}
                  >
                    <Space size={8}>
                      <Avatar size={28} icon={<UserOutlined />} style={{ background: '#6C5CE7' }} />
                      <div>
                        <Text style={{ color: t.textPrimary, fontSize: 13 }}>
                          <b>{getUserLabel(rt.rater)}</b> rated <b>{getUserLabel(rt.rated)}</b>
                        </Text>
                      </div>
                    </Space>
                    <Rate disabled value={rt.stars} style={{ fontSize: 14 }} />
                  </div>
                ))}
              </div>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No ratings yet" />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
