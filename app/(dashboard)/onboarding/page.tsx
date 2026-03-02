'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Tag,
  Space,
  Popconfirm,
  message,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { onboardingService, OnboardingQuestion } from '@/lib/services/onboarding';
import PageHeader from '@/components/shared/PageHeader';

const { Option } = Select;
const { TextArea } = Input;

const LEVEL_TAGS = [
  { value: 'beginner', label: 'Beginner', color: '#00B894' },
  { value: 'elementary', label: 'Elementary', color: '#74B9FF' },
  { value: 'intermediate', label: 'Intermediate', color: '#FDCB6E' },
  { value: 'advanced', label: 'Advanced', color: '#FF7675' },
];

type ModalMode = 'create' | 'edit';

export default function OnboardingPage() {
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  // Dynamic list of option inputs (min 2, max 6)
  const [optionCount, setOptionCount] = useState(4);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await onboardingService.list();
      setQuestions(data);
    } catch {
      messageApi.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({ sortOrder: 0, correctIndex: 0, levelTag: 'beginner' });
    setOptionCount(4);
    setModalMode('create');
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (q: OnboardingQuestion) => {
    form.setFieldsValue({
      question: q.question,
      levelTag: q.levelTag,
      correctIndex: q.correctIndex,
      sortOrder: q.sortOrder,
      ...q.options.reduce((acc, opt, i) => ({ ...acc, [`option_${i}`]: opt }), {}),
    });
    setOptionCount(q.options.length);
    setModalMode('edit');
    setEditingId(q.id);
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      await form.validateFields();
    } catch {
      return;
    }

    const values = form.getFieldsValue(true);
    const options: string[] = [];
    for (let i = 0; i < optionCount; i++) {
      options.push(values[`option_${i}`] || '');
    }

    const payload = {
      question: values.question,
      options,
      correctIndex: values.correctIndex,
      levelTag: values.levelTag,
      sortOrder: values.sortOrder ?? 0,
    };

    setSaving(true);
    try {
      if (modalMode === 'create') {
        await onboardingService.create(payload);
        messageApi.success('Question created');
      } else {
        await onboardingService.update(editingId!, payload);
        messageApi.success('Question updated');
      }
      setModalOpen(false);
      fetchQuestions();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to save question';
      messageApi.error(msg);
    } finally {
      setSaving(false);
    }
  };

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
      title: 'Level Tag',
      dataIndex: 'levelTag',
      width: 120,
      render: (level: string) => {
        const lvl = LEVEL_TAGS.find((l) => l.value === level);
        return (
          <Tag color={lvl?.color} style={{ color: '#fff', borderColor: 'transparent' }}>
            {lvl?.label ?? level}
          </Tag>
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
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
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
            onClick={openCreate}
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

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        title={modalMode === 'create' ? 'Add Question' : 'Edit Question'}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText={modalMode === 'create' ? 'Create' : 'Save'}
        confirmLoading={saving}
        width={560}
        destroyOnClose
      >
        <Form form={form} layout="vertical" requiredMark={false} style={{ marginTop: 16 }}>
          <Form.Item
            name="question"
            label="Question"
            rules={[{ required: true, message: 'Enter the question' }]}
          >
            <TextArea rows={3} placeholder="e.g. Which sentence is correct?" />
          </Form.Item>

          {/* Dynamic options */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-700">Answer Options</label>
              <Space>
                <Button
                  size="small"
                  disabled={optionCount <= 2}
                  onClick={() => setOptionCount((n) => n - 1)}
                >
                  −
                </Button>
                <span className="text-sm text-zinc-500">{optionCount}</span>
                <Button
                  size="small"
                  disabled={optionCount >= 6}
                  onClick={() => setOptionCount((n) => n + 1)}
                >
                  +
                </Button>
              </Space>
            </div>
            {Array.from({ length: optionCount }).map((_, i) => (
              <Form.Item
                key={i}
                name={`option_${i}`}
                rules={[{ required: true, message: `Option ${i + 1} is required` }]}
                style={{ marginBottom: 8 }}
              >
                <Input
                  placeholder={`Option ${i + 1}`}
                  prefix={
                    <span className="mr-1 text-xs text-zinc-400">
                      {String.fromCharCode(65 + i)}.
                    </span>
                  }
                />
              </Form.Item>
            ))}
          </div>

          <Form.Item
            name="correctIndex"
            label="Correct Answer (0 = Option A)"
            rules={[{ required: true, message: 'Select the correct answer index' }]}
          >
            <Select>
              {Array.from({ length: optionCount }).map((_, i) => (
                <Option key={i} value={i}>
                  {String.fromCharCode(65 + i)} — Option {i + 1}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="flex gap-4">
            <Form.Item
              name="levelTag"
              label="Level Tag"
              rules={[{ required: true, message: 'Select a level' }]}
              style={{ flex: 1 }}
            >
              <Select>
                {LEVEL_TAGS.map((l) => (
                  <Option key={l.value} value={l.value}>
                    {l.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="sortOrder" label="Sort Order" style={{ width: 120 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
