'use client';

import { useState, useEffect, useCallback } from 'react';
import { Table, Card, Button, Tag, Space, Select, Typography, message, Spin, Tooltip } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, FlagOutlined } from '@ant-design/icons';
import PageHeader from '@/components/shared/PageHeader';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import { STATUS_COLORS } from '@/lib/constants';
import { adminService } from '@/lib/services/admin';

const { Text } = Typography;

interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;
  const [messageApi, contextHolder] = message.useMessage();
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);

  const fetchReports = useCallback(
    async (p: number, status?: string) => {
      setLoading(true);
      try {
        const result = await adminService.listReports({
          page: p,
          limit: pageSize,
          status: status || undefined,
        });
        setReports(result.reports);
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

  const handleUpdateStatus = async (id: string, status: 'reviewed' | 'dismissed') => {
    setActionLoading(id + status);
    try {
      await adminService.updateReport(id, status);
      messageApi.success(`Report marked as ${status}`);
      fetchReports(page, statusFilter);
    } catch {
      messageApi.error('Failed to update report');
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    {
      title: 'Reporter ID',
      key: 'reporterId',
      render: (_: unknown, record: Report) => (
        <Text style={{ color: t.textMuted, fontSize: 12, fontFamily: 'monospace' }}>
          {record.reporterId.slice(0, 8)}...
        </Text>
      ),
    },
    {
      title: 'Reported ID',
      key: 'reportedId',
      render: (_: unknown, record: Report) => (
        <Text style={{ color: t.textMuted, fontSize: 12, fontFamily: 'monospace' }}>
          {record.reportedId.slice(0, 8)}...
        </Text>
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
            {record.reason}
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
      title: 'Status',
      key: 'status',
      render: (_: unknown, record: Report) => {
        const color = STATUS_COLORS[record.status] || '#9D9DB5';
        return (
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
        );
      },
    },
    {
      title: 'Created At',
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
      width: 160,
      render: (_: unknown, record: Report) => {
        if (record.status !== 'pending') {
          return (
            <Text style={{ color: t.textMuted, fontSize: 12 }}>
              {record.status === 'reviewed' ? 'Reviewed' : 'Dismissed'}
            </Text>
          );
        }
        return (
          <Space size={8}>
            <Tooltip title="Mark as Reviewed">
              <Button
                size="small"
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={actionLoading === record.id + 'reviewed'}
                onClick={() => handleUpdateStatus(record.id, 'reviewed')}
                style={{
                  background: '#00B894',
                  border: 'none',
                  borderRadius: 6,
                }}
              >
                Review
              </Button>
            </Tooltip>
            <Tooltip title="Dismiss">
              <Button
                size="small"
                danger
                icon={<CloseCircleOutlined />}
                loading={actionLoading === record.id + 'dismissed'}
                onClick={() => handleUpdateStatus(record.id, 'dismissed')}
                style={{ borderRadius: 6 }}
              >
                Dismiss
              </Button>
            </Tooltip>
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
        <Space size={12} wrap>
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
        </Space>
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
    </div>
  );
}
