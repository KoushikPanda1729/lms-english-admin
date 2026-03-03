'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Switch, Space, Popconfirm, message, Tooltip } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { onboardingService, OnboardingQuestion } from '@/lib/services/onboarding';
import PageHeader from '@/components/shared/PageHeader';

const LEVEL_TAGS = [
  { value: 'beginner', label: 'Beginner', color: '#00B894' },
  { value: 'elementary', label: 'Elementary', color: '#74B9FF' },
  { value: 'intermediate', label: 'Intermediate', color: '#FDCB6E' },
  { value: 'advanced', label: 'Advanced', color: '#FF7675' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      setQuestions(await onboardingService.list());
    } catch {
      messageApi.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleToggleActive = async (q: OnboardingQuestion) => {
    try {
      await onboardingService.update(q.id, { isActive: !q.isActive });
      setQuestions((prev) =>
        prev.map((item) => (item.id === q.id ? { ...item, isActive: !item.isActive } : item)),
      );
    } catch {
      messageApi.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onboardingService.delete(id);
      messageApi.success('Question deleted');
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch {
      messageApi.error('Failed to delete question');
    }
  };

  const columns = [
    {
      title: '#',
      dataIndex: 'sortOrder',
      width: 60,
      sorter: (a: OnboardingQuestion, b: OnboardingQuestion) => a.sortOrder - b.sortOrder,
    },
    {
      title: 'Question',
      dataIndex: 'question',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Options',
      dataIndex: 'options',
      width: 80,
      render: (opts: string[]) => <span className="text-zinc-500">{opts.length} opts</span>,
    },
    {
      title: 'Level',
      dataIndex: 'levelTag',
      width: 130,
      render: (level: string) => {
        const lvl = LEVEL_TAGS.find((l) => l.value === level);
        return (
          <span
            style={{
              display: 'inline-block',
              background: lvl?.color ?? '#d1d5db',
              color: '#fff',
              borderRadius: 6,
              padding: '2px 10px',
              fontSize: 12,
              fontWeight: 600,
              lineHeight: '20px',
            }}
          >
            {lvl?.label ?? level}
          </span>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      width: 90,
      render: (active: boolean, record: OnboardingQuestion) => (
        <Switch
          checked={active}
          onChange={() => handleToggleActive(record)}
          checkedChildren={<CheckCircleOutlined />}
          unCheckedChildren={<CloseCircleOutlined />}
          size="small"
        />
      ),
    },
    {
      title: 'Actions',
      width: 110,
      render: (_: unknown, record: OnboardingQuestion) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => router.push(`/onboarding/${record.id}/edit`)}
          />
          <Popconfirm
            title="Delete this question?"
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {contextHolder}
      <PageHeader
        title="Onboarding Questions"
        subtitle="Manage the English level test questions shown during user onboarding."
        action={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/onboarding/new')}
            style={{
              background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
              border: 'none',
              borderRadius: 8,
            }}
          >
            Add Question
          </Button>
        }
      />

      <Table
        dataSource={questions}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
        style={{ marginTop: 24 }}
      />
    </div>
  );
}
