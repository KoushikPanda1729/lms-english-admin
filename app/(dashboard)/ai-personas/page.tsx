'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  Tooltip,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  RobotOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/shared/PageHeader';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import { aiPersonaService, type AIPersona, type AIPersonaStats } from '@/lib/services/ai-persona';
import { LEVEL_COLORS } from '@/lib/constants';

const { Text } = Typography;
const { TextArea } = Input;

export default function AIPersonasPage() {
  const [personas, setPersonas] = useState<AIPersona[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AIPersonaStats | null>(null);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [difficultyFilter, setDifficultyFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;
  const [messageApi, contextHolder] = message.useMessage();
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm] = Form.useForm();
  const [createAvatarFile, setCreateAvatarFile] = useState<File | null>(null);
  const [createAvatarPreview, setCreateAvatarPreview] = useState<string | null>(null);
  const createAvatarInputRef = useRef<HTMLInputElement>(null);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm] = Form.useForm();
  const [editingPersona, setEditingPersona] = useState<AIPersona | null>(null);
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  const editAvatarInputRef = useRef<HTMLInputElement>(null);

  const fetchPersonas = useCallback(
    async (p: number, isActive?: boolean, difficulty?: string) => {
      setLoading(true);
      try {
        const result = await aiPersonaService.listPersonas({
          page: p,
          limit: pageSize,
          isActive,
          difficulty,
        });
        setPersonas(result.personas);
        setTotal(result.total);
      } catch {
        messageApi.error('Failed to load personas');
      } finally {
        setLoading(false);
      }
    },
    [messageApi],
  );

  const fetchStats = useCallback(async () => {
    try {
      const result = await aiPersonaService.getStats();
      setStats(result);
    } catch {
      // stats are non-critical
    }
  }, []);

  useEffect(() => {
    fetchPersonas(page, activeFilter, difficultyFilter);
  }, [page, activeFilter, difficultyFilter, fetchPersonas]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const pickAvatar = (
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

  const handleSeed = async () => {
    try {
      const result = await aiPersonaService.seedPersonas();
      messageApi.success(`Seeded: ${result.created} created, ${result.skipped} skipped`);
      fetchPersonas(page, activeFilter, difficultyFilter);
      fetchStats();
    } catch {
      messageApi.error('Failed to seed personas');
    }
  };

  const handleCreate = async (values: {
    name: string;
    expertise: string;
    description: string;
    systemPrompt: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    isPremium: boolean;
    sortOrder: number;
  }) => {
    setCreateLoading(true);
    try {
      const persona = await aiPersonaService.createPersona({ ...values, avatar: '🤖' });
      if (createAvatarFile) {
        await aiPersonaService.uploadAvatar(persona.id, createAvatarFile);
      }
      messageApi.success('Persona created');
      setCreateOpen(false);
      createForm.resetFields();
      setCreateAvatarFile(null);
      setCreateAvatarPreview(null);
      fetchPersonas(page, activeFilter, difficultyFilter);
      fetchStats();
    } catch {
      messageApi.error('Failed to create persona');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = async (values: Partial<AIPersona>) => {
    if (!editingPersona) return;
    setEditLoading(true);
    try {
      await aiPersonaService.updatePersona(editingPersona.id, values);
      if (editAvatarFile) {
        await aiPersonaService.uploadAvatar(editingPersona.id, editAvatarFile);
      }
      messageApi.success('Persona updated');
      setEditOpen(false);
      editForm.resetFields();
      setEditingPersona(null);
      setEditAvatarFile(null);
      setEditAvatarPreview(null);
      fetchPersonas(page, activeFilter, difficultyFilter);
    } catch {
      messageApi.error('Failed to update persona');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await aiPersonaService.deletePersona(id);
      messageApi.success('Persona deleted');
      fetchPersonas(page, activeFilter, difficultyFilter);
      fetchStats();
    } catch {
      messageApi.error('Failed to delete persona');
    }
  };

  const openEdit = (record: AIPersona) => {
    setEditingPersona(record);
    setEditAvatarFile(null);
    setEditAvatarPreview(null);
    editForm.setFieldsValue({
      name: record.name,
      expertise: record.expertise,
      description: record.description,
      systemPrompt: record.systemPrompt,
      difficulty: record.difficulty,
      isPremium: record.isPremium,
      isActive: record.isActive,
      sortOrder: record.sortOrder,
    });
    setEditOpen(true);
  };

  const columns = [
    {
      title: 'Persona',
      key: 'persona',
      render: (_: unknown, record: AIPersona) => (
        <Space>
          {record.avatar.startsWith('http') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={record.avatar}
              alt={record.name}
              style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: 24 }}>{record.avatar}</span>
          )}
          <div>
            <Text strong style={{ color: t.textPrimary, display: 'block' }}>
              {record.name}
            </Text>
            <Text style={{ color: t.textMuted, fontSize: 12 }}>{record.expertise}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Difficulty',
      key: 'difficulty',
      render: (_: unknown, record: AIPersona) => (
        <Tag
          style={{
            background: `${LEVEL_COLORS[record.difficulty]}20`,
            color: LEVEL_COLORS[record.difficulty],
            border: `1px solid ${LEVEL_COLORS[record.difficulty]}40`,
            borderRadius: 6,
            fontWeight: 600,
            textTransform: 'capitalize',
          }}
        >
          {record.difficulty}
        </Tag>
      ),
    },
    {
      title: 'Premium',
      key: 'isPremium',
      render: (_: unknown, record: AIPersona) =>
        record.isPremium ? (
          <Tag color="gold" style={{ borderRadius: 6 }}>
            Premium
          </Tag>
        ) : (
          <Tag style={{ borderRadius: 6 }}>Free</Tag>
        ),
    },
    {
      title: 'Active',
      key: 'isActive',
      render: (_: unknown, record: AIPersona) =>
        record.isActive ? (
          <CheckCircleOutlined style={{ color: '#00B894', fontSize: 18 }} />
        ) : (
          <CloseCircleOutlined style={{ color: '#FF7675', fontSize: 18 }} />
        ),
    },
    {
      title: 'Uses',
      key: 'usageCount',
      render: (_: unknown, record: AIPersona) => (
        <Text style={{ color: t.textPrimary }}>{record.usageCount.toLocaleString()}</Text>
      ),
    },
    {
      title: 'Order',
      key: 'sortOrder',
      render: (_: unknown, record: AIPersona) => (
        <Text style={{ color: t.textMuted }}>{record.sortOrder}</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: AIPersona) => (
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
            title="Delete this persona?"
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
        title="AI Personas"
        subtitle="Manage AI conversation personas for users"
        action={
          <Space>
            <Button icon={<DatabaseOutlined />} onClick={handleSeed} style={{ borderRadius: 10 }}>
              Seed Defaults
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateOpen(true)}
              style={{ borderRadius: 10 }}
            >
              Create Persona
            </Button>
          </Space>
        }
      />

      {/* Stats */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={6}>
            <Card className="glass-card" style={{ borderRadius: 14 }}>
              <Statistic
                title={<Text style={{ color: t.textMuted }}>Total Sessions</Text>}
                value={stats.totalSessions}
                prefix={<ThunderboltOutlined style={{ color: '#6C5CE7' }} />}
                valueStyle={{ color: t.textPrimary }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="glass-card" style={{ borderRadius: 14 }}>
              <Statistic
                title={<Text style={{ color: t.textMuted }}>Total Personas</Text>}
                value={stats.totalPersonas}
                prefix={<RobotOutlined style={{ color: '#00B894' }} />}
                valueStyle={{ color: t.textPrimary }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="glass-card" style={{ borderRadius: 14 }}>
              <Statistic
                title={<Text style={{ color: t.textMuted }}>Active Personas</Text>}
                value={stats.activePersonas}
                prefix={<CheckCircleOutlined style={{ color: '#00B894' }} />}
                valueStyle={{ color: t.textPrimary }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="glass-card" style={{ borderRadius: 14 }}>
              <Text style={{ color: t.textMuted, fontSize: 12, display: 'block', marginBottom: 8 }}>
                Top Persona
              </Text>
              {stats.topPersonas[0] ? (
                <>
                  <Text strong style={{ color: t.textPrimary, display: 'block' }}>
                    {stats.topPersonas[0].personaName}
                  </Text>
                  <Text style={{ color: '#6C5CE7' }}>{stats.topPersonas[0].count} sessions</Text>
                </>
              ) : (
                <Text style={{ color: t.textMuted }}>No data yet</Text>
              )}
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
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
            style={{ width: 160 }}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
          <Select
            placeholder="Filter by difficulty"
            allowClear
            value={difficultyFilter}
            onChange={(val) => {
              setDifficultyFilter(val);
              setPage(1);
            }}
            style={{ width: 180 }}
            options={[
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ]}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RobotOutlined style={{ color: t.textMuted }} />
            <Text style={{ color: t.textMuted }}>{total} total personas</Text>
          </div>
        </Space>
      </Card>

      {/* Table */}
      <Card className="glass-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={personas}
            rowKey="id"
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: false,
              onChange: (p) => setPage(p),
              showTotal: (tot) => <Text style={{ color: t.textMuted }}>{tot} personas total</Text>,
            }}
            size="middle"
          />
        </Spin>
      </Card>

      {/* Create Persona Modal */}
      <Modal
        title="Create AI Persona"
        open={createOpen}
        onCancel={() => {
          setCreateOpen(false);
          createForm.resetFields();
          setCreateAvatarFile(null);
          setCreateAvatarPreview(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ isPremium: false, sortOrder: 0 }}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Required' }]}>
                <Input placeholder="e.g. Casual Charlie" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Avatar Image">
                <input
                  ref={createAvatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: 'none' }}
                  onChange={(e) => pickAvatar(e, setCreateAvatarFile, setCreateAvatarPreview)}
                />
                <div
                  onClick={() => createAvatarInputRef.current?.click()}
                  style={{
                    width: 80,
                    height: 80,
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
                  {createAvatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={createAvatarPreview}
                      alt="avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#8c8c8c' }}>
                      <PictureOutlined
                        style={{ fontSize: 22, display: 'block', marginBottom: 4 }}
                      />
                      <div style={{ fontSize: 11 }}>Upload</div>
                    </div>
                  )}
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="expertise"
            label="Expertise"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input placeholder="e.g. Everyday Conversation" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input placeholder="Short description shown to users" />
          </Form.Item>
          <Form.Item
            name="systemPrompt"
            label="System Prompt"
            rules={[{ required: true, message: 'Required' }]}
          >
            <TextArea rows={4} placeholder="Instructions for the AI persona..." />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="difficulty"
                label="Difficulty"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Select
                  options={[
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'advanced', label: 'Advanced' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sortOrder" label="Sort Order">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isPremium" label="Premium" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setCreateOpen(false);
                  createForm.resetFields();
                  setCreateAvatarFile(null);
                  setCreateAvatarPreview(null);
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

      {/* Edit Persona Modal */}
      <Modal
        title={`Edit: ${editingPersona?.name || ''}`}
        open={editOpen}
        onCancel={() => {
          setEditOpen(false);
          editForm.resetFields();
          setEditingPersona(null);
          setEditAvatarFile(null);
          setEditAvatarPreview(null);
        }}
        footer={null}
        width={600}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit} style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="name" label="Name">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Avatar Image">
                <input
                  ref={editAvatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: 'none' }}
                  onChange={(e) => pickAvatar(e, setEditAvatarFile, setEditAvatarPreview)}
                />
                <div
                  onClick={() => editAvatarInputRef.current?.click()}
                  style={{
                    width: 80,
                    height: 80,
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
                  {editAvatarPreview ||
                  (editingPersona?.avatar.startsWith('http') ? editingPersona.avatar : null) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={editAvatarPreview ?? editingPersona?.avatar ?? ''}
                      alt="avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : editingPersona && !editingPersona.avatar.startsWith('http') ? (
                    <span style={{ fontSize: 28 }}>{editingPersona.avatar}</span>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#8c8c8c' }}>
                      <PictureOutlined
                        style={{ fontSize: 22, display: 'block', marginBottom: 4 }}
                      />
                      <div style={{ fontSize: 11 }}>Upload</div>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                  {editAvatarPreview ? 'New image selected — saves on Save' : 'Click to change'}
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="expertise" label="Expertise">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input />
          </Form.Item>
          <Form.Item name="systemPrompt" label="System Prompt">
            <TextArea rows={4} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="difficulty" label="Difficulty">
                <Select
                  options={[
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'advanced', label: 'Advanced' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sortOrder" label="Sort Order">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="isPremium" label="Premium" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isActive" label="Active" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setEditOpen(false);
                  editForm.resetFields();
                  setEditingPersona(null);
                  setEditAvatarFile(null);
                  setEditAvatarPreview(null);
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
