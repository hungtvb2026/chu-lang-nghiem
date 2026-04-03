"use client";

import { Flame, Snowflake, Sparkles } from "lucide-react";

type Props = {
  streak: number;
  bestStreak: number;
};

export default function StreakBadge({ streak, bestStreak }: Props) {
  const isFire = streak >= 7;

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-300"
      style={{
        background: streak > 0
          ? isFire
            ? 'linear-gradient(135deg, rgba(248, 113, 113, 0.12), rgba(232, 168, 56, 0.08))'
            : 'var(--accent-ghost)'
          : 'var(--bg-elevated)',
        border: `1px solid ${streak > 0 ? 'rgba(232, 168, 56, 0.15)' : 'var(--border-subtle)'}`,
      }}
      title={`Streak: ${streak} ngày | Kỷ lục: ${bestStreak} ngày`}
    >
      {streak === 0 ? (
        <Snowflake size={14} style={{ color: 'var(--text-muted)' }} />
      ) : isFire ? (
        <Flame size={14} className="animate-pulse" style={{ color: '#f87171' }} />
      ) : (
        <Sparkles size={14} style={{ color: 'var(--accent)' }} />
      )}
      <span
        className="text-xs font-bold tabular-nums"
        style={{ color: streak > 0 ? 'var(--accent)' : 'var(--text-muted)' }}
      >
        {streak}
      </span>
    </div>
  );
}
