'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Popconfirm,
  Tooltip,
} from 'antd';
import {
  BellOutlined,
  SendOutlined,
  TeamOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import PageHeader from '@/components/shared/PageHeader';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import { notificationService, type BroadcastRecord } from '@/lib/services/notification';
import { adminService } from '@/lib/services/admin';

dayjs.extend(relativeTime);

const { Text, Title } = Typography;
const { TextArea } = Input;

type TargetType = 'all' | 'user';

interface UserOption {
  value: string;
  label: string;
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
  const [history, setHistory] = useState<BroadcastRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const composeRef = useRef<HTMLDivElement>(null);
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);

  const PAGE_SIZE = 10;
  const USER_PAGE_SIZE = 10;

  const fetchHistory = useCallback(
    async (pg = historyPage) => {
      setHistoryLoading(true);
      try {
        const res = await notificationService.getHistory({ page: pg, limit: PAGE_SIZE });
        setHistory(res.broadcasts);
        setHistoryTotal(res.total);
      } catch {
        // silent
      } finally {
        setHistoryLoading(false);
      }
    },

    [historyPage],
  );

  useEffect(() => {
    fetchHistory(historyPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyPage]);

  const fetchUsers = useCallback(async (page: number, search: string, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setUserSearchLoading(true);
    }
    try {
      const result = await adminService.listUsers({ page, limit: USER_PAGE_SIZE, search });
      const newOptions = result.users.map((u) => ({ value: u.user.id, label: u.user.email }));
      setUserOptions((prev) => (append ? [...prev, ...newOptions] : newOptions));
      setUserTotal(result.total);
      setUserPage(page);
    } catch {
      if (!append) setUserOptions([]);
    } finally {
      setUserSearchLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const searchUsers = (query: string) => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    setUserSearchQuery(query);
    if (!query.trim()) {
      fetchUsers(1, '');
      return;
    }
    searchDebounce.current = setTimeout(() => {
      fetchUsers(1, query);
    }, 300);
  };

  const handleLoadMore = () => {
    fetchUsers(userPage + 1, userSearchQuery, true);
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
      messageApi.success(`Notification sent to ${result.sent} user(s)`);
      form.resetFields();
      setTargetType('all');
      setUserOptions([]);
      setUserPage(1);
      setUserTotal(0);
      setUserSearchQuery('');
      // Refresh history from page 1
      setHistoryPage(1);
      fetchHistory(1);
    } catch {
      messageApi.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleEdit = (record: BroadcastRecord) => {
    form.setFieldsValue({ title: record.title, body: record.body, targetType: 'all' });
    setTargetType('all');
    composeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDelete = async (record: BroadcastRecord) => {
    const key = record.sentAt;
    setDeletingKey(key);
    try {
      await notificationService.deleteBroadcast({
        title: record.title,
        body: record.body,
        sentAt: record.sentAt,
      });
      messageApi.success('Broadcast deleted');
      fetchHistory(historyPage);
    } catch {
      messageApi.error('Failed to delete broadcast');
    } finally {
      setDeletingKey(null);
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
      title: 'Recipients',
      dataIndex: 'recipientCount',
      key: 'recipientCount',
      width: 110,
      render: (v: number) => (
        <Tag
          style={{
            background: 'rgba(108, 92, 231, 0.1)',
            color: '#6C5CE7',
            border: '1px solid rgba(108, 92, 231, 0.2)',
            borderRadius: 6,
          }}
        >
          {v.toLocaleString()} user{v !== 1 ? 's' : ''}
        </Tag>
      ),
    },
    {
      title: 'Sent At',
      dataIndex: 'sentAt',
      key: 'sentAt',
      width: 160,
      render: (v: string) => (
        <Tooltip title={dayjs(v).format('DD MMM YYYY, HH:mm')}>
          <Text style={{ color: t.textMuted, fontSize: 13 }}>{dayjs(v).fromNow()}</Text>
        </Tooltip>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      render: (_: unknown, record: BroadcastRecord) => (
        <Space size={6}>
          <Tooltip title="Edit & resend">
            <Button
              size="small"
              icon={<EditOutlined />}
              style={{ borderRadius: 6 }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this broadcast?"
            description="This removes the notification from all recipients' history."
            onConfirm={() => handleDelete(record)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete broadcast">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                style={{ borderRadius: 6 }}
                loading={deletingKey === record.sentAt}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <PageHeader title="Notifications" subtitle="Send push notifications to your users" />

      {/* Compose Card */}
      <div ref={composeRef}>
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

            {/* Specific users */}
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
                  onDropdownVisibleChange={(open) => {
                    if (open && userOptions.length === 0) {
                      fetchUsers(1, '');
                    }
                  }}
                  loading={userSearchLoading}
                  options={userOptions}
                  placeholder="Search by email to find users..."
                  notFoundContent={
                    <Text style={{ color: t.textMuted, padding: '8px 12px', display: 'block' }}>
                      {userSearchLoading ? 'Searching...' : 'No users found'}
                    </Text>
                  }
                  style={{ width: '100%', minHeight: 44 }}
                  maxTagCount="responsive"
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      {userOptions.length < userTotal && (
                        <div
                          style={{
                            padding: '8px 12px',
                            textAlign: 'center',
                            borderTop: `1px solid ${t.border}`,
                          }}
                        >
                          <Button
                            type="link"
                            size="small"
                            loading={loadingMore}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLoadMore();
                            }}
                            style={{ color: '#6C5CE7', fontSize: 13, fontWeight: 500 }}
                          >
                            See more ({userTotal - userOptions.length} remaining)
                          </Button>
                        </div>
                      )}
                    </>
                  )}
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
      </div>

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
        {!historyLoading && history.length === 0 ? (
          <div style={{ padding: '48px 0' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<Text style={{ color: t.textMuted }}>No notifications sent yet</Text>}
            />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={history}
            rowKey={(r) => `${r.title}-${r.sentAt}`}
            loading={historyLoading}
            pagination={{
              current: historyPage,
              pageSize: PAGE_SIZE,
              total: historyTotal,
              onChange: setHistoryPage,
              showTotal: (t) => `${t} broadcasts`,
              style: { padding: '12px 20px' },
            }}
            size="middle"
          />
        )}
      </Card>
    </div>
  );
}
