"use client";

import { Difficulty, DIFFICULTY_CONFIG } from "@/lib/quiz";

type Props = {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
};

const LEVELS: Difficulty[] = ["easy", "medium", "hard", "expert"];

export default function DifficultySelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {LEVELS.map((level) => {
        const cfg = DIFFICULTY_CONFIG[level];
        const active = value === level;
        return (
          <button
            key={level}
            onClick={() => onChange(level)}
            title={`${cfg.ratio * 100}% từ bị ẩn`}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
              border
              ${active
                ? "bg-stone-700 border-amber-500 text-amber-300 shadow-md shadow-amber-900/30"
                : "bg-stone-800/40 border-stone-600/40 text-stone-400 hover:border-stone-500 hover:text-stone-200"
              }
            `}
          >
            <span className="mr-1">{cfg.emoji}</span>
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}
