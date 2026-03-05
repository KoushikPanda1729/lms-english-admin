'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Table,
  Card,
  Input,
  Button,
  Tag,
  Avatar,
  Space,
  Dropdown,
  Select,
  Typography,
  message,
  Spin,
  Modal,
  Divider,
  Descriptions,
  Skeleton,
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  MoreOutlined,
  StopOutlined,
  CheckCircleOutlined,
  CrownOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  FireOutlined,
  GlobalOutlined,
  FlagOutlined,
  BookOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { Progress } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import PageHeader from '@/components/shared/PageHeader';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import { STATUS_COLORS } from '@/lib/constants';
import { adminService } from '@/lib/services/admin';

dayjs.extend(relativeTime);

const { Text, Title } = Typography;

interface UserRow {
  user: { id: string; email: string; role: string; isBanned: boolean; createdAt: string };
  profile: {
    displayName: string | null;
    username: string | null;
    avatarUrl: string | null;
  } | null;
  pendingReportsCount: number;
}

interface UserDetail {
  user: { id: string; email: string; role: string; isBanned: boolean; createdAt: string };
  profile: {
    displayName: string | null;
    username: string | null;
    avatarUrl: string | null;
    bio: string | null;
    nativeLanguage: string | null;
    englishLevel: string | null;
    learningGoal: string | null;
    country: string | null;
    timezone: string | null;
    totalPracticeMins: number;
    totalSessions: number;
    streakDays: number;
    lastSessionAt: string | null;
    lastActiveAt: string | null;
  } | null;
  pendingReportsCount: number;
  totalReportsCount: number;
}

