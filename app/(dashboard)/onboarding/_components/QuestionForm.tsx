'use client';

import { useState } from 'react';
import { Form, Input, Select, InputNumber, Button, Space, Collapse } from 'antd';
import { BulbOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

export const LEVEL_TAGS = [
  { value: 'beginner', label: 'Beginner', color: '#00B894' },
  { value: 'elementary', label: 'Elementary', color: '#74B9FF' },
  { value: 'intermediate', label: 'Intermediate', color: '#FDCB6E' },
  { value: 'advanced', label: 'Advanced', color: '#FF7675' },
];

const QUESTION_BANK = [
  {
    question: 'What is the plural of "child"?',
    options: ['children', 'childs', 'childes', 'childeren'],
    correctIndex: 0,
    levelTag: 'beginner',
    sortOrder: 1,
  },
  {
    question: 'Choose the correct sentence.',
    options: [
      'She go to school.',
      'She goes to school.',
      'She going to school.',
      'She goed to school.',
    ],
    correctIndex: 1,
    levelTag: 'beginner',
    sortOrder: 2,
  },
  {
    question: 'What is the opposite of "hot"?',
    options: ['warm', 'cool', 'cold', 'freeze'],
    correctIndex: 2,
    levelTag: 'beginner',
    sortOrder: 3,
  },
  {
    question: 'Fill in the blank: "I ___ a student."',
    options: ['am', 'is', 'are', 'be'],
    correctIndex: 0,
    levelTag: 'beginner',
    sortOrder: 4,
  },
  {
    question: 'Which word means "happy"?',
    options: ['sad', 'angry', 'joyful', 'tired'],
    correctIndex: 2,
    levelTag: 'beginner',
    sortOrder: 5,
  },
  {
    question: '"He ___ football every day."',
    options: ['play', 'plays', 'playing', 'played'],
    correctIndex: 1,
    levelTag: 'beginner',
    sortOrder: 6,
  },
  {
    question: 'Which is a greeting?',
    options: ['Goodbye', 'Hello', 'Sorry', 'Please'],
    correctIndex: 1,
    levelTag: 'beginner',
    sortOrder: 7,
  },
  {
    question: 'What is the colour of the sky on a clear day?',
    options: ['green', 'red', 'blue', 'yellow'],
    correctIndex: 2,
    levelTag: 'beginner',
    sortOrder: 8,
  },
  {
    question: 'Choose the correct question form.',
    options: ['Where you live?', 'Where do you live?', 'Where live you?', 'You where live?'],
    correctIndex: 1,
    levelTag: 'elementary',
    sortOrder: 9,
  },
  {
    question: '"She has been working here ___ five years."',
    options: ['since', 'for', 'during', 'while'],
    correctIndex: 1,
    levelTag: 'elementary',
    sortOrder: 10,
  },
  {
    question: 'Which sentence uses the past tense correctly?',
    options: ['I goed home.', 'I went home.', 'I go home.', 'I goes home.'],
    correctIndex: 1,
    levelTag: 'elementary',
    sortOrder: 11,
  },
  {
    question: '"This book belongs to John. It\'s ___."',
    options: ['he', 'his', 'him', 'himself'],
    correctIndex: 1,
    levelTag: 'elementary',
    sortOrder: 12,
  },
  {
    question: '"There ___ many students in the class."',
    options: ['is', 'am', 'are', 'be'],
    correctIndex: 2,
    levelTag: 'elementary',
    sortOrder: 13,
  },
  {
    question: 'What does "frequently" mean?',
    options: ['rarely', 'sometimes', 'often', 'never'],
    correctIndex: 2,
    levelTag: 'elementary',
    sortOrder: 14,
  },
  {
    question: '"I will call you ___ I arrive."',
    options: ['until', 'before', 'since', 'when'],
    correctIndex: 3,
    levelTag: 'elementary',
    sortOrder: 15,
  },
  {
    question: '"If I ___ rich, I would travel the world."',
    options: ['am', 'was', 'were', 'will be'],
    correctIndex: 2,
    levelTag: 'intermediate',
    sortOrder: 16,
  },
  {
    question: 'Which sentence is in the passive voice?',
    options: [
      'The cat chased the mouse.',
      'The mouse was chased by the cat.',
      'The cat is chasing the mouse.',
      'A cat chases mice.',
    ],
    correctIndex: 1,
    levelTag: 'intermediate',
    sortOrder: 17,
  },
  {
    question: '"She suggested ___ the meeting."',
    options: ['to postpone', 'postponing', 'postpone', 'postponed'],
    correctIndex: 1,
    levelTag: 'intermediate',
    sortOrder: 18,
  },
  {
    question: 'What does "eloquent" mean?',
    options: ['well-spoken', 'quiet', 'confused', 'aggressive'],
    correctIndex: 0,
    levelTag: 'intermediate',
    sortOrder: 19,
  },
  {
    question: '"Despite ___ tired, she continued working."',
    options: ['being', 'be', 'been', 'to be'],
    correctIndex: 0,
    levelTag: 'intermediate',
    sortOrder: 20,
  },
  {
    question: '"He ___ in London for three years before moving to Paris."',
    options: ['lived', 'has lived', 'had lived', 'was living'],
    correctIndex: 2,
    levelTag: 'intermediate',
    sortOrder: 21,
  },
  {
    question: 'Choose the correct conditional: "If it rains tomorrow, we ___ stay inside."',
    options: ['will', 'would', 'should', 'shall'],
    correctIndex: 0,
    levelTag: 'intermediate',
    sortOrder: 22,
  },
  {
    question: 'What is the correct collocation?',
    options: ['do a mistake', 'make a mistake', 'have a mistake', 'take a mistake'],
    correctIndex: 1,
    levelTag: 'intermediate',
    sortOrder: 23,
  },
  {
    question: '"The report ___ by the committee before the deadline." (best tense)',
    options: [
      'has been submitted',
      'was submitted',
      'had been submitted',
      'will have been submitted',
    ],
    correctIndex: 2,
    levelTag: 'advanced',
    sortOrder: 24,
  },
  {
    question: '"The legislation, ___ was passed last year, has had little effect."',
    options: ['which', 'that', 'what', 'whom'],
    correctIndex: 0,
    levelTag: 'advanced',
    sortOrder: 25,
  },
  {
    question: 'What does "obsequious" mean?',
    options: ['defiant', 'excessively compliant', 'indifferent', 'authoritative'],
    correctIndex: 1,
    levelTag: 'advanced',
    sortOrder: 26,
  },
  {
    question: '"She was ___ by her colleagues for her innovative approach."',
    options: ['acclaimed', 'reclaimed', 'proclaimed', 'disclaimed'],
    correctIndex: 0,
    levelTag: 'advanced',
    sortOrder: 27,
  },
  {
    question: 'Choose the sentence with correct subject–verb agreement.',
    options: [
      'Neither the teachers nor the principal are responsible.',
      'Neither the teachers nor the principal is responsible.',
      'Neither the teachers nor principal are responsible.',
      'Neither teacher nor principal are responsible.',
    ],
    correctIndex: 1,
    levelTag: 'advanced',
    sortOrder: 28,
  },
  {
    question: 'What does "ephemeral" mean?',
    options: ['lasting forever', 'short-lived', 'extremely large', 'deeply significant'],
    correctIndex: 1,
    levelTag: 'advanced',
    sortOrder: 29,
  },
  {
    question: 'The ___ of the issue was far more nuanced than the report suggested.',
    options: ['crux', 'crust', 'crush', 'crutch'],
    correctIndex: 0,
    levelTag: 'advanced',
    sortOrder: 30,
  },
] as const;

type BankQuestion = (typeof QUESTION_BANK)[number];

interface Props {
  form: ReturnType<typeof Form.useForm>[0];
  optionCount: number;
  setOptionCount: (n: number) => void;
  showBank?: boolean;
}

export default function QuestionForm({
  form,
  optionCount,
  setOptionCount,
  showBank = true,
}: Props) {
  const [bankFilter, setBankFilter] = useState<string>('all');

  const levelColor = (tag: string) => LEVEL_TAGS.find((l) => l.value === tag)?.color ?? '#ccc';

  const pickFromBank = (q: BankQuestion) => {
    const opts = q.options.reduce((acc, opt, i) => ({ ...acc, [`option_${i}`]: opt }), {});
    form.setFieldsValue({
      question: q.question,
      correctIndex: q.correctIndex,
      levelTag: q.levelTag,
      sortOrder: q.sortOrder,
      ...opts,
    });
    setOptionCount(q.options.length);
  };

  const filteredBank =
    bankFilter === 'all' ? QUESTION_BANK : QUESTION_BANK.filter((q) => q.levelTag === bankFilter);

  return (
    <div>
      {/* ── Question Bank ── */}
      {showBank && (
        <Collapse
          ghost
          defaultActiveKey={['bank']}
          style={{
            marginBottom: 24,
            border: '1px solid #ede9fe',
            borderRadius: 12,
            background: '#faf5ff',
          }}
          items={[
            {
              key: 'bank',
              label: (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#6C5CE7',
                  }}
                >
                  <BulbOutlined /> Question Bank — click any to auto-fill the form
                </span>
              ),
              children: (
                <div>
                  {/* Level filter pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {['all', 'beginner', 'elementary', 'intermediate', 'advanced'].map((f) => {
                      const active = bankFilter === f;
                      const color = f === 'all' ? '#6C5CE7' : levelColor(f);
                      return (
                        <button
                          key={f}
                          onClick={() => setBankFilter(f)}
                          style={{
                            borderRadius: 999,
                            border: `1px solid ${active ? color : '#e5e7eb'}`,
                            color: active ? '#fff' : '#6b7280',
                            background: active ? color : '#fff',
                            padding: '2px 12px',
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                      );
                    })}
                  </div>

                  {/* Scrollable list */}
                  <div
                    style={{
                      maxHeight: 240,
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      paddingRight: 4,
                    }}
                  >
                    {filteredBank.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => pickFromBank(q)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          background: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: 8,
                          padding: '8px 12px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = '#a78bfa';
                          (e.currentTarget as HTMLButtonElement).style.background = '#f5f3ff';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb';
                          (e.currentTarget as HTMLButtonElement).style.background = '#fff';
                        }}
                      >
                        <span
                          style={{
                            flexShrink: 0,
                            marginTop: 2,
                            background: levelColor(q.levelTag),
                            color: '#fff',
                            borderRadius: 4,
                            padding: '1px 6px',
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {q.levelTag.slice(0, 3)}
                        </span>
                        <span style={{ flex: 1, fontSize: 13, color: '#374151', lineHeight: 1.4 }}>
                          {q.question}
                        </span>
                        <span
                          style={{ flexShrink: 0, fontSize: 11, color: '#a78bfa', fontWeight: 500 }}
                        >
                          Pick →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ),
            },
          ]}
        />
      )}

      {/* ── Form fields ── */}
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          name="question"
          label="Question"
          rules={[{ required: true, message: 'Enter the question' }]}
        >
          <TextArea rows={3} placeholder="e.g. Which sentence is correct?" />
        </Form.Item>

        {/* Dynamic options */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <label style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>
              Answer Options
            </label>
            <Space>
              <Button
                size="small"
                disabled={optionCount <= 2}
                onClick={() => setOptionCount(optionCount - 1)}
              >
                −
              </Button>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{optionCount}</span>
              <Button
                size="small"
                disabled={optionCount >= 6}
                onClick={() => setOptionCount(optionCount + 1)}
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
                  <span style={{ marginRight: 4, fontSize: 12, color: '#9ca3af' }}>
                    {String.fromCharCode(65 + i)}.
                  </span>
                }
              />
            </Form.Item>
          ))}
        </div>

        <Form.Item
          name="correctIndex"
          label="Correct Answer"
          rules={[{ required: true, message: 'Select the correct answer' }]}
        >
          <Select placeholder="Select the correct option">
            {Array.from({ length: optionCount }).map((_, i) => (
              <Option key={i} value={i}>
                {String.fromCharCode(65 + i)} — Option {i + 1}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <div style={{ display: 'flex', gap: 16 }}>
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
          <Form.Item name="sortOrder" label="Sort Order" style={{ width: 130 }}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </div>
      </Form>
    </div>
  );
}
