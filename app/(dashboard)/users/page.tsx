'use client';

import { useState } from 'react';
import { Table, Card, Input, Button, Tag, Avatar, Space, Dropdown, Select, Typography } from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  UserOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/shared/PageHeader';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import { LEVEL_COLORS, STATUS_COLORS } from '@/lib/constants';
import type { User } from '@/types';

const { Text } = Typography;

const mockUsers: User[] = Array.from({ length: 25 }, (_, i) => ({
  id: `user-${i + 1}`,
  name: [
    'Rahul Sharma',
    'Priya Patel',
    'Amit Kumar',
    'Sneha Gupta',
    'Vikram Singh',
    'Ananya Reddy',
    'Rajesh Jain',
    'Kavita Nair',
    'Suresh Rao',
    'Deepika Mishra',
    'Arjun Das',
    'Meera Iyer',
    'Nikhil Bose',
    'Pooja Verma',
    'Rohit Menon',
    'Swati Agarwal',
    'Tarun Kapoor',
    'Uma Devi',
    'Varun Saxena',
    'Neha Pandey',
    'Kiran Desai',
    'Lakshmi Rao',
    'Manoj Tiwari',
    'Nisha Kulkarni',
    'Omprakash Yadav',
  ][i],
  email: `user${i + 1}@example.com`,
  phone: `+91 98765 ${String(43210 + i).slice(0, 5)}`,
  level: (['beginner', 'intermediate', 'advanced'] as const)[i % 3],
  status: (['active', 'active', 'active', 'inactive', 'banned'] as const)[i % 5],
  enrolledCourses: Math.floor(Math.random() * 8) + 1,
  joinedAt: new Date(
    2024,
    Math.floor(Math.random() * 12),
    Math.floor(Math.random() * 28) + 1,
  ).toLocaleDateString(),
  lastActive: ['Just now', '5 min ago', '1 hour ago', '2 hours ago', 'Yesterday'][i % 5],
}));

export default function UsersPage() {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [levelFilter, setLevelFilter] = useState<string | undefined>(undefined);
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch = !searchText || user.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || user.status === statusFilter;
    const matchesLevel = !levelFilter || user.level === levelFilter;
    return matchesSearch && matchesStatus && matchesLevel;
  });

  const actionItems = [
    { key: 'view', icon: <EyeOutlined />, label: 'View Details' },
    { key: 'edit', icon: <EditOutlined />, label: 'Edit User' },
    { type: 'divider' as const, key: 'div' },
    { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true },
  ];

  const columns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: User) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            size={36}
            icon={<UserOutlined />}
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)', fontWeight: 600 }}
          />
          <div>
            <Text strong style={{ color: t.textPrimary, display: 'block' }}>
              {name}
            </Text>
            <Text style={{ color: t.textMuted, fontSize: 12 }}>{record.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => (
        <Tag
          style={{
            background: `${LEVEL_COLORS[level]}18`,
            color: LEVEL_COLORS[level],
            border: `1px solid ${LEVEL_COLORS[level]}30`,
            borderRadius: 6,
            textTransform: 'capitalize' as const,
          }}
        >
          {level}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
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
      ),
    },
    {
      title: 'Courses',
      dataIndex: 'enrolledCourses',
      key: 'enrolledCourses',
      render: (count: number) => <Text style={{ color: t.textPrimary }}>{count}</Text>,
    },
    {
      title: 'Joined',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (date: string) => <Text style={{ color: t.textMuted, fontSize: 13 }}>{date}</Text>,
    },
    {
      title: 'Last Active',
      dataIndex: 'lastActive',
      key: 'lastActive',
      render: (time: string) => (
        <Text style={{ color: t.textSecondary, fontSize: 13 }}>{time}</Text>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 48,
      render: () => (
        <Dropdown menu={{ items: actionItems }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} style={{ color: t.textMuted }} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage all registered users on the platform"
        action={
          <Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: 10 }}>
            Add User
          </Button>
        }
      />
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
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 260, borderRadius: 8 }}
          />
          <Select
            placeholder="Status"
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 140 }}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'banned', label: 'Banned' },
            ]}
          />
          <Select
            placeholder="Level"
            allowClear
            value={levelFilter}
            onChange={setLevelFilter}
            style={{ width: 140 }}
            options={[
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ]}
          />
        </Space>
      </Card>
      <Card className="glass-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => <Text style={{ color: t.textMuted }}>{total} users total</Text>,
          }}
          size="middle"
        />
      </Card>
    </div>
  );
}
