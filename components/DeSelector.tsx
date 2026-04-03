"use client";

import { DE_LABELS } from "@/lib/types";

type DeValue = 0 | 1 | 2 | 3 | 4 | 5;

type Props = {
  value: DeValue;
  onChange: (de: DeValue) => void;
};

const OPTIONS: { label: string; value: DeValue; short: string }[] = [
  { label: "Tất Cả", value: 0, short: "Tất cả" },
  { label: DE_LABELS[1], value: 1, short: "Đệ 1" },
  { label: DE_LABELS[2], value: 2, short: "Đệ 2" },
  { label: DE_LABELS[3], value: 3, short: "Đệ 3" },
  { label: DE_LABELS[4], value: 4, short: "Đệ 4" },
  { label: DE_LABELS[5], value: 5, short: "Đệ 5" },
];

export default function DeSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1 sm:inline-flex sm:flex-nowrap sm:rounded-xl sm:p-1 sm:gap-0.5"
      style={{ background: 'transparent' }}>
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`
              px-3 py-2 sm:py-1.5 rounded-lg text-sm font-medium
              transition-all duration-200 active:scale-95
              ${active
                ? "text-white shadow-lg"
                : "text-slate-400 hover:text-slate-200"
              }
            `}
            style={active ? {
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
            } : {
              background: 'var(--bg-elevated)',
            }}
          >
            <span className="sm:hidden">{opt.short}</span>
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
