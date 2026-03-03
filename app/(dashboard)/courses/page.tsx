'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  DeleteOutlined,
  PictureOutlined,
  CloseCircleFilled,
} from '@ant-design/icons';
import PageHeader from '@/components/shared/PageHeader';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import { LEVEL_COLORS } from '@/lib/constants';
import { courseService } from '@/lib/services/course';

const { Text } = Typography;

interface ApiCourse {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
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
  const [createThumbFile, setCreateThumbFile] = useState<File | null>(null);
  const [createThumbPreview, setCreateThumbPreview] = useState<string | null>(null);
  const createThumbRef = useRef<HTMLInputElement>(null);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm] = Form.useForm();
  const [editingCourse, setEditingCourse] = useState<ApiCourse | null>(null);
  const [editThumbFile, setEditThumbFile] = useState<File | null>(null);
  const [editThumbPreview, setEditThumbPreview] = useState<string | null>(null);
  const editThumbRef = useRef<HTMLInputElement>(null);

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

  const pickThumb = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setPreview: (p: string | null) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      messageApi.error('Image must be under 5 MB');
      return;
    }
    setFile(file);
    setPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleCreate = async (values: {
    title: string;
    description?: string;
    level?: string;
    isPremium: boolean;
    price?: number;
  }) => {
    setCreateLoading(true);
    try {
      const created = await courseService.createCourse({
        title: values.title,
        description: values.description,
        level: values.level,
        isPremium: values.isPremium,
        price: values.price,
      });
      if (createThumbFile) {
        await courseService.uploadThumbnail(created.id, createThumbFile);
      }
      messageApi.success('Course created successfully');
      setCreateOpen(false);
      createForm.resetFields();
      setCreateThumbFile(null);
      setCreateThumbPreview(null);
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
      if (editThumbFile) {
        await courseService.uploadThumbnail(editingCourse.id, editThumbFile);
      }
      messageApi.success('Course updated successfully');
      setEditOpen(false);
      editForm.resetFields();
      setEditingCourse(null);
      setEditThumbFile(null);
      setEditThumbPreview(null);
      fetchCourses(page);
    } catch {
      messageApi.error('Failed to update course');
    } finally {
      setEditLoading(false);
    }
  };

  const openEdit = (record: ApiCourse) => {
    setEditingCourse(record);
    setEditThumbFile(null);
    setEditThumbPreview(null);
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

  const handleDelete = (id: string) => {
    courseService
      .deleteCourse(id)
      .then(() => {
        messageApi.success('Course deleted');
        fetchCourses(page);
      })
      .catch(() => messageApi.error('Failed to delete course'));
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
    { type: 'divider' as const, key: 'div' },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete Course',
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: 'Delete this course?',
          content: 'All lessons, content and progress will be permanently removed.',
          okText: 'Delete',
          okButtonProps: { danger: true },
          cancelText: 'Cancel',
          onOk: () => handleDelete(record.id),
        });
      },
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
      title: 'Published',
      key: 'status',
      render: (_: unknown, record: ApiCourse) => (
        <Switch
          checked={record.isPublished}
          checkedChildren="Live"
          unCheckedChildren="Draft"
          onChange={async (checked) => {
            try {
              await courseService.updateCourse(record.id, { isPublished: checked });
              setCourses((prev) =>
                prev.map((c) => (c.id === record.id ? { ...c, isPublished: checked } : c)),
              );
              messageApi.success(checked ? 'Course published' : 'Course unpublished');
            } catch {
              messageApi.error('Failed to update status');
            }
          }}
        />
      ),
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
      <input
        ref={createThumbRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => pickThumb(e, setCreateThumbFile, setCreateThumbPreview)}
      />
      <Modal
        title="Create Course"
        open={createOpen}
        onCancel={() => {
          setCreateOpen(false);
          createForm.resetFields();
          setCreateThumbFile(null);
          setCreateThumbPreview(null);
        }}
        footer={null}
        width={560}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ isPremium: false, price: 0 }}
          style={{ marginTop: 16 }}
        >
          {/* Thumbnail upload */}
          <Form.Item label="Thumbnail">
            <div
              onClick={() => createThumbRef.current?.click()}
              style={{
                width: '100%',
                height: 140,
                borderRadius: 10,
                border: '1.5px dashed #d9d9d9',
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fafafa',
                position: 'relative',
              }}
            >
              {createThumbPreview ? (
                <>
                  <img
                    src={createThumbPreview}
                    alt="thumbnail"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCreateThumbFile(null);
                      setCreateThumbPreview(null);
                    }}
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#fff',
                      fontSize: 18,
                      lineHeight: 1,
                    }}
                  >
                    <CloseCircleFilled
                      style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
                    />
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#8c8c8c' }}>
                  <PictureOutlined style={{ fontSize: 28, marginBottom: 8, display: 'block' }} />
                  <div style={{ fontSize: 13 }}>Click to upload thumbnail</div>
                  <div style={{ fontSize: 11, color: '#bfbfbf', marginTop: 2 }}>
                    JPG, PNG · max 5 MB
                  </div>
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="Course title" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Course description" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
            <Form.Item name="price" label="Price (₹)">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g. 499" />
            </Form.Item>
          </div>
          <Form.Item name="isPremium" label="Premium" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setCreateOpen(false);
                  createForm.resetFields();
                  setCreateThumbFile(null);
                  setCreateThumbPreview(null);
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
      <input
        ref={editThumbRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => pickThumb(e, setEditThumbFile, setEditThumbPreview)}
      />
      <Modal
        title="Edit Course"
        open={editOpen}
        onCancel={() => {
          setEditOpen(false);
          editForm.resetFields();
          setEditingCourse(null);
          setEditThumbFile(null);
          setEditThumbPreview(null);
        }}
        footer={null}
        width={560}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit} style={{ marginTop: 16 }}>
          {/* Thumbnail upload */}
          <Form.Item label="Thumbnail">
            <div
              onClick={() => editThumbRef.current?.click()}
              style={{
                width: '100%',
                height: 140,
                borderRadius: 10,
                border: '1.5px dashed #d9d9d9',
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fafafa',
                position: 'relative',
              }}
            >
              {editThumbPreview || editingCourse?.thumbnailUrl ? (
                <>
                  <img
                    src={editThumbPreview ?? editingCourse?.thumbnailUrl ?? ''}
                    alt="thumbnail"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {editThumbPreview && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditThumbFile(null);
                        setEditThumbPreview(null);
                      }}
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#fff',
                        fontSize: 18,
                        lineHeight: 1,
                      }}
                    >
                      <CloseCircleFilled
                        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
                      />
                    </button>
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'rgba(0,0,0,0.45)',
                      color: '#fff',
                      fontSize: 11,
                      textAlign: 'center',
                      padding: '4px 0',
                    }}
                  >
                    {editThumbPreview
                      ? 'New thumbnail selected — click to change'
                      : 'Current thumbnail — click to replace'}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#8c8c8c' }}>
                  <PictureOutlined style={{ fontSize: 28, marginBottom: 8, display: 'block' }} />
                  <div style={{ fontSize: 13 }}>Click to upload thumbnail</div>
                  <div style={{ fontSize: 11, color: '#bfbfbf', marginTop: 2 }}>
                    JPG, PNG · max 5 MB
                  </div>
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item name="title" label="Title">
            <Input placeholder="Course title" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Course description" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
            <Form.Item name="price" label="Price (₹)">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g. 499" />
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="isPremium" label="Premium" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="isPublished" label="Published" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setEditOpen(false);
                  editForm.resetFields();
                  setEditingCourse(null);
                  setEditThumbFile(null);
                  setEditThumbPreview(null);
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
