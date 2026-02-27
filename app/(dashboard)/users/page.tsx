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
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  MoreOutlined,
  StopOutlined,
  CheckCircleOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/shared/PageHeader';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import { STATUS_COLORS } from '@/lib/constants';
import { adminService } from '@/lib/services/admin';

const { Text } = Typography;

interface UserRow {
  user: { id: string; email: string; role: string; isBanned: boolean; createdAt: string };
  profile: {
    displayName: string | null;
    username: string | null;
    avatarUrl: string | null;
  } | null;
  pendingReportsCount: number;
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

  const getActionItems = (record: UserRow) => [
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
    { type: 'divider' as const, key: 'div' },
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
    </div>
  );
}
