'use client';

import { useState } from 'react';
import { Table, Card, Input, Button, Tag, Space, Dropdown, Select, Typography } from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/shared/PageHeader';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import { LEVEL_COLORS, STATUS_COLORS } from '@/lib/constants';
import type { Course } from '@/types';

const { Text } = Typography;

const mockCourses: Course[] = [
  {
    id: 'c1',
    title: 'Business English Mastery',
    description: 'Master professional English for corporate environments',
    level: 'advanced',
    category: 'Business',
    lessonsCount: 24,
    enrolledStudents: 1842,
    status: 'published',
    createdAt: '2024-01-15',
    updatedAt: '2024-03-10',
  },
  {
    id: 'c2',
    title: 'Everyday Conversations',
    description: 'Learn English through daily conversation practice',
    level: 'beginner',
    category: 'General',
    lessonsCount: 32,
    enrolledStudents: 3456,
    status: 'published',
    createdAt: '2024-02-01',
    updatedAt: '2024-03-08',
  },
  {
    id: 'c3',
    title: 'IELTS Preparation',
    description: 'Complete IELTS exam preparation course',
    level: 'intermediate',
    category: 'Exam Prep',
    lessonsCount: 40,
    enrolledStudents: 2105,
    status: 'published',
    createdAt: '2024-01-20',
    updatedAt: '2024-03-12',
  },
  {
    id: 'c4',
    title: 'Pronunciation Perfect',
    description: 'Improve your English pronunciation with AI feedback',
    level: 'beginner',
    category: 'Speaking',
    lessonsCount: 18,
    enrolledStudents: 2890,
    status: 'published',
    createdAt: '2024-03-01',
    updatedAt: '2024-03-15',
  },
  {
    id: 'c5',
    title: 'Grammar Fundamentals',
    description: 'Build a strong foundation in English grammar',
    level: 'beginner',
    category: 'Grammar',
    lessonsCount: 28,
    enrolledStudents: 4120,
    status: 'published',
    createdAt: '2024-01-10',
    updatedAt: '2024-03-05',
  },
  {
    id: 'c6',
    title: 'Advanced Writing Skills',
    description: 'Master essay and report writing in English',
    level: 'advanced',
    category: 'Writing',
    lessonsCount: 20,
    enrolledStudents: 890,
    status: 'draft',
    createdAt: '2024-03-10',
    updatedAt: '2024-03-14',
  },
  {
    id: 'c7',
    title: 'Interview English',
    description: 'Prepare for job interviews in English',
    level: 'intermediate',
    category: 'Business',
    lessonsCount: 15,
    enrolledStudents: 1560,
    status: 'published',
    createdAt: '2024-02-15',
    updatedAt: '2024-03-09',
  },
  {
    id: 'c8',
    title: 'English for Travel',
    description: 'Essential English phrases for travelers',
    level: 'beginner',
    category: 'General',
    lessonsCount: 12,
    enrolledStudents: 0,
    status: 'draft',
    createdAt: '2024-03-12',
    updatedAt: '2024-03-12',
  },
];

export default function CoursesPage() {
  const [searchText, setSearchText] = useState('');
  const [levelFilter, setLevelFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);

  const filteredCourses = mockCourses.filter((course) => {
    const matchesSearch =
      !searchText || course.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesLevel = !levelFilter || course.level === levelFilter;
    const matchesStatus = !statusFilter || course.status === statusFilter;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const actionItems = [
    { key: 'view', icon: <EyeOutlined />, label: 'View Course' },
    { key: 'edit', icon: <EditOutlined />, label: 'Edit Course' },
    { type: 'divider' as const, key: 'div' },
    { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true },
  ];

  const columns = [
    {
      title: 'Course',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Course) => (
        <div>
          <Text strong style={{ color: t.textPrimary, display: 'block' }}>
            {title}
          </Text>
          <Text style={{ color: t.textMuted, fontSize: 12 }}>{record.description}</Text>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => (
        <Tag
          style={{
            background: 'rgba(108, 92, 231, 0.1)',
            color: '#6C5CE7',
            border: '1px solid rgba(108, 92, 231, 0.2)',
            borderRadius: 6,
          }}
        >
          {cat}
        </Tag>
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
      title: 'Lessons',
      dataIndex: 'lessonsCount',
      key: 'lessonsCount',
      render: (count: number) => <Text style={{ color: t.textPrimary }}>{count}</Text>,
    },
    {
      title: 'Students',
      dataIndex: 'enrolledStudents',
      key: 'enrolledStudents',
      render: (count: number) => (
        <Text style={{ color: t.textPrimary }}>{count.toLocaleString()}</Text>
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
        title="Courses"
        subtitle="Manage all courses available on the platform"
        action={
          <Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: 10 }}>
            Add Course
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
            placeholder="Search courses..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 260, borderRadius: 8 }}
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
          <Select
            placeholder="Status"
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 140 }}
            options={[
              { value: 'published', label: 'Published' },
              { value: 'draft', label: 'Draft' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
        </Space>
      </Card>
      <Card className="glass-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={filteredCourses}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => <Text style={{ color: t.textMuted }}>{total} courses total</Text>,
          }}
          size="middle"
        />
      </Card>
    </div>
  );
}
