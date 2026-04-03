"use client";

import { Difficulty, DIFFICULTY_CONFIG } from "@/lib/quiz";

type Props = {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
};

const LEVELS: Difficulty[] = ["easy", "medium", "hard", "expert"];

const LEVEL_COLORS: Record<Difficulty, string> = {
  easy: '#4ade80',
  medium: '#e8a838',
  hard: '#f97316',
  expert: '#f87171',
};

export default function DifficultySelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-1.5">
      {LEVELS.map((level) => {
        const cfg = DIFFICULTY_CONFIG[level];
        const active = value === level;
        const color = LEVEL_COLORS[level];
        return (
          <button
            key={level}
            onClick={() => onChange(level)}
            title={`${cfg.ratio * 100}% từ bị ẩn`}
            className={`
              px-3 py-1.5 rounded-lg text-[13px] font-semibold
              transition-all duration-200 active:scale-95
            `}
            style={active ? {
              background: `${color}12`,
              border: `1px solid ${color}40`,
              color: color,
            } : {
              background: 'transparent',
              border: '1px solid transparent',
              color: 'var(--text-muted)',
            }}
          >
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}
