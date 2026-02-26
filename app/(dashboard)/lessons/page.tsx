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
  ClockCircleOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/shared/PageHeader';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import { LESSON_TYPE_COLORS, STATUS_COLORS } from '@/lib/constants';
import type { Lesson } from '@/types';

const { Text } = Typography;

const mockLessons: Lesson[] = [
  {
    id: 'l1',
    title: 'Greetings & Introductions',
    courseId: 'c2',
    courseName: 'Everyday Conversations',
    type: 'speaking',
    duration: 15,
    order: 1,
    status: 'published',
    completionRate: 89,
    createdAt: '2024-01-15',
  },
  {
    id: 'l2',
    title: 'Present Tense Rules',
    courseId: 'c5',
    courseName: 'Grammar Fundamentals',
    type: 'grammar',
    duration: 20,
    order: 1,
    status: 'published',
    completionRate: 76,
    createdAt: '2024-01-16',
  },
  {
    id: 'l3',
    title: 'Common Business Phrases',
    courseId: 'c1',
    courseName: 'Business English Mastery',
    type: 'vocabulary',
    duration: 12,
    order: 1,
    status: 'published',
    completionRate: 82,
    createdAt: '2024-01-17',
  },
  {
    id: 'l4',
    title: 'Listening Comprehension: News',
    courseId: 'c3',
    courseName: 'IELTS Preparation',
    type: 'listening',
    duration: 25,
    order: 3,
    status: 'published',
    completionRate: 64,
    createdAt: '2024-01-20',
  },
  {
    id: 'l5',
    title: 'Vowel Sounds Practice',
    courseId: 'c4',
    courseName: 'Pronunciation Perfect',
    type: 'speaking',
    duration: 18,
    order: 2,
    status: 'published',
    completionRate: 91,
    createdAt: '2024-02-01',
  },
  {
    id: 'l6',
    title: 'Essay Writing Structure',
    courseId: 'c6',
    courseName: 'Advanced Writing Skills',
    type: 'writing',
    duration: 30,
    order: 1,
    status: 'draft',
    completionRate: 0,
    createdAt: '2024-03-10',
  },
  {
    id: 'l7',
    title: 'Reading Passages Practice',
    courseId: 'c3',
    courseName: 'IELTS Preparation',
    type: 'reading',
    duration: 22,
    order: 5,
    status: 'published',
    completionRate: 58,
    createdAt: '2024-02-10',
  },
  {
    id: 'l8',
    title: 'Phone Call Etiquette',
    courseId: 'c1',
    courseName: 'Business English Mastery',
    type: 'speaking',
    duration: 15,
    order: 4,
    status: 'published',
    completionRate: 71,
    createdAt: '2024-02-15',
  },
  {
    id: 'l9',
    title: 'Conditional Sentences',
    courseId: 'c5',
    courseName: 'Grammar Fundamentals',
    type: 'grammar',
    duration: 18,
    order: 8,
    status: 'published',
    completionRate: 45,
    createdAt: '2024-02-20',
  },
  {
    id: 'l10',
    title: 'Airport & Hotel Vocabulary',
    courseId: 'c8',
    courseName: 'English for Travel',
    type: 'vocabulary',
    duration: 10,
    order: 1,
    status: 'draft',
    completionRate: 0,
    createdAt: '2024-03-12',
  },
];

export default function LessonsPage() {
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);

  const filteredLessons = mockLessons.filter((lesson) => {
    const matchesSearch =
      !searchText || lesson.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = !typeFilter || lesson.type === typeFilter;
    const matchesStatus = !statusFilter || lesson.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const actionItems = [
    { key: 'view', icon: <EyeOutlined />, label: 'View Lesson' },
    { key: 'edit', icon: <EditOutlined />, label: 'Edit Lesson' },
    { type: 'divider' as const, key: 'div' },
    { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true },
  ];

  const columns = [
    {
      title: 'Lesson',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Lesson) => (
        <div>
          <Text strong style={{ color: t.textPrimary, display: 'block' }}>
            {title}
          </Text>
          <Text style={{ color: t.textMuted, fontSize: 12 }}>{record.courseName}</Text>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag
          style={{
            background: `${LESSON_TYPE_COLORS[type]}18`,
            color: LESSON_TYPE_COLORS[type],
            border: `1px solid ${LESSON_TYPE_COLORS[type]}30`,
            borderRadius: 6,
            textTransform: 'capitalize' as const,
          }}
        >
          {type}
        </Tag>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (dur: number) => (
        <Space size={4}>
          <ClockCircleOutlined style={{ color: t.textMuted, fontSize: 13 }} />
          <Text style={{ color: t.textSecondary, fontSize: 13 }}>{dur} min</Text>
        </Space>
      ),
    },
    {
      title: 'Completion',
      dataIndex: 'completionRate',
      key: 'completionRate',
      render: (rate: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
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
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <Text style={{ color: t.textSecondary, fontSize: 12, minWidth: 32 }}>{rate}%</Text>
        </div>
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
        title="Lessons"
        subtitle="Manage individual lessons across all courses"
        action={
          <Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: 10 }}>
            Add Lesson
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
            placeholder="Search lessons..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 260, borderRadius: 8 }}
          />
          <Select
            placeholder="Type"
            allowClear
            value={typeFilter}
            onChange={setTypeFilter}
            style={{ width: 140 }}
            options={[
              { value: 'vocabulary', label: 'Vocabulary' },
              { value: 'grammar', label: 'Grammar' },
              { value: 'speaking', label: 'Speaking' },
              { value: 'listening', label: 'Listening' },
              { value: 'reading', label: 'Reading' },
              { value: 'writing', label: 'Writing' },
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
            ]}
          />
        </Space>
      </Card>
      <Card className="glass-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={filteredLessons}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => <Text style={{ color: t.textMuted }}>{total} lessons total</Text>,
          }}
          size="middle"
        />
      </Card>
    </div>
  );
}
