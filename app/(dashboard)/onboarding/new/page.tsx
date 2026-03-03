'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Button, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { onboardingService } from '@/lib/services/onboarding';
import QuestionFields from '../_components/QuestionFields';
import QuestionBank from '../_components/QuestionBank';
import LivePreview from '../_components/LivePreview';

export default function NewQuestionPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [optionCount, setOptionCount] = useState(4);
  const [saving, setSaving] = useState(false);
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
      await onboardingService.create({
        question: values.question,
        options,
        correctIndex: values.correctIndex,
        levelTag: values.levelTag,
        sortOrder: values.sortOrder ?? 0,
      });
      messageApi.success('Question created!');
      setTimeout(() => router.push('/onboarding'), 700);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to create';
      messageApi.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-6 sm:px-6">
      {contextHolder}

      {/* ── Page header ── */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Add New Question</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Pick from the question bank on the right, or write your own.
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
            Save Question
          </Button>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
        {/* ── LEFT: Form ── */}
        <div className="flex flex-col gap-5">
          {/* Form card */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow">
            {/* Full-bleed card header */}
            <div className="flex items-center gap-3 border-b border-zinc-100 bg-zinc-50 px-6 py-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-sm font-bold text-violet-600">
                Q
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-800">Question Details</p>
                <p className="text-xs text-zinc-400">Fill in the question, options and metadata</p>
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
              Save Question
            </Button>
          </div>
        </div>

        {/* ── RIGHT: Bank + Preview ── */}
        <div className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-6 lg:self-start">
          {/* Question bank */}
          <div className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white px-5 py-5 shadow">
            <QuestionBank form={form} setOptionCount={setOptionCount} />
          </div>

          {/* Live preview */}
          <LivePreview
            question={question}
            options={liveOptions}
            correctIndex={correctIndex}
            levelTag={levelTag}
          />
        </div>
      </div>
    </div>
  );
}