export default function UsersPage() {
  const [searchText, setSearchText] = useState('');
  const [bannedFilter, setBannedFilter] = useState<boolean | undefined>(undefined);
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailUser, setDetailUser] = useState<UserDetail | null>(null);
  const [userCourses, setUserCourses] = useState<
    Awaited<ReturnType<typeof adminService.getUserCourses>>
  >([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchUsers = useCallback(
    async (p: number, search: string, isBanned?: boolean, role?: string) => {
      setLoading(true);
      try {
        const result = await adminService.listUsers({
          page: p,
          limit: pageSize,
          search: search || undefined,
          isBanned,
          role,
        });
        setUsers(result.users);
        setTotal(result.total);
      } catch {
        messageApi.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    },
    [pageSize, messageApi],
  );

  useEffect(() => {
    fetchUsers(page, searchText, bannedFilter, roleFilter);
  }, [page, bannedFilter, roleFilter, fetchUsers, searchText]);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchUsers(1, value, bannedFilter, roleFilter);
    }, 500);
  };

  const handleBan = async (id: string, ban: boolean) => {
    try {
      await adminService.banUser(id, ban);
      messageApi.success(ban ? 'User banned' : 'User unbanned');
      fetchUsers(page, searchText, bannedFilter, roleFilter);
    } catch {
      messageApi.error('Failed to update ban status');
    }
  };

  const handleRoleChange = async (id: string, role: string) => {
    Modal.confirm({
      title: `Change role to "${role}"?`,
      onOk: async () => {
        try {
          await adminService.setUserRole(id, role);
          messageApi.success('Role updated');
          fetchUsers(page, searchText, bannedFilter, roleFilter);
        } catch {
          messageApi.error('Failed to update role');
        }
      },
    });
  };

  const openDetail = async (id: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailUser(null);
    setUserCourses([]);
    try {
      const [detail, courses] = await Promise.all([
        adminService.getUserDetail(id),
        adminService.getUserCourses(id).catch(() => []),
      ]);
      setDetailUser(detail as UserDetail);
      setUserCourses(courses);
    } catch {
      messageApi.error('Failed to load user details');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
      setCoursesLoading(false);
    }
  };

  const getActionItems = (record: UserRow) => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'View Details',
      onClick: () => openDetail(record.user.id),
    },
    { type: 'divider' as const, key: 'div1' },
    record.user.isBanned
      ? {
          key: 'unban',
          icon: <CheckCircleOutlined />,
          label: 'Unban User',
          onClick: () => handleBan(record.user.id, false),
        }
      : {
          key: 'ban',
          icon: <StopOutlined />,
          label: 'Ban User',
          danger: true,
          onClick: () => handleBan(record.user.id, true),
        },
    { type: 'divider' as const, key: 'div2' },
    {
      key: 'make-admin',
      icon: <CrownOutlined />,
      label: 'Make Admin',
      onClick: () => handleRoleChange(record.user.id, 'admin'),
    },
    {
      key: 'make-user',
      icon: <UserOutlined />,
      label: 'Make User',
      onClick: () => handleRoleChange(record.user.id, 'user'),
    },
  ];

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_: unknown, record: UserRow) => {
        const displayName = record.profile?.displayName || record.user.email.split('@')[0];
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar
              size={36}
              src={record.profile?.avatarUrl || undefined}
              icon={<UserOutlined />}
              style={{ background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)', fontWeight: 600 }}
            />
            <div>
              <Text strong style={{ color: t.textPrimary, display: 'block' }}>
                {displayName}
              </Text>
              <Text style={{ color: t.textMuted, fontSize: 12 }}>{record.user.email}</Text>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Role',
      key: 'role',
      render: (_: unknown, record: UserRow) => (
        <Tag
          style={{
            background: 'rgba(108, 92, 231, 0.1)',
            color: '#6C5CE7',
            border: '1px solid rgba(108, 92, 231, 0.2)',
            borderRadius: 6,
            textTransform: 'capitalize' as const,
          }}
        >
          {record.user.role}
        </Tag>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: unknown, record: UserRow) => {
        const status = record.user.isBanned ? 'banned' : 'active';
        return (
          <Tag
            style={{
              background: `${STATUS_COLORS[status]}18`,
              color: STATUS_COLORS[status],
              border: `1px solid ${STATUS_COLORS[status]}30`,
              borderRadius: 6,
              textTransform: 'capitalize' as const,
            }}
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Reports',
      key: 'reports',
      render: (_: unknown, record: UserRow) => (
        <Text style={{ color: record.pendingReportsCount > 0 ? '#FF7675' : t.textPrimary }}>
          {record.pendingReportsCount}
        </Text>
      ),
    },
    {
      title: 'Joined',
      key: 'createdAt',
      render: (_: unknown, record: UserRow) => (
        <Text style={{ color: t.textMuted, fontSize: 13 }}>
          {new Date(record.user.createdAt).toLocaleDateString()}
        </Text>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 48,
      render: (_: unknown, record: UserRow) => (
        <Dropdown menu={{ items: getActionItems(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} style={{ color: t.textMuted }} />
        </Dropdown>
      ),
    },
  ];

  // ─── Detail Modal helpers ────────────────────────────────────────────────────

  const p = detailUser?.profile;
  const u = detailUser?.user;
  const status = u?.isBanned ? 'banned' : 'active';
  const displayName = p?.displayName || u?.email?.split('@')[0] || '';

  return (
    <div>
      {contextHolder}
      <PageHeader title="Users" subtitle="Manage all registered users on the platform" />
      <Card
        className="glass-card"
        style={{ borderRadius: 14, marginBottom: 20 }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Space size={12} wrap>
          <Input
            prefix={<SearchOutlined style={{ color: t.textMuted }} />}
            placeholder="Search users..."
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{ width: 260, borderRadius: 8 }}
          />
          <Select
            placeholder="Status"
            allowClear
            value={bannedFilter === undefined ? undefined : bannedFilter ? 'banned' : 'active'}
            onChange={(val) => {
              setBannedFilter(val === 'banned' ? true : val === 'active' ? false : undefined);
              setPage(1);
            }}
            style={{ width: 140 }}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'banned', label: 'Banned' },
            ]}
          />
          <Select
            placeholder="Role"
            allowClear
            value={roleFilter}
            onChange={(val) => {
              setRoleFilter(val);
              setPage(1);
            }}
            style={{ width: 140 }}
            options={[
              { value: 'user', label: 'User' },
              { value: 'admin', label: 'Admin' },
            ]}
          />
        </Space>
      </Card>
      <Card className="glass-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={users}
            rowKey={(r) => r.user.id}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: false,
              onChange: (p) => setPage(p),
              showTotal: (t2) => <Text style={{ color: t.textMuted }}>{t2} users total</Text>,
            }}
            size="middle"
          />
        </Spin>
      </Card>

      {/* ─── User Detail Modal ──────────────────────────────────────────────── */}
      <Modal
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={640}
        destroyOnClose
        title={
          <Space>
            <UserOutlined style={{ color: '#6C5CE7' }} />
            <span>User Details</span>
          </Space>
        }
      >
        {detailLoading ? (
          <Skeleton active avatar paragraph={{ rows: 6 }} style={{ padding: '16px 0' }} />
        ) : detailUser ? (
          <div style={{ paddingTop: 8 }}>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                borderRadius: 12,
                background: 'rgba(108,92,231,0.06)',
                border: '1px solid rgba(108,92,231,0.15)',
                marginBottom: 20,
              }}
            >
              <Avatar
                size={60}
                src={p?.avatarUrl || undefined}
                icon={<UserOutlined />}
                style={{ background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Title level={5} style={{ margin: 0, color: t.textPrimary }}>
                  {displayName}
                </Title>
                {p?.username && (
                  <Text style={{ color: t.textMuted, fontSize: 13 }}>@{p.username}</Text>
                )}
                <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Tag
                    style={{
                      background: 'rgba(108,92,231,0.1)',
                      color: '#6C5CE7',
                      border: '1px solid rgba(108,92,231,0.2)',
                      borderRadius: 6,
                      textTransform: 'capitalize',
                    }}
                  >
                    {u?.role}
                  </Tag>
                  <Tag
                    style={{
                      background: `${STATUS_COLORS[status]}18`,
                      color: STATUS_COLORS[status],
                      border: `1px solid ${STATUS_COLORS[status]}30`,
                      borderRadius: 6,
                      textTransform: 'capitalize',
                    }}
                  >
                    {status}
                  </Tag>
                </div>
              </div>
            </div>

            {/* Account */}
            <Text strong style={{ color: t.textPrimary, display: 'block', marginBottom: 8 }}>
              Account
            </Text>
            <Descriptions
              column={2}
              size="small"
              labelStyle={{ color: t.textMuted, fontSize: 13 }}
              contentStyle={{ color: t.textPrimary, fontSize: 13 }}
              style={{ marginBottom: 4 }}
            >
              <Descriptions.Item label="Email" span={2}>
                {u?.email}
              </Descriptions.Item>
              <Descriptions.Item label="User ID" span={2}>
                <Text
                  copyable
                  style={{ color: t.textMuted, fontSize: 12, fontFamily: 'monospace' }}
                >
                  {u?.id}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Joined">
                {dayjs(u?.createdAt).format('DD MMM YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Last Active">
                {p?.lastActiveAt ? dayjs(p.lastActiveAt).fromNow() : '—'}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '14px 0' }} />

            {/* Profile */}
            <Text strong style={{ color: t.textPrimary, display: 'block', marginBottom: 8 }}>
              Profile
            </Text>
            <Descriptions
              column={2}
              size="small"
              labelStyle={{ color: t.textMuted, fontSize: 13 }}
              contentStyle={{ color: t.textPrimary, fontSize: 13 }}
              style={{ marginBottom: 4 }}
            >
              <Descriptions.Item label="Native Language">
                {p?.nativeLanguage || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="English Level">
                {p?.englishLevel ? (
                  <Tag color="blue" style={{ borderRadius: 6, textTransform: 'capitalize' }}>
                    {p.englishLevel}
                  </Tag>
                ) : (
                  '—'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Learning Goal">{p?.learningGoal || '—'}</Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space size={4}>
                    <GlobalOutlined />
                    Country
                  </Space>
                }
              >
                {p?.country || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Timezone" span={2}>
                {p?.timezone || '—'}
              </Descriptions.Item>
              {p?.bio && (
                <Descriptions.Item label="Bio" span={2}>
                  <Text style={{ color: t.textSecondary, fontSize: 13 }}>{p.bio}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider style={{ margin: '14px 0' }} />

            {/* Activity */}
            <Text strong style={{ color: t.textPrimary, display: 'block', marginBottom: 12 }}>
              Activity
            </Text>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10,
                marginBottom: 4,
              }}
            >
              {[
                {
                  icon: <ClockCircleOutlined style={{ color: '#6C5CE7' }} />,
                  label: 'Practice',
                  value: `${p?.totalPracticeMins ?? 0} min`,
                },
                {
                  icon: <UserOutlined style={{ color: '#00B894' }} />,
                  label: 'Sessions',
                  value: p?.totalSessions ?? 0,
                },
                {
                  icon: <FireOutlined style={{ color: '#FF7675' }} />,
                  label: 'Streak',
                  value: `${p?.streakDays ?? 0} days`,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: `1px solid ${t.border}`,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
                  <Text strong style={{ color: t.textPrimary, display: 'block', fontSize: 16 }}>
                    {stat.value}
                  </Text>
                  <Text style={{ color: t.textMuted, fontSize: 12 }}>{stat.label}</Text>
                </div>
              ))}
            </div>
            {p?.lastSessionAt && (
              <Text style={{ color: t.textMuted, fontSize: 12, display: 'block', marginTop: 6 }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                Last session {dayjs(p.lastSessionAt).fromNow()}
              </Text>
            )}

            <Divider style={{ margin: '14px 0' }} />

            {/* Courses */}
            <Text strong style={{ color: t.textPrimary, display: 'block', marginBottom: 10 }}>
              Enrolled Courses
            </Text>
            {coursesLoading ? (
              <Spin size="small" />
            ) : userCourses.length === 0 ? (
              <Text style={{ color: t.textMuted, fontSize: 13 }}>No courses enrolled</Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {userCourses.map((c) => {
                  const payStatus = c.payment?.status;
                  const payColor =
                    payStatus === 'paid' ? '#00B894' : payStatus === 'pending' ? '#FDCB6E' : '#aaa';
                  return (
                    <div
                      key={c.courseId}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: `1px solid ${t.border}`,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 6,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <BookOutlined style={{ color: '#6C5CE7' }} />
                          <Text strong style={{ color: t.textPrimary, fontSize: 13 }}>
                            {c.title}
                          </Text>
                          {c.completedAt && (
                            <CheckCircleFilled style={{ color: '#00B894', fontSize: 13 }} />
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {c.isPremium && payStatus && (
                            <Tag
                              style={{
                                background: `${payColor}18`,
                                color: payColor,
                                border: `1px solid ${payColor}40`,
                                borderRadius: 5,
                                fontSize: 11,
                                textTransform: 'capitalize',
                              }}
                            >
                              {payStatus === 'paid' ? `₹${c.payment!.amount} paid` : payStatus}
                            </Tag>
                          )}
                          {!c.isPremium && (
                            <Tag
                              style={{
                                background: 'rgba(0,184,148,0.1)',
                                color: '#00B894',
                                border: '1px solid rgba(0,184,148,0.25)',
                                borderRadius: 5,
                                fontSize: 11,
                              }}
                            >
                              Free
                            </Tag>
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <Progress
                          percent={c.progressPercent}
                          size={['100%', 6]}
                          strokeColor={{ '0%': '#6C5CE7', '100%': '#A29BFE' }}
                          showInfo={false}
                          style={{ flex: 1, margin: 0 }}
                        />
                        <Text style={{ color: t.textMuted, fontSize: 11, flexShrink: 0 }}>
                          {c.completedLessons}/{c.totalLessons} lessons · {c.progressPercent}%
                        </Text>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Divider style={{ margin: '14px 0' }} />

            {/* Reports */}
            <Text strong style={{ color: t.textPrimary, display: 'block', marginBottom: 8 }}>
              Reports
            </Text>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                {
                  label: 'Pending Reports',
                  value: detailUser.pendingReportsCount,
                  color: detailUser.pendingReportsCount > 0 ? '#FF7675' : '#00B894',
                },
                {
                  label: 'Total Reports',
                  value: detailUser.totalReportsCount,
                  color: t.textPrimary,
                },
              ].map((r) => (
                <div
                  key={r.label}
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: `1px solid ${t.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <FlagOutlined style={{ color: r.color, fontSize: 16 }} />
                  <div>
                    <Text strong style={{ color: r.color, display: 'block', fontSize: 16 }}>
                      {r.value}
                    </Text>
                    <Text style={{ color: t.textMuted, fontSize: 12 }}>{r.label}</Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
