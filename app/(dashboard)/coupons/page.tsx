'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Card,
  Button,
  Tag,
  Space,
  Select,
  Typography,
  message,
  Spin,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Popconfirm,
  DatePicker,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/shared/PageHeader';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import { couponService, type CouponData } from '@/lib/services/coupon';
import { courseService } from '@/lib/services/course';
import dayjs from 'dayjs';

const { Text } = Typography;

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;
  const [messageApi, contextHolder] = message.useMessage();
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);

  // Courses for dropdown — paginate through all pages (backend limit = 50)
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const all: Array<{ id: string; title: string }> = [];
      let page = 1;
      while (true) {
        const res = await courseService.listCourses({ page, limit: 50 });
        all.push(...res.courses);
        if (all.length >= res.total) break;
        page++;
      }
      setCourses(all);
    };
    fetchAll().catch(() => {});
  }, []);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm] = Form.useForm();

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm] = Form.useForm();
  const [editingCoupon, setEditingCoupon] = useState<CouponData | null>(null);

  const fetchCoupons = useCallback(
    async (p: number, isActive?: boolean) => {
      setLoading(true);
      try {
        const result = await couponService.listCoupons({
          page: p,
          limit: pageSize,
          isActive,
        });
        setCoupons(result.coupons);
        setTotal(result.total);
      } catch {
        messageApi.error('Failed to load coupons');
      } finally {
        setLoading(false);
      }
    },
    [messageApi],
  );

  useEffect(() => {
    fetchCoupons(page, activeFilter);
  }, [page, activeFilter, fetchCoupons]);

  const handleCreate = async (values: {
    code: string;
    discountPercent: number;
    courseId?: string;
    maxUses?: number;
    expiresAt?: ReturnType<typeof dayjs>;
  }) => {
    setCreateLoading(true);
    try {
      await couponService.createCoupon({
        code: values.code,
        discountPercent: values.discountPercent,
        courseId: values.courseId || null,
        maxUses: values.maxUses || null,
        expiresAt: values.expiresAt ? values.expiresAt.toISOString() : null,
      });
      messageApi.success('Coupon created successfully');
      setCreateOpen(false);
      createForm.resetFields();
      fetchCoupons(page, activeFilter);
    } catch {
      messageApi.error('Failed to create coupon');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = async (values: {
    isActive?: boolean;
    maxUses?: number;
    expiresAt?: ReturnType<typeof dayjs>;
  }) => {
    if (!editingCoupon) return;
    setEditLoading(true);
    try {
      await couponService.updateCoupon(editingCoupon.id, {
        isActive: values.isActive,
        maxUses: values.maxUses || null,
        expiresAt: values.expiresAt ? values.expiresAt.toISOString() : null,
      });
      messageApi.success('Coupon updated successfully');
      setEditOpen(false);
      editForm.resetFields();
      setEditingCoupon(null);
      fetchCoupons(page, activeFilter);
    } catch {
      messageApi.error('Failed to update coupon');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await couponService.deleteCoupon(id);
      messageApi.success('Coupon deleted');
      fetchCoupons(page, activeFilter);
    } catch {
      messageApi.error('Failed to delete coupon');
    }
  };

  const openEdit = (record: CouponData) => {
    setEditingCoupon(record);
    editForm.setFieldsValue({
      isActive: record.isActive,
      maxUses: record.maxUses,
      expiresAt: record.expiresAt ? dayjs(record.expiresAt) : undefined,
    });
    setEditOpen(true);
  };

  const columns = [
    {
      title: 'Code',
      key: 'code',
      render: (_: unknown, record: CouponData) => (
        <Text
          strong
          style={{
            color: '#6C5CE7',
            fontFamily: 'monospace',
            fontSize: 13,
            letterSpacing: 1,
          }}
        >
          {record.code}
        </Text>
      ),
    },
    {
      title: 'Discount',
      key: 'discountPercent',
      render: (_: unknown, record: CouponData) => (
        <Tag
          style={{
            background: 'rgba(0, 184, 148, 0.1)',
            color: '#00B894',
            border: '1px solid rgba(0, 184, 148, 0.2)',
            borderRadius: 6,
            fontWeight: 600,
          }}
        >
          {record.discountPercent}% OFF
        </Tag>
      ),
    },
    {
      title: 'Course',
      key: 'courseId',
      render: (_: unknown, record: CouponData) => {
        if (!record.courseId) {
          return (
            <Tag
              style={{
                background: 'rgba(108, 92, 231, 0.1)',
                color: '#6C5CE7',
                border: '1px solid rgba(108, 92, 231, 0.2)',
                borderRadius: 6,
              }}
            >
              Global
            </Tag>
          );
        }
        const course = courses.find((c) => c.id === record.courseId);
        return (
          <Text style={{ color: t.textMuted, fontSize: 13 }}>
            {course ? (
              course.title
            ) : (
              <span style={{ fontFamily: 'monospace' }}>{record.courseId.slice(0, 8)}...</span>
            )}
          </Text>
        );
      },
    },
    {
      title: 'Uses',
      key: 'uses',
      render: (_: unknown, record: CouponData) => (
        <Text style={{ color: t.textPrimary }}>
          {record.usedCount}
          {record.maxUses !== null ? ` / ${record.maxUses}` : ' / ∞'}
        </Text>
      ),
    },
    {
      title: 'Expires',
      key: 'expiresAt',
      render: (_: unknown, record: CouponData) => {
        if (!record.expiresAt) {
          return <Text style={{ color: t.textMuted, fontSize: 13 }}>Never</Text>;
        }
        const expired = new Date(record.expiresAt) < new Date();
        return (
          <Text
            style={{
              color: expired ? '#FF7675' : t.textMuted,
              fontSize: 13,
            }}
          >
            {new Date(record.expiresAt).toLocaleDateString()}
            {expired && ' (Expired)'}
          </Text>
        );
      },
    },
    {
      title: 'Active',
      key: 'isActive',
      render: (_: unknown, record: CouponData) =>
        record.isActive ? (
          <CheckCircleOutlined style={{ color: '#00B894', fontSize: 18 }} />
        ) : (
          <CloseCircleOutlined style={{ color: '#FF7675', fontSize: 18 }} />
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: CouponData) => (
        <Space size={8}>
          <Tooltip title="Edit">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
              style={{ borderRadius: 6 }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this coupon?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
          >
            <Tooltip title="Delete">
              <Button size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 6 }} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <PageHeader
        title="Coupons"
        subtitle="Manage discount coupons for courses"
        action={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ borderRadius: 10 }}
            onClick={() => setCreateOpen(true)}
          >
            Create Coupon
          </Button>
        }
      />
      <Card
        className="glass-card"
        style={{ borderRadius: 14, marginBottom: 20 }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Space size={12} wrap>
          <Select
            placeholder="Filter by status"
            allowClear
            value={activeFilter === undefined ? undefined : activeFilter ? 'active' : 'inactive'}
            onChange={(val) => {
              setActiveFilter(val === 'active' ? true : val === 'inactive' ? false : undefined);
              setPage(1);
            }}
            style={{ width: 180 }}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TagOutlined style={{ color: t.textMuted }} />
            <Text style={{ color: t.textMuted }}>{total} total coupons</Text>
          </div>
        </Space>
      </Card>
      <Card className="glass-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={coupons}
            rowKey="id"
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: false,
              onChange: (p) => setPage(p),
              showTotal: (t2) => <Text style={{ color: t.textMuted }}>{t2} coupons total</Text>,
            }}
            size="middle"
          />
        </Spin>
      </Card>

      {/* Create Coupon Modal */}
      <Modal
        title="Create Coupon"
        open={createOpen}
        onCancel={() => {
          setCreateOpen(false);
          createForm.resetFields();
        }}
        footer={null}
        width={480}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate} style={{ marginTop: 16 }}>
          <Form.Item
            name="code"
            label="Coupon Code"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input
              placeholder="e.g. SUMMER20"
              style={{ textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: 1 }}
            />
          </Form.Item>
          <Form.Item
            name="discountPercent"
            label="Discount Percent"
            rules={[{ required: true, message: 'Required' }]}
          >
            <InputNumber min={1} max={100} style={{ width: '100%' }} placeholder="e.g. 20" />
          </Form.Item>
          <Form.Item name="courseId" label="Course (leave blank for global)">
            <Select
              allowClear
              placeholder="Select a course or leave blank for global"
              showSearch
              optionFilterProp="label"
              options={courses.map((c) => ({ value: c.id, label: c.title }))}
            />
          </Form.Item>
          <Form.Item name="maxUses" label="Max Uses (leave blank for unlimited)">
            <InputNumber min={1} style={{ width: '100%' }} placeholder="e.g. 100" />
          </Form.Item>
          <Form.Item name="expiresAt" label="Expiry Date (optional)">
            <DatePicker style={{ width: '100%' }} />
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

      {/* Edit Coupon Modal */}
      <Modal
        title={`Edit Coupon: ${editingCoupon?.code || ''}`}
        open={editOpen}
        onCancel={() => {
          setEditOpen(false);
          editForm.resetFields();
          setEditingCoupon(null);
        }}
        footer={null}
        width={480}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit} style={{ marginTop: 16 }}>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="maxUses" label="Max Uses (leave blank for unlimited)">
            <InputNumber min={1} style={{ width: '100%' }} placeholder="e.g. 100" />
          </Form.Item>
          <Form.Item name="expiresAt" label="Expiry Date (optional)">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setEditOpen(false);
                  editForm.resetFields();
                  setEditingCoupon(null);
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
