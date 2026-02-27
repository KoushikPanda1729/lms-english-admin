'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Card,
  Input,
  Button,
  Tag,
  Space,
  Dropdown,
  Select,
  Typography,
  Modal,
  Form,
  InputNumber,
  Switch,
  message,
  Spin,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  MoreOutlined,
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/shared/PageHeader';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import { LEVEL_COLORS, STATUS_COLORS } from '@/lib/constants';
import { courseService } from '@/lib/services/course';

const { Text } = Typography;

interface ApiCourse {
  id: string;
  title: string;
  description: string | null;
  level: string | null;
  isPremium: boolean;
  price: number;
  isPublished: boolean;
  totalLessons: number;
  createdAt: string;
  updatedAt: string;
}

export default function CoursesPage() {
  const [searchText, setSearchText] = useState('');
  const [levelFilter, setLevelFilter] = useState<string | undefined>(undefined);
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [messageApi, contextHolder] = message.useMessage();

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm] = Form.useForm();

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm] = Form.useForm();
  const [editingCourse, setEditingCourse] = useState<ApiCourse | null>(null);

  const router = useRouter();
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);

  const fetchCourses = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const result = await courseService.listCourses({ page: p, limit: 10 });
        setCourses(result.courses);
        setTotal(result.total);
      } catch {
        messageApi.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    },
    [messageApi],
  );

  useEffect(() => {
    fetchCourses(page);
  }, [page, fetchCourses]);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      !searchText || course.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesLevel = !levelFilter || course.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const handleCreate = async (values: {
    title: string;
    description?: string;
    level?: string;
    isPremium: boolean;
    price?: number;
  }) => {
    setCreateLoading(true);
    try {
      await courseService.createCourse({
        title: values.title,
        description: values.description,
        level: values.level,
        isPremium: values.isPremium,
        price: values.price,
      });
      messageApi.success('Course created successfully');
      setCreateOpen(false);
      createForm.resetFields();
      fetchCourses(page);
    } catch {
      messageApi.error('Failed to create course');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = async (values: {
    title?: string;
    description?: string;
    level?: string;
    isPremium?: boolean;
    isPublished?: boolean;
    price?: number;
  }) => {
    if (!editingCourse) return;
    setEditLoading(true);
    try {
      await courseService.updateCourse(editingCourse.id, values);
      messageApi.success('Course updated successfully');
      setEditOpen(false);
      editForm.resetFields();
      setEditingCourse(null);
      fetchCourses(page);
    } catch {
      messageApi.error('Failed to update course');
    } finally {
      setEditLoading(false);
    }
  };

  const openEdit = (record: ApiCourse) => {
    setEditingCourse(record);
    editForm.setFieldsValue({
      title: record.title,
      description: record.description,
      level: record.level,
      isPremium: record.isPremium,
      isPublished: record.isPublished,
      price: record.price,
    });
    setEditOpen(true);
  };

  const getActionItems = (record: ApiCourse) => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'Manage Content',
      onClick: () => router.push(`/courses/${record.id}`),
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit Course',
      onClick: () => openEdit(record),
    },
  ];

  const columns = [
    {
      title: 'Course',
      key: 'title',
      render: (_: unknown, record: ApiCourse) => (
        <div style={{ cursor: 'pointer' }} onClick={() => router.push(`/courses/${record.id}`)}>
          <Text strong style={{ color: '#6C5CE7', display: 'block' }}>
            {record.title}
          </Text>
          <Text style={{ color: t.textMuted, fontSize: 12 }}>
            {record.description || 'No description'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Level',
      key: 'level',
      render: (_: unknown, record: ApiCourse) => {
        const level = record.level || 'beginner';
        return (
          <Tag
            style={{
              background: `${LEVEL_COLORS[level] || '#6C5CE7'}18`,
              color: LEVEL_COLORS[level] || '#6C5CE7',
              border: `1px solid ${LEVEL_COLORS[level] || '#6C5CE7'}30`,
              borderRadius: 6,
              textTransform: 'capitalize' as const,
            }}
          >
            {level}
          </Tag>
        );
      },
    },
    {
      title: 'Price',
      key: 'price',
      render: (_: unknown, record: ApiCourse) => (
        <Text style={{ color: t.textPrimary }}>
          {record.isPremium ? `₹${record.price}` : 'Free'}
        </Text>
      ),
    },
    {
      title: 'Lessons',
      key: 'totalLessons',
      render: (_: unknown, record: ApiCourse) => (
        <Text style={{ color: t.textPrimary }}>{record.totalLessons}</Text>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: unknown, record: ApiCourse) => {
        const status = record.isPublished ? 'published' : 'draft';
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
      title: 'Premium',
      key: 'isPremium',
      render: (_: unknown, record: ApiCourse) => (
        <Tag
          style={{
            background: record.isPremium ? 'rgba(253, 203, 110, 0.15)' : 'rgba(0,184,148,0.1)',
            color: record.isPremium ? '#FDCB6E' : '#00B894',
            border: `1px solid ${record.isPremium ? '#FDCB6E' : '#00B894'}30`,
            borderRadius: 6,
          }}
        >
          {record.isPremium ? 'Premium' : 'Free'}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 48,
      render: (_: unknown, record: ApiCourse) => (
        <Dropdown menu={{ items: getActionItems(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} style={{ color: t.textMuted }} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <PageHeader
        title="Courses"
        subtitle="Manage all courses available on the platform"
        action={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ borderRadius: 10 }}
            onClick={() => setCreateOpen(true)}
          >
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
        </Space>
      </Card>
      <Card className="glass-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredCourses}
            rowKey="id"
            pagination={{
              current: page,
              pageSize: 10,
              total,
              showSizeChanger: false,
              onChange: (p) => setPage(p),
              showTotal: (t2) => <Text style={{ color: t.textMuted }}>{t2} courses total</Text>,
            }}
            size="middle"
          />
        </Spin>
      </Card>

      {/* Create Course Modal */}
      <Modal
        title="Create Course"
        open={createOpen}
        onCancel={() => {
          setCreateOpen(false);
          createForm.resetFields();
        }}
        footer={null}
        width={520}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ isPremium: false, price: 0 }}
          style={{ marginTop: 16 }}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="Course title" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Course description" />
          </Form.Item>
          <Form.Item name="level" label="Level">
            <Select
              placeholder="Select level"
              options={[
                { value: 'beginner', label: 'Beginner' },
                { value: 'intermediate', label: 'Intermediate' },
                { value: 'advanced', label: 'Advanced' },
              ]}
            />
          </Form.Item>
          <Form.Item name="isPremium" label="Premium" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="price" label="Price (in smallest currency unit)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g. 49900 for ₹499" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setCreateOpen(false);
                  createForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={createLoading}>
                Create
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Course Modal */}
      <Modal
        title="Edit Course"
        open={editOpen}
        onCancel={() => {
          setEditOpen(false);
          editForm.resetFields();
          setEditingCourse(null);
        }}
        footer={null}
        width={520}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit} style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Title">
            <Input placeholder="Course title" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Course description" />
          </Form.Item>
          <Form.Item name="level" label="Level">
            <Select
              placeholder="Select level"
              options={[
                { value: 'beginner', label: 'Beginner' },
                { value: 'intermediate', label: 'Intermediate' },
                { value: 'advanced', label: 'Advanced' },
              ]}
            />
          </Form.Item>
          <Form.Item name="isPremium" label="Premium" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="isPublished" label="Published" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="price" label="Price (in smallest currency unit)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g. 49900 for ₹499" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setEditOpen(false);
                  editForm.resetFields();
                  setEditingCourse(null);
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={editLoading}>
                Save
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
