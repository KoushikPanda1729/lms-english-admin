'use client';

import { useState, useRef } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Radio,
  Select,
  Typography,
  message,
  Table,
  Tag,
  Space,
  Empty,
} from 'antd';
import { BellOutlined, SendOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import PageHeader from '@/components/shared/PageHeader';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import { notificationService } from '@/lib/services/notification';
import { adminService } from '@/lib/services/admin';

const { Text, Title } = Typography;
const { TextArea } = Input;

type TargetType = 'all' | 'user';

interface UserOption {
  value: string;
  label: string;
}

interface SentNotification {
  id: string;
  title: string;
  body: string;
  target: string;
  sentAt: string;
  status: 'sent' | 'failed';
}

const TARGET_OPTIONS = [
  { value: 'all', label: 'All Users', icon: <TeamOutlined /> },
  { value: 'user', label: 'Specific Users', icon: <UserOutlined /> },
];

export default function NotificationsPage() {
  const [form] = Form.useForm();
  const [targetType, setTargetType] = useState<TargetType>('all');
  const [sending, setSending] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [sentHistory, setSentHistory] = useState<SentNotification[]>([]);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);

  const searchUsers = (query: string) => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (!query.trim()) {
      setUserOptions([]);
      return;
    }
    searchDebounce.current = setTimeout(async () => {
      setUserSearchLoading(true);
      try {
        const result = await adminService.listUsers({ page: 1, limit: 20, search: query });
        setUserOptions(
          result.users.map((u) => ({
            value: u.user.id,
            label: u.user.email,
          })),
        );
      } catch {
        setUserOptions([]);
      } finally {
        setUserSearchLoading(false);
      }
    }, 300);
  };

  const handleSend = async (values: {
    title: string;
    body: string;
    targetType: TargetType;
    userIds?: string[];
  }) => {
    setSending(true);
    try {
      const result = await notificationService.send({
        target: values.targetType,
        userIds: values.targetType === 'user' ? values.userIds : undefined,
        title: values.title,
        body: values.body,
      });

      const selectedEmails =
        values.targetType === 'user' && values.userIds
          ? values.userIds
              .map((id) => userOptions.find((o) => o.value === id)?.label ?? id)
              .join(', ')
          : null;

      const targetLabel =
        values.targetType === 'all' ? 'All Users' : `${result.sent} user(s): ${selectedEmails}`;

      setSentHistory((prev) => [
        {
          id: Date.now().toString(),
          title: values.title,
          body: values.body,
          target: targetLabel,
          sentAt: new Date().toISOString(),
          status: 'sent',
        },
        ...prev,
      ]);

      messageApi.success(`Notification sent to ${result.sent} user(s)`);
      form.resetFields();
      setTargetType('all');
      setUserOptions([]);
    } catch {
      messageApi.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (v: string) => (
        <Text strong style={{ color: t.textPrimary }}>
          {v}
        </Text>
      ),
    },
    {
      title: 'Message',
      dataIndex: 'body',
      key: 'body',
      render: (v: string) => (
        <Text style={{ color: t.textSecondary, fontSize: 13 }} ellipsis={{ tooltip: v }}>
          {v}
        </Text>
      ),
    },
    {
      title: 'Target',
      dataIndex: 'target',
      key: 'target',
      render: (v: string) => (
        <Tag
          style={{
            background: 'rgba(108, 92, 231, 0.1)',
            color: '#6C5CE7',
            border: '1px solid rgba(108, 92, 231, 0.2)',
            borderRadius: 6,
            maxWidth: 260,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={v}
        >
          {v}
        </Tag>
      ),
    },
    {
      title: 'Sent At',
      dataIndex: 'sentAt',
      key: 'sentAt',
      render: (v: string) => (
        <Text style={{ color: t.textMuted, fontSize: 13 }}>{new Date(v).toLocaleString()}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => (
        <Tag
          color={v === 'sent' ? 'success' : 'error'}
          style={{ borderRadius: 6, textTransform: 'capitalize' }}
        >
          {v}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <PageHeader title="Notifications" subtitle="Send push notifications to your users" />

      {/* Compose Card */}
      <Card
        className="glass-card"
        style={{ borderRadius: 14, marginBottom: 24 }}
        styles={{ body: { padding: '28px 32px' } }}
      >
        <Space align="center" style={{ marginBottom: 20 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BellOutlined style={{ color: '#fff', fontSize: 18 }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0, color: t.textPrimary }}>
              Compose Notification
            </Title>
            <Text style={{ color: t.textMuted, fontSize: 13 }}>
              Fill in the details and choose who should receive this notification
            </Text>
          </div>
        </Space>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSend}
          initialValues={{ targetType: 'all' }}
        >
          {/* Target type */}
          <Form.Item
            name="targetType"
            label={
              <Text strong style={{ color: t.textSecondary }}>
                Send To
              </Text>
            }
          >
            <Radio.Group
              onChange={(e) => {
                setTargetType(e.target.value);
                form.resetFields(['userIds']);
                setUserOptions([]);
              }}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
            >
              {TARGET_OPTIONS.map((opt) => (
                <Radio.Button
                  key={opt.value}
                  value={opt.value}
                  style={{
                    borderRadius: 10,
                    height: 'auto',
                    padding: '10px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    borderColor: targetType === opt.value ? '#6C5CE7' : undefined,
                  }}
                >
                  <Space size={6}>
                    {opt.icon}
                    <span>{opt.label}</span>
                  </Space>
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>

          {/* Specific users — searchable multi-select with checkboxes */}
          {targetType === 'user' && (
            <Form.Item
              name="userIds"
              label={
                <Text strong style={{ color: t.textSecondary }}>
                  Select Users
                </Text>
              }
              rules={[{ required: true, message: 'Select at least one user' }]}
            >
              <Select
                mode="multiple"
                allowClear
                showSearch
                filterOption={false}
                onSearch={searchUsers}
                loading={userSearchLoading}
                options={userOptions}
                placeholder="Search by email to find users..."
                notFoundContent={
                  userSearchLoading ? (
                    <Text style={{ color: t.textMuted, padding: '8px 12px', display: 'block' }}>
                      Searching...
                    </Text>
                  ) : (
                    <Text style={{ color: t.textMuted, padding: '8px 12px', display: 'block' }}>
                      Type to search users
                    </Text>
                  )
                }
                style={{ width: '100%', minHeight: 44 }}
                maxTagCount="responsive"
              />
            </Form.Item>
          )}

          {/* Title */}
          <Form.Item
            name="title"
            label={
              <Text strong style={{ color: t.textSecondary }}>
                Notification Title
              </Text>
            }
            rules={[{ required: true, message: 'Title is required' }]}
          >
            <Input
              placeholder="e.g. New course available!"
              maxLength={100}
              showCount
              style={{ borderRadius: 10, height: 44 }}
            />
          </Form.Item>

          {/* Body */}
          <Form.Item
            name="body"
            label={
              <Text strong style={{ color: t.textSecondary }}>
                Message
              </Text>
            }
            rules={[{ required: true, message: 'Message is required' }]}
          >
            <TextArea
              placeholder="Write your notification message here..."
              maxLength={300}
              showCount
              rows={4}
              style={{ borderRadius: 10, resize: 'none' }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={sending}
              icon={<SendOutlined />}
              style={{
                height: 46,
                paddingInline: 32,
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
                border: 'none',
                boxShadow: '0 6px 20px rgba(108, 92, 231, 0.35)',
              }}
            >
              Send Notification
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Sent History */}
      <Card
        className="glass-card"
        style={{ borderRadius: 14 }}
        styles={{ body: { padding: 0 } }}
        title={
          <Text strong style={{ color: t.textPrimary, fontSize: 15 }}>
            Sent History
          </Text>
        }
      >
        {sentHistory.length === 0 ? (
          <div style={{ padding: '48px 0' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<Text style={{ color: t.textMuted }}>No notifications sent yet</Text>}
            />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={sentHistory}
            rowKey="id"
            pagination={false}
            size="middle"
          />
        )}
      </Card>
    </div>
  );
}
