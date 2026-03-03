'use client';

import { Tag } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { LEVEL_TAGS } from './QuestionFields';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

interface Props {
  question: string;
  options: string[];
  correctIndex: number;
  levelTag: string;
}

export default function LivePreview({ question, options, correctIndex, levelTag }: Props) {
  const lvl = LEVEL_TAGS.find((l) => l.value === levelTag);
  const hasContent = question || options.some(Boolean);

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <EyeOutlined className="text-zinc-400" />
        <span className="text-xs font-semibold tracking-wide text-zinc-400 uppercase">
          Live Preview
        </span>
        {lvl && (
          <Tag
            color={lvl.color}
            className="ml-auto"
            style={{ color: '#fff', borderColor: 'transparent', fontSize: 11 }}
          >
            {lvl.label}
          </Tag>
        )}
      </div>

      {!hasContent ? (
        <div className="flex flex-col items-center rounded-xl border border-zinc-100 bg-zinc-50 py-8 text-center">
          <span className="mb-2 text-2xl">📝</span>
          <p className="text-xs text-zinc-400">Fill the form to see a preview</p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 shadow-sm">
          {/* Question */}
          <p className="mb-3 text-sm leading-snug font-semibold break-words text-zinc-900">
            {question || <span className="text-zinc-300 italic">Question text…</span>}
          </p>

          {/* Options */}
          <div className="flex flex-col gap-1.5">
            {options.map((opt, i) => {
              if (!opt && i >= 2) return null;
              const isCorrect = i === correctIndex;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                    isCorrect
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-600'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold ${
                      isCorrect ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-500'
                    }`}
                  >
                    {isCorrect ? '✓' : LETTERS[i]}
                  </span>
                  <span className="min-w-0 flex-1 break-words">
                    {opt || <span className="text-zinc-300 italic">Option {LETTERS[i]}…</span>}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Correct hint */}
          {options[correctIndex] && (
            <p className="mt-3 text-[10px] text-emerald-600">✓ Correct: {options[correctIndex]}</p>
          )}
        </div>
      )}
    </div>
  );
}
