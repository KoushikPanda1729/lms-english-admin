'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Button, message, Spin } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { onboardingService } from '@/lib/services/onboarding';
import QuestionFields from '../../_components/QuestionFields';
import QuestionBank from '../../_components/QuestionBank';
import LivePreview from '../../_components/LivePreview';

export default function EditQuestionPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [optionCount, setOptionCount] = useState(4);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  // Watch live-preview values
  const question = Form.useWatch('question', form) ?? '';
  const correctIndex = Form.useWatch('correctIndex', form) ?? 0;
  const levelTag = Form.useWatch('levelTag', form) ?? '';
  const lo0 = Form.useWatch('option_0', form) ?? '';
  const lo1 = Form.useWatch('option_1', form) ?? '';
  const lo2 = Form.useWatch('option_2', form) ?? '';
  const lo3 = Form.useWatch('option_3', form) ?? '';
  const lo4 = Form.useWatch('option_4', form) ?? '';
  const lo5 = Form.useWatch('option_5', form) ?? '';
  const liveOptions = [lo0, lo1, lo2, lo3, lo4, lo5].slice(0, optionCount);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const list = await onboardingService.list();
        const q = list.find((item) => item.id === id);
        if (!q) {
          messageApi.error('Question not found');
          return;
        }
        form.setFieldsValue({
          question: q.question,
          levelTag: q.levelTag,
          correctIndex: q.correctIndex,
          sortOrder: q.sortOrder,
          ...q.options.reduce((acc, opt, i) => ({ ...acc, [`option_${i}`]: opt }), {}),
        });
        setOptionCount(q.options.length);
      } catch {
        messageApi.error('Failed to load question');
      } finally {
        setFetching(false);
      }
    })();
  }, [id, form, messageApi]);

  const handleSave = async () => {
    try {
      await form.validateFields();
    } catch {
      return;
    }
    const values = form.getFieldsValue(true);
    const options = Array.from({ length: optionCount }, (_, i) => values[`option_${i}`] || '');

    setSaving(true);
    try {
      await onboardingService.update(id, {
        question: values.question,
        options,
        correctIndex: values.correctIndex,
        levelTag: values.levelTag,
        sortOrder: values.sortOrder ?? 0,
      });
      messageApi.success('Question updated!');
      setTimeout(() => router.push('/onboarding'), 700);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update';
      messageApi.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-6 sm:px-6">
      {contextHolder}

      {/* ── Page header ── */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Edit Question</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Update the question details. The right panel shows a live preview and question bank for
            reference.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/onboarding')}
            className="rounded-xl"
          >
            Back
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
            className="rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
              border: 'none',
            }}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
        {/* ── LEFT: Form ── */}
        <div className="flex flex-col gap-5">
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow">
            {/* Full-bleed card header */}
            <div className="flex items-center gap-3 border-b border-zinc-100 bg-amber-50 px-6 py-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-sm font-bold text-amber-600">
                E
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-800">Edit Question</p>
                <p className="text-xs text-zinc-400">
                  Changes are saved when you click Save Changes
                </p>
              </div>
            </div>
            {/* Card body */}
            <div className="p-6 pb-8">
              <QuestionFields
                form={form}
                optionCount={optionCount}
                setOptionCount={setOptionCount}
              />
            </div>
          </div>

          {/* Bottom action bar */}
          <div className="flex items-center justify-end gap-3 rounded-2xl border border-zinc-200 bg-white px-6 py-4 shadow">
            <Button onClick={() => router.push('/onboarding')} className="rounded-xl">
              Cancel
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSave}
              className="rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
                border: 'none',
              }}
            >
              Save Changes
            </Button>
          </div>
        </div>

        {/* ── RIGHT: Preview + Bank ── */}
        <div className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-6 lg:self-start">
          {/* Live preview — on top for edit page */}
          <LivePreview
            question={question}
            options={liveOptions}
            correctIndex={correctIndex}
            levelTag={levelTag}
          />

          {/* Question bank (collapsed by default on edit) */}
          <div className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white px-5 py-5 shadow">
            <details>
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-violet-600">
                <span className="text-base">💡</span> Question Bank
                <span className="ml-auto text-xs font-normal text-zinc-300">
                  (click to replace form)
                </span>
                <span className="text-xs text-zinc-400">▼</span>
              </summary>
              <div className="mt-4">
                <QuestionBank form={form} setOptionCount={setOptionCount} />
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
