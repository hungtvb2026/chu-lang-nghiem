"use client";

import { Target, Check } from "lucide-react";

type Props = {
  current: number;
  goal: number;
};

export default function DailyGoalRing({ current, goal }: Props) {
  const pct = Math.min(100, Math.round((current / goal) * 100));
  const done = pct >= 100;
  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return (
    <div
      className="relative flex items-center justify-center w-8 h-8 cursor-default"
      title={`Mục tiêu: ${current}/${goal} XP (${pct}%)`}
    >
      <svg className="absolute inset-0" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r={radius} fill="none"
          stroke="rgba(129, 140, 248, 0.08)" strokeWidth="2" />
        <circle cx="16" cy="16" r={radius} fill="none"
          stroke={done ? "var(--success)" : "var(--accent)"}
          strokeWidth="2" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="-rotate-90 origin-center transition-all duration-500" />
      </svg>
      {done ? (
        <Check size={11} strokeWidth={3} style={{ color: 'var(--success)' }} />
      ) : (
        <Target size={11} strokeWidth={2} style={{ color: 'var(--text-muted)' }} />
      )}
    </div>
  );
}
