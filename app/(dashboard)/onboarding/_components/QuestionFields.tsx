'use client';

import { Form, Input, Select, InputNumber, Button, Space } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

export const LEVEL_TAGS = [
  { value: 'beginner', label: 'Beginner', color: '#00B894' },
  { value: 'elementary', label: 'Elementary', color: '#74B9FF' },
  { value: 'intermediate', label: 'Intermediate', color: '#FDCB6E' },
  { value: 'advanced', label: 'Advanced', color: '#FF7675' },
];

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

interface Props {
  form: ReturnType<typeof Form.useForm>[0];
  optionCount: number;
  setOptionCount: (n: number) => void;
}

export default function QuestionFields({ form, optionCount, setOptionCount }: Props) {
  // Watch up to 6 option values (hooks must not be inside loops)
  const o0 = Form.useWatch('option_0', form) ?? '';
  const o1 = Form.useWatch('option_1', form) ?? '';
  const o2 = Form.useWatch('option_2', form) ?? '';
  const o3 = Form.useWatch('option_3', form) ?? '';
  const o4 = Form.useWatch('option_4', form) ?? '';
  const o5 = Form.useWatch('option_5', form) ?? '';
  const optionValues = [o0, o1, o2, o3, o4, o5].slice(0, optionCount);

  return (
    <Form form={form} layout="vertical" requiredMark={false}>
      {/* Question */}
      <Form.Item
        name="question"
        label={<span className="text-sm font-semibold text-zinc-700">Question</span>}
        rules={[{ required: true, message: 'Enter the question text' }]}
      >
        <TextArea
          rows={4}
          showCount
          maxLength={300}
          placeholder="e.g. Which sentence is grammatically correct?"
          className="rounded-xl"
        />
      </Form.Item>

      {/* Options */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-700">
            Answer Options
            <span className="ml-1.5 text-xs font-normal text-zinc-400">(min 2 · max 6)</span>
          </span>
          <Space size={4}>
            <Button
              size="small"
              shape="circle"
              disabled={optionCount <= 2}
              onClick={() => setOptionCount(optionCount - 1)}
              className="flex items-center justify-center"
            >
              −
            </Button>
            <span className="w-5 text-center text-sm text-zinc-600">{optionCount}</span>
            <Button
              size="small"
              shape="circle"
              disabled={optionCount >= 6}
              onClick={() => setOptionCount(optionCount + 1)}
              className="flex items-center justify-center"
            >
              +
            </Button>
          </Space>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: optionCount }).map((_, i) => (
            <div
              key={i}
              style={{
                background: '#f9f9fb',
                borderRadius: 12,
                padding: '6px 10px',
              }}
            >
              <Form.Item
                name={`option_${i}`}
                rules={[{ required: true, message: `Option ${OPTION_LETTERS[i]} is required` }]}
                style={{ marginBottom: 0 }}
              >
                <Input
                  placeholder={`Option ${OPTION_LETTERS[i]}`}
                  prefix={
                    <span
                      className="mr-2 flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white"
                      style={{ background: i === 0 ? '#6C5CE7' : '#d1d5db' }}
                    >
                      {OPTION_LETTERS[i]}
                    </span>
                  }
                  style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10 }}
                />
              </Form.Item>
            </div>
          ))}
        </div>
      </div>

      {/* Correct answer */}
      <Form.Item
        name="correctIndex"
        label={<span className="text-sm font-semibold text-zinc-700">Correct Answer</span>}
        rules={[{ required: true, message: 'Select the correct option' }]}
      >
        <Select placeholder="Which option is correct?" className="rounded-xl">
          {Array.from({ length: optionCount }).map((_, i) => (
            <Option key={i} value={i}>
              <span className="flex items-center gap-2">
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white"
                  style={{ background: '#00B894' }}
                >
                  {OPTION_LETTERS[i]}
                </span>
                <span className="text-sm text-zinc-700">
                  {optionValues[i] || `Option ${OPTION_LETTERS[i]}`}
                </span>
              </span>
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Level tag + sort order */}
      <div className="flex gap-4">
        <Form.Item
          name="levelTag"
          label={<span className="text-sm font-semibold text-zinc-700">Level Tag</span>}
          rules={[{ required: true, message: 'Select a level' }]}
          style={{ flex: 1, marginBottom: 0 }}
        >
          <Select placeholder="Select difficulty level" className="rounded-xl">
            {LEVEL_TAGS.map((l) => (
              <Option key={l.value} value={l.value}>
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: l.color }}
                  />
                  {l.label}
                </span>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="sortOrder"
          label={<span className="text-sm font-semibold text-zinc-700">Sort Order</span>}
          style={{ width: 130, marginBottom: 0 }}
        >
          <InputNumber min={0} style={{ width: '100%', borderRadius: 12 }} placeholder="0" />
        </Form.Item>
      </div>
    </Form>
  );
}
