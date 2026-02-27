'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Typography,
  Space,
  Tag,
  Spin,
  Modal,
  Form,
  Input,
  InputNumber,
  Upload,
  Popconfirm,
  Tooltip,
  Empty,
  Divider,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlayCircleOutlined,
  FilePdfOutlined,
  FormOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  HolderOutlined,
} from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import { lessonService, type Lesson } from '@/lib/services/lesson';
import { courseService } from '@/lib/services/course';

const { Title, Text } = Typography;

interface CourseInfo {
  id: string;
  title: string;
  description: string | null;
  level: string | null;
  isPublished: boolean;
  isPremium: boolean;
  totalLessons: number;
}

interface QuizQuestion {
  question: string;
  type: 'single' | 'multiple';
  options: { text: string; isCorrect: boolean }[];
}

// ─── Section config ───────────────────────────────────────────────────────────

const SECTIONS = [
  {
    type: 'video' as const,
    label: 'Videos',
    icon: <PlayCircleOutlined style={{ fontSize: 20 }} />,
    color: '#6C5CE7',
    bg: 'rgba(108,92,231,0.08)',
    description: 'Video lessons for this course',
  },
  {
    type: 'pdf' as const,
    label: 'Study Materials',
    icon: <FilePdfOutlined style={{ fontSize: 20 }} />,
    color: '#00B894',
    bg: 'rgba(0,184,148,0.08)',
    description: 'PDF files, notes and documents',
  },
  {
    type: 'quiz' as const,
    label: 'Quizzes',
    icon: <FormOutlined style={{ fontSize: 20 }} />,
    color: '#FDCB6E',
    bg: 'rgba(253,203,110,0.08)',
    description: 'Tests and assessments',
  },
];

// ─── Sortable lesson row ──────────────────────────────────────────────────────

