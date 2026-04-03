"use client";

import { getXPProgress } from "@/lib/useGameStats";

type Props = {
  level: number;
  totalXP: number;
};

export default function LevelBadge({ level, totalXP }: Props) {
  const { pct } = getXPProgress(totalXP);
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return (
    <div
      className="relative flex items-center justify-center w-9 h-9 cursor-default"
      title={`Level ${level} — ${pct}% đến level tiếp theo`}
    >
      <svg className="absolute inset-0" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r={radius} fill="none"
          stroke="rgba(129, 140, 248, 0.08)" strokeWidth="2.5" />
        <circle cx="18" cy="18" r={radius} fill="none"
          stroke="url(#lvGrad)" strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="-rotate-90 origin-center transition-all duration-700" />
        <defs>
          <linearGradient id="lvGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--indigo)" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-[11px] font-bold tabular-nums" style={{ color: 'var(--accent)' }}>
        {level}
      </span>
    </div>
  );
}
