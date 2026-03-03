'use client';

import { useState } from 'react';
import { Form } from 'antd';
import { BulbOutlined } from '@ant-design/icons';

export const QUESTION_BANK = [
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

export type BankQuestion = (typeof QUESTION_BANK)[number];

const LEVEL_COLORS: Record<string, string> = {
  beginner: '#00B894',
  elementary: '#74B9FF',
  intermediate: '#FDCB6E',
  advanced: '#FF7675',
};

const FILTERS = ['all', 'beginner', 'elementary', 'intermediate', 'advanced'];

interface Props {
  form: ReturnType<typeof Form.useForm>[0];
  setOptionCount: (n: number) => void;
}

export default function QuestionBank({ form, setOptionCount }: Props) {
  const [filter, setFilter] = useState('all');
  const [picked, setPicked] = useState<number | null>(null);

  const filtered =
    filter === 'all' ? QUESTION_BANK : QUESTION_BANK.filter((q) => q.levelTag === filter);

  const pick = (q: BankQuestion, idx: number) => {
    const opts = q.options.reduce((acc, opt, i) => ({ ...acc, [`option_${i}`]: opt }), {});
    form.setFieldsValue({
      question: q.question,
      correctIndex: q.correctIndex,
      levelTag: q.levelTag,
      sortOrder: q.sortOrder,
      ...opts,
    });
    setOptionCount(q.options.length);
    setPicked(idx);
  };

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {/* Header — full-bleed, clipped by card's overflow-hidden + rounded-2xl */}
      <div
        className="flex items-center gap-2 bg-violet-50 px-5 py-4"
        style={{ margin: '-20px -20px 16px -20px', borderBottom: '1px solid #ede9fe' }}
      >
        <BulbOutlined className="text-violet-500" />
        <div>
          <p className="text-sm font-semibold text-violet-700">Question Bank</p>
          <p className="text-xs text-violet-400">Click any question to auto-fill the form</p>
        </div>
        <span className="ml-auto rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-600">
          {QUESTION_BANK.length}
        </span>
      </div>

      {/* Level filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f;
          const color = f === 'all' ? '#6C5CE7' : LEVEL_COLORS[f];
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="rounded-full border px-3 py-0.5 text-xs font-semibold capitalize transition-all"
              style={{
                background: active ? color : '#fff',
                borderColor: active ? color : '#e5e7eb',
                color: active ? '#fff' : '#6b7280',
              }}
            >
              {f === 'all' ? 'All 30' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Question list */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 340px)', marginLeft: -4, marginRight: -4 }}
      >
        {filtered.map((q, idx) => {
          const globalIdx = QUESTION_BANK.indexOf(q as BankQuestion);
          const isActive = picked === globalIdx;
          const color = LEVEL_COLORS[q.levelTag];
          return (
            <button
              key={idx}
              type="button"
              onClick={() => pick(q as BankQuestion, globalIdx)}
              style={{
                display: 'flex',
                width: '100%',
                alignItems: 'flex-start',
                gap: 10,
                padding: '9px 12px',
                textAlign: 'left',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.12s',
                background: isActive ? '#ede9fe' : 'transparent',
                marginBottom: 2,
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = '#f5f3ff';
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              {/* Level badge */}
              <span
                style={{
                  flexShrink: 0,
                  marginTop: 1,
                  background: color,
                  color: '#fff',
                  borderRadius: 5,
                  padding: '1px 6px',
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  lineHeight: '18px',
                }}
              >
                {q.levelTag.slice(0, 3)}
              </span>

              {/* Question text */}
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 12,
                  lineHeight: 1.45,
                  color: isActive ? '#5b21b6' : '#4b5563',
                  fontWeight: isActive ? 500 : 400,
                  wordBreak: 'break-word',
                  paddingRight: 8,
                }}
              >
                {q.question}
              </span>

              {/* Indicator */}
              <span
                style={{
                  flexShrink: 0,
                  marginTop: 1,
                  fontSize: 11,
                  fontWeight: 700,
                  color: isActive ? '#7c3aed' : '#d1d5db',
                }}
              >
                {isActive ? '✓' : '›'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
