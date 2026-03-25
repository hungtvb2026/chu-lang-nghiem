"use client";

import { DE_LABELS } from "@/lib/types";

type DeValue = 0 | 1 | 2 | 3 | 4 | 5;

type Props = {
  value: DeValue;
  onChange: (de: DeValue) => void;
};

const OPTIONS: { label: string; value: DeValue }[] = [
  { label: "Tất Cả", value: 0 },
  { label: DE_LABELS[1], value: 1 },
  { label: DE_LABELS[2], value: 2 },
  { label: DE_LABELS[3], value: 3 },
  { label: DE_LABELS[4], value: 4 },
  { label: DE_LABELS[5], value: 5 },
];

export default function DeSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`
            px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
            border border-amber-700/50
            ${value === opt.value
              ? "bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-900/40"
              : "bg-stone-800/60 text-stone-300 hover:bg-stone-700/60 hover:text-amber-300"
            }
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
