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
  Avatar,
  Modal,
  Input,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FlagOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/shared/PageHeader';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import { STATUS_COLORS } from '@/lib/constants';
import { adminService } from '@/lib/services/admin';

const { Text } = Typography;
const { TextArea } = Input;

interface ReportUser {
  id: string;
  email: string;
  profile?: { displayName: string | null; avatarUrl: string | null } | null;
}

interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  reporter?: ReportUser;
  reported?: ReportUser;
  reason: string;
  description: string | null;
  adminNote: string | null;
  status: string;
  createdAt: string;
}

function UserCell({ user, id }: { user?: ReportUser; id: string }) {
  const name = user?.profile?.displayName || user?.email?.split('@')[0] || id.slice(0, 8) + '…';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Avatar
        size={30}
        src={user?.profile?.avatarUrl || undefined}
        icon={<UserOutlined />}
        style={{ background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)', flexShrink: 0 }}
      />
      <div>
        <Text strong style={{ fontSize: 13, display: 'block' }}>
          {name}
        </Text>
        {user?.email && <Text style={{ fontSize: 11, color: '#999' }}>{user.email}</Text>}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;
  const [messageApi, contextHolder] = message.useMessage();
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);

  // Action modal
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    reportId: string;
    action: 'reviewed' | 'dismissed';
    reportedName: string;
  } | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = useCallback(
    async (p: number, status?: string) => {
      setLoading(true);
      try {
        const result = await adminService.listReports({ page: p, limit: pageSize, status });
        setReports(result.reports as Report[]);
        setTotal(result.total);
      } catch {
        messageApi.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    },
    [messageApi],
  );

  useEffect(() => {
    fetchReports(page, statusFilter);
  }, [page, statusFilter, fetchReports]);

  const openActionModal = (report: Report, action: 'reviewed' | 'dismissed') => {
    const name =
      report.reported?.profile?.displayName || report.reported?.email?.split('@')[0] || 'this user';
    setAdminNote('');
    setActionModal({ open: true, reportId: report.id, action, reportedName: name });
  };

  const handleConfirmAction = async () => {
    if (!actionModal) return;
    setActionLoading(true);
    try {
      await adminService.updateReport(actionModal.reportId, actionModal.action, adminNote);
      messageApi.success(`Report ${actionModal.action}`);
      setActionModal(null);
      fetchReports(page, statusFilter);
    } catch {
      messageApi.error('Failed to update report');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      title: 'Reporter',
      key: 'reporter',
      render: (_: unknown, record: Report) => (
        <UserCell user={record.reporter} id={record.reporterId} />
      ),
    },
    {
      title: 'Reported User',
      key: 'reported',
      render: (_: unknown, record: Report) => (
        <UserCell user={record.reported} id={record.reportedId} />
      ),
    },
    {
      title: 'Reason',
      key: 'reason',
      render: (_: unknown, record: Report) => (
        <div>
          <Tag
            style={{
              background: 'rgba(255, 118, 117, 0.1)',
              color: '#FF7675',
              border: '1px solid rgba(255, 118, 117, 0.2)',
              borderRadius: 6,
              textTransform: 'capitalize' as const,
            }}
          >
            {record.reason.replace('_', ' ')}
          </Tag>
          {record.description && (
            <Text style={{ color: t.textMuted, fontSize: 12, display: 'block', marginTop: 4 }}>
              {record.description.length > 60
                ? `${record.description.slice(0, 60)}...`
                : record.description}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Status / Admin Note',
      key: 'status',
      render: (_: unknown, record: Report) => {
        const color = STATUS_COLORS[record.status] || '#9D9DB5';
        return (
          <div>
            <Tag
              style={{
                background: `${color}18`,
                color,
                border: `1px solid ${color}30`,
                borderRadius: 6,
                textTransform: 'capitalize' as const,
              }}
            >
              {record.status}
            </Tag>
            {record.adminNote && (
              <Text
                style={{
                  color: t.textSecondary,
                  fontSize: 12,
                  display: 'block',
                  marginTop: 4,
                  fontStyle: 'italic',
                }}
              >
                &ldquo;{record.adminNote}&rdquo;
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: 'Date',
      key: 'createdAt',
      render: (_: unknown, record: Report) => (
        <Text style={{ color: t.textMuted, fontSize: 13 }}>
          {new Date(record.createdAt).toLocaleDateString()}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_: unknown, record: Report) => {
        if (record.status !== 'pending') {
          return (
            <Text style={{ color: t.textMuted, fontSize: 12, textTransform: 'capitalize' }}>
              {record.status}
            </Text>
          );
        }
        return (
          <Space size={8}>
            <Button
              size="small"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => openActionModal(record, 'reviewed')}
              style={{ background: '#00B894', border: 'none', borderRadius: 6 }}
            >
              Review
            </Button>
            <Button
              size="small"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => openActionModal(record, 'dismissed')}
              style={{ borderRadius: 6 }}
            >
              Dismiss
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      {contextHolder}
      <PageHeader
        title="Reports"
        subtitle="Review and manage user reports on the platform"
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FlagOutlined style={{ color: '#FF7675', fontSize: 18 }} />
            <Text style={{ color: t.textMuted }}>{total} total reports</Text>
          </div>
        }
      />
      <Card
        className="glass-card"
        style={{ borderRadius: 14, marginBottom: 20 }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Select
          placeholder="Filter by status"
          allowClear
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
          style={{ width: 180 }}
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'reviewed', label: 'Reviewed' },
            { value: 'dismissed', label: 'Dismissed' },
          ]}
        />
      </Card>
      <Card className="glass-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={reports}
            rowKey="id"
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: false,
              onChange: (p) => setPage(p),
              showTotal: (t2) => <Text style={{ color: t.textMuted }}>{t2} reports total</Text>,
            }}
            size="middle"
          />
        </Spin>
      </Card>

      {/* Action Modal */}
      <Modal
        open={!!actionModal?.open}
        onCancel={() => setActionModal(null)}
        onOk={handleConfirmAction}
        confirmLoading={actionLoading}
        okText={actionModal?.action === 'reviewed' ? 'Mark as Reviewed' : 'Dismiss Report'}
        okButtonProps={{
          style: {
            background: actionModal?.action === 'reviewed' ? '#00B894' : undefined,
            borderColor: actionModal?.action === 'reviewed' ? '#00B894' : undefined,
          },
          danger: actionModal?.action === 'dismissed',
        }}
        title={
          <Space>
            <ExclamationCircleOutlined
              style={{ color: actionModal?.action === 'reviewed' ? '#00B894' : '#FF7675' }}
            />
            <span>
              {actionModal?.action === 'reviewed' ? 'Review' : 'Dismiss'} report against{' '}
              <strong>{actionModal?.reportedName}</strong>
            </span>
          </Space>
        }
        width={480}
        destroyOnClose
      >
        <div style={{ paddingTop: 8 }}>
          <Text style={{ color: t.textMuted, fontSize: 13, display: 'block', marginBottom: 12 }}>
            Add a note explaining your decision. This will be visible to the reporter.
          </Text>
          <TextArea
            rows={4}
            placeholder={
              actionModal?.action === 'reviewed'
                ? 'e.g. We reviewed this report and took appropriate action...'
                : 'e.g. This report does not violate our community guidelines...'
            }
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            maxLength={500}
            showCount
            style={{ borderRadius: 8 }}
          />
        </div>
      </Modal>
    </div>
  );
}