function SortableLessonRow({
  lesson,
  idx,
  section,
  t,
  onPreview,
  onEdit,
  onDelete,
}: {
  lesson: Lesson;
  idx: number;
  section: (typeof SECTIONS)[number];
  t: ReturnType<typeof getTokens>;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 24px',
    background: isDragging ? 'rgba(108,92,231,0.04)' : undefined,
    cursor: 'default',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Space size={12}>
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          style={{
            cursor: 'grab',
            color: t.textMuted,
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            padding: '4px 2px',
            touchAction: 'none',
          }}
        >
          <HolderOutlined />
        </div>

        {/* Index badge */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: section.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: section.color,
            fontSize: 14,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {idx + 1}
        </div>

        <div>
          <Text strong style={{ color: t.textPrimary }}>
            {lesson.title}
          </Text>
          <Space size={12} style={{ display: 'flex', marginTop: 2 }}>
            {lesson.durationMinutes && (
              <Space size={4}>
                <ClockCircleOutlined style={{ color: t.textMuted, fontSize: 12 }} />
                <Text style={{ color: t.textMuted, fontSize: 12 }}>
                  {lesson.durationMinutes} min
                </Text>
              </Space>
            )}
            {lesson.pdfUrl && (
              <Tag color="green" style={{ borderRadius: 4, fontSize: 11 }}>
                PDF uploaded
              </Tag>
            )}
            {lesson.videoUrl && (
              <Tag color="purple" style={{ borderRadius: 4, fontSize: 11 }}>
                Video uploaded
              </Tag>
            )}
          </Space>
        </div>
      </Space>

      <Space size={8}>
        <Tooltip title="Preview">
          <Button
            size="small"
            icon={<EyeOutlined />}
            style={{ borderRadius: 6 }}
            onClick={onPreview}
          />
        </Tooltip>
        {section.type !== 'quiz' && (
          <Tooltip title="Edit">
            <Button
              size="small"
              icon={<EditOutlined />}
              style={{ borderRadius: 6 }}
              onClick={onEdit}
            />
          </Tooltip>
        )}
        <Popconfirm
          title="Delete this lesson?"
          description="This cannot be undone."
          onConfirm={onDelete}
          okText="Delete"
          okButtonProps={{ danger: true }}
          cancelText="Cancel"
        >
          <Tooltip title="Delete">
            <Button size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 6 }} />
          </Tooltip>
        </Popconfirm>
      </Space>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CourseContentPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);
  const [messageApi, contextHolder] = message.useMessage();

  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── Video modal ─────────────────────────────────────────────────────────────
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoForm] = Form.useForm();
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // ─── PDF modal ───────────────────────────────────────────────────────────────
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfForm] = Form.useForm();
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // ─── Quiz modal ──────────────────────────────────────────────────────────────
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizForm] = Form.useForm();
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      question: '',
      type: 'single',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
    },
  ]);

  // ─── Preview modals ───────────────────────────────────────────────────────────
  const [videoPreviewLesson, setVideoPreviewLesson] = useState<Lesson | null>(null);
  const [pdfPreviewLesson, setPdfPreviewLesson] = useState<Lesson | null>(null);
  const [quizPreview, setQuizPreview] = useState<{
    lesson: Lesson;
    data: Awaited<ReturnType<typeof lessonService.getQuiz>> | null;
    loading: boolean;
  } | null>(null);

  // ─── DnD sensors ─────────────────────────────────────────────────────────────
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // ─── Fetch data ───────────────────────────────────────────────────────────────

  const fetchLessons = useCallback(async () => {
    try {
      const data = await lessonService.list(courseId);
      setLessons(data);
    } catch {
      messageApi.error('Failed to load lessons');
    }
  }, [courseId, messageApi]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [courseResult, lessonData] = await Promise.all([
          courseService.listCourses({ page: 1, limit: 50 }),
          lessonService.list(courseId),
        ]);
        const found = courseResult.courses.find((c) => c.id === courseId);
        if (found) setCourse(found);
        setLessons(lessonData);
      } catch {
        messageApi.error('Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [courseId, messageApi]);

  // ─── Drag end handler ─────────────────────────────────────────────────────────

  const handleDragEnd = useCallback(
    async (event: DragEndEvent, type: 'video' | 'pdf' | 'quiz') => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const sectionLessons = lessons.filter((l) => l.type === type);
      const oldIndex = sectionLessons.findIndex((l) => l.id === active.id);
      const newIndex = sectionLessons.findIndex((l) => l.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(sectionLessons, oldIndex, newIndex);

      // Optimistically update local state
      setLessons((prev) => {
        const others = prev.filter((l) => l.type !== type);
        const updated = reordered.map((l, i) => ({ ...l, order: i }));
        return [...others, ...updated].sort((a, b) => {
          const typeOrder = ['video', 'pdf', 'quiz'];
          const ta = typeOrder.indexOf(a.type);
          const tb = typeOrder.indexOf(b.type);
          if (ta !== tb) return ta - tb;
          return a.order - b.order;
        });
      });

      // Persist new orders
      try {
        await Promise.all(
          reordered.map((l, i) => {
            if (l.order !== i) {
              return lessonService.update(courseId, l.id, { order: i });
            }
            return Promise.resolve();
          }),
        );
      } catch {
        messageApi.error('Failed to save new order');
        fetchLessons(); // revert on error
      }
    },
    [lessons, courseId, messageApi, fetchLessons],
  );

  // ─── Video handlers ───────────────────────────────────────────────────────────

  const openVideoCreate = () => {
    setEditingLesson(null);
    videoForm.resetFields();
    setVideoFile(null);
    setVideoOpen(true);
  };

  const openVideoEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    videoForm.setFieldsValue({
      title: lesson.title,
      durationMinutes: lesson.durationMinutes,
      order: lesson.order,
    });
    setVideoFile(null);
    setVideoOpen(true);
  };

  const handleVideoSave = async (values: {
    title: string;
    durationMinutes?: number;
    order?: number;
  }) => {
    if (!editingLesson && !videoFile) {
      messageApi.error('Please select a video file');
      return;
    }
    setVideoLoading(true);
    try {
      if (editingLesson) {
        await lessonService.update(courseId, editingLesson.id, values);
        if (videoFile) {
          await lessonService.uploadVideo(courseId, editingLesson.id, videoFile);
        }
        messageApi.success('Video updated');
      } else {
        const lesson = await lessonService.create(courseId, { ...values, type: 'video' });
        await lessonService.uploadVideo(courseId, lesson.id, videoFile!);
        messageApi.success('Video added');
      }
      setVideoOpen(false);
      videoForm.resetFields();
      setVideoFile(null);
      fetchLessons();
    } catch {
      messageApi.error('Failed to save video');
    } finally {
      setVideoLoading(false);
    }
  };

  // ─── PDF handlers ─────────────────────────────────────────────────────────────

  const openPdfCreate = () => {
    setEditingLesson(null);
    pdfForm.resetFields();
    setPdfFile(null);
    setPdfOpen(true);
  };

  const openPdfEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    pdfForm.setFieldsValue({ title: lesson.title, order: lesson.order });
    setPdfFile(null);
    setPdfOpen(true);
  };

  const handlePdfSave = async (values: { title: string; order?: number }) => {
    setPdfLoading(true);
    try {
      if (editingLesson) {
        await lessonService.update(courseId, editingLesson.id, values);
        if (pdfFile) {
          await lessonService.uploadPdf(courseId, editingLesson.id, pdfFile);
        }
        messageApi.success('Material updated');
      } else {
        if (!pdfFile) {
          messageApi.error('Please select a PDF file');
          setPdfLoading(false);
          return;
        }
        const lesson = await lessonService.create(courseId, { ...values, type: 'pdf' });
        await lessonService.uploadPdf(courseId, lesson.id, pdfFile);
        messageApi.success('Material added');
      }
      setPdfOpen(false);
      pdfForm.resetFields();
      setPdfFile(null);
      fetchLessons();
    } catch {
      messageApi.error('Failed to save material');
    } finally {
      setPdfLoading(false);
    }
  };

  // ─── Quiz handlers ────────────────────────────────────────────────────────────

  const openQuizCreate = () => {
    setEditingLesson(null);
    quizForm.resetFields();
    setQuestions([
      {
        question: '',
        type: 'single',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
      },
    ]);
    setQuizOpen(true);
  };

  const handleQuizSave = async (values: { title: string; passingScore?: number }) => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        messageApi.error(`Question ${i + 1} text is required`);
        return;
      }
      if (q.options.filter((o) => o.text.trim()).length < 2) {
        messageApi.error(`Question ${i + 1} needs at least 2 options`);
        return;
      }
      if (!q.options.some((o) => o.isCorrect)) {
        messageApi.error(`Question ${i + 1} needs at least one correct answer`);
        return;
      }
    }

    setQuizLoading(true);
    try {
      const lesson = await lessonService.create(courseId, { title: values.title, type: 'quiz' });
      await lessonService.createQuiz(courseId, lesson.id, {
        title: values.title,
        passingScore: values.passingScore ?? 70,
        questions: questions.map((q, i) => ({
          question: q.question,
          type: q.type,
          order: i,
          options: q.options.filter((o) => o.text.trim()),
        })),
      });
      messageApi.success('Quiz created');
      setQuizOpen(false);
      quizForm.resetFields();
      fetchLessons();
    } catch {
      messageApi.error('Failed to create quiz');
    } finally {
      setQuizLoading(false);
    }
  };

  const addQuestion = () =>
    setQuestions((prev) => [
      ...prev,
      {
        question: '',
        type: 'single',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
      },
    ]);

  const removeQuestion = (qi: number) => setQuestions((prev) => prev.filter((_, i) => i !== qi));

  const updateQuestion = (qi: number, field: keyof QuizQuestion, value: string) =>
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, [field]: value } : q)));

  const addOption = (qi: number) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi ? { ...q, options: [...q.options, { text: '', isCorrect: false }] } : q,
      ),
    );

  const updateOption = (
    qi: number,
    oi: number,
    field: 'text' | 'isCorrect',
    value: string | boolean,
  ) =>
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi) return q;
        const opts = q.options.map((o, j) => {
          if (j !== oi) {
            if (field === 'isCorrect' && value === true && q.type === 'single')
              return { ...o, isCorrect: false };
            return o;
          }
          return { ...o, [field]: value };
        });
        return { ...q, options: opts };
      }),
    );

  const removeOption = (qi: number, oi: number) =>
    setQuestions((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, options: q.options.filter((_, j) => j !== oi) } : q)),
    );

  // ─── Preview handlers ─────────────────────────────────────────────────────────

  const openQuizPreview = async (lesson: Lesson) => {
    setQuizPreview({ lesson, data: null, loading: true });
    try {
      const data = await lessonService.getQuiz(courseId, lesson.id);
      setQuizPreview({ lesson, data, loading: false });
    } catch {
      messageApi.error('Failed to load quiz');
      setQuizPreview(null);
    }
  };

  const handleDelete = async (lesson: Lesson) => {
    try {
      await lessonService.delete(courseId, lesson.id);
      messageApi.success('Deleted');
      fetchLessons();
    } catch {
      messageApi.error('Failed to delete');
    }
  };

  const getLessonsOfType = (type: string) =>
    lessons.filter((l) => l.type === type).sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {contextHolder}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/courses')}
          style={{ color: t.textMuted, paddingLeft: 0, marginBottom: 8 }}
        >
          Back to Courses
        </Button>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <Title level={3} style={{ margin: 0, color: t.textPrimary }}>
              {course?.title ?? 'Course Content'}
            </Title>
            <Space size={8} style={{ marginTop: 6 }}>
              {course?.level && (
                <Tag style={{ borderRadius: 6, textTransform: 'capitalize' }}>{course.level}</Tag>
              )}
              <Tag color={course?.isPublished ? 'success' : 'default'} style={{ borderRadius: 6 }}>
                {course?.isPublished ? 'Published' : 'Draft'}
              </Tag>
              <Tag color={course?.isPremium ? 'gold' : 'green'} style={{ borderRadius: 6 }}>
                {course?.isPremium ? 'Premium' : 'Free'}
              </Tag>
              <Text style={{ color: t.textMuted, fontSize: 13 }}>
                {course?.totalLessons ?? 0} lessons total
              </Text>
            </Space>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {SECTIONS.map((section) => {
          const sectionLessons = getLessonsOfType(section.type);
          return (
            <Card
              key={section.type}
              className="glass-card"
              style={{ borderRadius: 14 }}
              styles={{ body: { padding: 0 } }}
            >
              {/* Section Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 24px',
                  borderBottom: sectionLessons.length > 0 ? `1px solid ${t.border}` : 'none',
                }}
              >
                <Space size={12}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: section.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: section.color,
                    }}
                  >
                    {section.icon}
                  </div>
                  <div>
                    <Text strong style={{ color: t.textPrimary, fontSize: 16 }}>
                      {section.label}
                    </Text>
                    <Text style={{ color: t.textMuted, fontSize: 13, display: 'block' }}>
                      {sectionLessons.length} item{sectionLessons.length !== 1 ? 's' : ''} ·{' '}
                      {section.description}
                    </Text>
                  </div>
                </Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{ borderRadius: 8, background: section.color, border: 'none' }}
                  onClick={() => {
                    if (section.type === 'video') openVideoCreate();
                    else if (section.type === 'pdf') openPdfCreate();
                    else openQuizCreate();
                  }}
                >
                  Add {section.label.slice(0, -1)}
                </Button>
              </div>

              {/* Lesson rows */}
              {sectionLessons.length === 0 ? (
                <div style={{ padding: '32px 0' }}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <Text style={{ color: t.textMuted }}>
                        No {section.label.toLowerCase()} yet. Click &quot;Add&quot; to get started.
                      </Text>
                    }
                  />
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => handleDragEnd(e, section.type)}
                >
                  <SortableContext
                    items={sectionLessons.map((l) => l.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {sectionLessons.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        style={{
                          borderBottom:
                            idx < sectionLessons.length - 1 ? `1px solid ${t.border}` : 'none',
                        }}
                      >
                        <SortableLessonRow
                          lesson={lesson}
                          idx={idx}
                          section={section}
                          t={t}
                          onPreview={() => {
                            if (section.type === 'video') setVideoPreviewLesson(lesson);
                            else if (section.type === 'pdf') setPdfPreviewLesson(lesson);
                            else openQuizPreview(lesson);
                          }}
                          onEdit={() => {
                            if (section.type === 'video') openVideoEdit(lesson);
                            else openPdfEdit(lesson);
                          }}
                          onDelete={() => handleDelete(lesson)}
                        />
                      </div>
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </Card>
          );
        })}
      </div>

      {/* ─── Video Modal ─────────────────────────────────────────────────────── */}
      <Modal
        title={editingLesson ? 'Edit Video' : 'Add Video'}
        open={videoOpen}
        onCancel={() => {
          setVideoOpen(false);
          videoForm.resetFields();
          setEditingLesson(null);
          setVideoFile(null);
        }}
        footer={null}
        width={480}
      >
        <Form
          form={videoForm}
          layout="vertical"
          onFinish={handleVideoSave}
          style={{ marginTop: 16 }}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="e.g. Introduction to Grammar" />
          </Form.Item>
          <Form.Item label={editingLesson ? 'Replace Video (optional)' : 'Upload Video'}>
            <Upload
              accept="video/*"
              maxCount={1}
              beforeUpload={(file) => {
                setVideoFile(file);
                return false;
              }}
              onRemove={() => setVideoFile(null)}
              fileList={videoFile ? [{ uid: '-1', name: videoFile.name, status: 'done' }] : []}
            >
              <Button icon={<UploadOutlined />}>Select Video File</Button>
            </Upload>
            {editingLesson?.videoUrl && !videoFile && (
              <Text style={{ color: '#6C5CE7', fontSize: 12, display: 'block', marginTop: 4 }}>
                ✓ Video already uploaded — leave empty to keep existing
              </Text>
            )}
          </Form.Item>
          <Form.Item name="durationMinutes" label="Duration (minutes)">
            <InputNumber min={1} style={{ width: '100%' }} placeholder="e.g. 10" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setVideoOpen(false);
                  videoForm.resetFields();
                  setEditingLesson(null);
                  setVideoFile(null);
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={videoLoading}>
                {editingLesson ? 'Save' : 'Add Video'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ─── PDF Modal ───────────────────────────────────────────────────────── */}
      <Modal
        title={editingLesson ? 'Edit Material' : 'Add Study Material'}
        open={pdfOpen}
        onCancel={() => {
          setPdfOpen(false);
          pdfForm.resetFields();
          setEditingLesson(null);
          setPdfFile(null);
        }}
        footer={null}
        width={480}
      >
        <Form form={pdfForm} layout="vertical" onFinish={handlePdfSave} style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="e.g. Grammar Notes Chapter 1" />
          </Form.Item>
          <Form.Item label={editingLesson ? 'Replace PDF (optional)' : 'Upload PDF'}>
            <Upload
              accept=".pdf"
              maxCount={1}
              beforeUpload={(file) => {
                setPdfFile(file);
                return false;
              }}
              onRemove={() => setPdfFile(null)}
              fileList={pdfFile ? [{ uid: '-1', name: pdfFile.name, status: 'done' }] : []}
            >
              <Button icon={<UploadOutlined />}>Select PDF File</Button>
            </Upload>
            {editingLesson?.pdfUrl && !pdfFile && (
              <Text style={{ color: '#00B894', fontSize: 12, display: 'block', marginTop: 4 }}>
                ✓ PDF already uploaded — leave empty to keep existing
              </Text>
            )}
          </Form.Item>
          <Form.Item name="order" label="Order">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setPdfOpen(false);
                  pdfForm.resetFields();
                  setEditingLesson(null);
                  setPdfFile(null);
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={pdfLoading}>
                {editingLesson ? 'Save' : 'Add Material'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ─── Video Preview Modal ─────────────────────────────────────────────── */}
      <Modal
        title={videoPreviewLesson?.title ?? 'Video Preview'}
        open={!!videoPreviewLesson}
        onCancel={() => setVideoPreviewLesson(null)}
        footer={null}
        width={720}
        destroyOnClose
      >
        {videoPreviewLesson?.videoUrl ? (
          <div>
            {videoPreviewLesson.videoUrl.includes('youtube.com') ||
            videoPreviewLesson.videoUrl.includes('youtu.be') ? (
              <div
                style={{
                  position: 'relative',
                  paddingTop: '56.25%',
                  borderRadius: 10,
                  overflow: 'hidden',
                }}
              >
                <iframe
                  src={videoPreviewLesson.videoUrl
                    .replace('watch?v=', 'embed/')
                    .replace('youtu.be/', 'www.youtube.com/embed/')}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  allowFullScreen
                />
              </div>
            ) : (
              <video
                src={videoPreviewLesson.videoUrl}
                controls
                style={{ width: '100%', borderRadius: 10 }}
              />
            )}
            {videoPreviewLesson.durationMinutes && (
              <Tag icon={<ClockCircleOutlined />} style={{ marginTop: 12 }}>
                {videoPreviewLesson.durationMinutes} min
              </Tag>
            )}
          </div>
        ) : (
          <Empty description="No video uploaded for this lesson" />
        )}
      </Modal>

      {/* ─── PDF Preview Modal ───────────────────────────────────────────────── */}
      <Modal
        title={pdfPreviewLesson?.title ?? 'PDF Preview'}
        open={!!pdfPreviewLesson}
        onCancel={() => setPdfPreviewLesson(null)}
        footer={
          pdfPreviewLesson?.pdfUrl ? (
            <Button
              type="primary"
              onClick={() => window.open(pdfPreviewLesson.pdfUrl!, '_blank')}
              icon={<FilePdfOutlined />}
            >
              Open in New Tab
            </Button>
          ) : null
        }
        width={800}
        destroyOnClose
      >
        {pdfPreviewLesson?.pdfUrl ? (
          <iframe
            src={pdfPreviewLesson.pdfUrl}
            style={{ width: '100%', height: 520, border: 'none', borderRadius: 8 }}
            title={pdfPreviewLesson.title}
          />
        ) : (
          <Empty description="No PDF uploaded for this lesson" />
        )}
      </Modal>

      {/* ─── Quiz Preview Modal ──────────────────────────────────────────────── */}
      <Modal
        title={quizPreview?.lesson.title ?? 'Quiz Preview'}
        open={!!quizPreview}
        onCancel={() => setQuizPreview(null)}
        footer={null}
        width={640}
        destroyOnClose
      >
        {quizPreview?.loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : quizPreview?.data ? (
          <div>
            <Space style={{ marginBottom: 16 }} wrap>
              <Tag color="purple">Passing Score: {quizPreview.data.passingScore}%</Tag>
              <Tag>
                {quizPreview.data.questions.length} question
                {quizPreview.data.questions.length !== 1 ? 's' : ''}
              </Tag>
            </Space>
            {quizPreview.data.questions.map((q, qi) => (
              <Card
                key={q.id}
                size="small"
                style={{ marginBottom: 14, borderRadius: 10, border: `1px solid ${t.border}` }}
                title={
                  <Space>
                    <Text strong style={{ color: t.textPrimary }}>
                      Q{qi + 1}. {q.question}
                    </Text>
                    <Tag
                      color={q.type === 'single' ? 'purple' : 'blue'}
                      style={{ borderRadius: 4 }}
                    >
                      {q.type === 'single' ? 'Single choice' : 'Multiple choice'}
                    </Tag>
                  </Space>
                }
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        borderRadius: 6,
                        background: opt.isCorrect ? 'rgba(0,184,148,0.08)' : t.bgCard,
                        border: `1px solid ${opt.isCorrect ? '#00B894' : t.border}`,
                      }}
                    >
                      {opt.isCorrect ? (
                        <CheckCircleOutlined style={{ color: '#00B894', fontSize: 15 }} />
                      ) : (
                        <CloseCircleOutlined style={{ color: '#FF7675', fontSize: 15 }} />
                      )}
                      <Text style={{ color: t.textPrimary, flex: 1 }}>{opt.text}</Text>
                      {opt.isCorrect && (
                        <Tag color="success" style={{ borderRadius: 4, fontSize: 11 }}>
                          Correct
                        </Tag>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Empty description="No quiz data found" />
        )}
      </Modal>

      {/* ─── Quiz Modal ──────────────────────────────────────────────────────── */}
      <Modal
        title="Create Quiz"
        open={quizOpen}
        onCancel={() => {
          setQuizOpen(false);
          quizForm.resetFields();
        }}
        footer={null}
        width={640}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
      >
        <Form form={quizForm} layout="vertical" onFinish={handleQuizSave} style={{ marginTop: 16 }}>
          <Form.Item
            name="title"
            label="Quiz Title"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input placeholder="e.g. Chapter 1 Assessment" />
          </Form.Item>
          <Form.Item name="passingScore" label="Passing Score (%)">
            <InputNumber min={1} max={100} style={{ width: '100%' }} placeholder="70" />
          </Form.Item>

          <Divider style={{ margin: '12px 0' }}>Questions</Divider>

          {questions.map((q, qi) => (
            <Card
              key={qi}
              size="small"
              style={{ marginBottom: 16, borderRadius: 10, border: `1px solid ${t.border}` }}
              title={
                <Space>
                  <Text strong>Question {qi + 1}</Text>
                  <Tag
                    style={{ cursor: 'pointer', borderRadius: 4 }}
                    color={q.type === 'single' ? 'purple' : 'blue'}
                    onClick={() =>
                      updateQuestion(qi, 'type', q.type === 'single' ? 'multiple' : 'single')
                    }
                  >
                    {q.type === 'single' ? 'Single choice' : 'Multiple choice'} (click to toggle)
                  </Tag>
                </Space>
              }
              extra={
                questions.length > 1 && (
                  <Button
                    size="small"
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => removeQuestion(qi)}
                  />
                )
              }
            >
              <Input
                placeholder="Enter question text"
                value={q.question}
                onChange={(e) => updateQuestion(qi, 'question', e.target.value)}
                style={{ marginBottom: 12 }}
              />
              <Text style={{ color: t.textMuted, fontSize: 12, display: 'block', marginBottom: 8 }}>
                Options — check the correct answer(s)
              </Text>
              {q.options.map((opt, oi) => (
                <Space key={oi} style={{ display: 'flex', marginBottom: 8 }}>
                  <input
                    type={q.type === 'single' ? 'radio' : 'checkbox'}
                    checked={opt.isCorrect}
                    onChange={(e) => updateOption(qi, oi, 'isCorrect', e.target.checked)}
                    style={{ cursor: 'pointer', width: 16, height: 16 }}
                  />
                  <Input
                    placeholder={`Option ${oi + 1}`}
                    value={opt.text}
                    onChange={(e) => updateOption(qi, oi, 'text', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  {q.options.length > 2 && (
                    <Button
                      size="small"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeOption(qi, oi)}
                    />
                  )}
                </Space>
              ))}
              <Button
                size="small"
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => addOption(qi)}
                style={{ marginTop: 4 }}
              >
                Add Option
              </Button>
            </Card>
          ))}

          <Button
            type="dashed"
            icon={<PlusOutlined />}
            block
            onClick={addQuestion}
            style={{ marginBottom: 16 }}
          >
            Add Question
          </Button>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setQuizOpen(false);
                  quizForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={quizLoading}>
                Create Quiz
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
