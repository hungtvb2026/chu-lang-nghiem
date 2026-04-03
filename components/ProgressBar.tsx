"use client";

import { useEffect, useRef } from "react";
import { Flower2 } from "lucide-react";

type Props = {
  correct: number;
  total: number;
};

export default function ProgressBar({ correct, total }: Props) {
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
  const prevPct = useRef(pct);

  useEffect(() => {
    prevPct.current = pct;
  }, [pct]);

  const milestones = [25, 50, 75, 100];

  return (
    <div className="space-y-1.5">
      {/* Bar container */}
      <div className="relative h-2.5 rounded-full overflow-hidden"
        style={{ background: 'var(--bg-elevated)' }}
      >
        {milestones.map((m) => (
          <div
            key={m}
            className="absolute top-0 bottom-0 w-px"
            style={{
              left: `${m}%`,
              background: pct >= m
                ? 'rgba(74, 222, 128, 0.25)'
                : 'rgba(129, 140, 248, 0.08)',
            }}
          />
        ))}

        <div
          className={`h-full rounded-full transition-all duration-700 ease-out relative ${
            pct >= 80 ? 'animate-glow-pulse' : ''
          }`}
          style={{
            width: `${pct}%`,
            background: pct >= 100
              ? 'linear-gradient(90deg, var(--success), #10b981)'
              : pct >= 75
              ? 'linear-gradient(90deg, var(--accent), var(--success))'
              : 'linear-gradient(90deg, var(--accent-dark), var(--accent), var(--accent-light))',
            boxShadow: pct > 0 ? '0 0 10px var(--accent-glow)' : 'none',
          }}
        >
          {pct > 0 && pct < 100 && (
            <div
              className="absolute inset-0 rounded-full animate-shimmer"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
              }}
            />
          )}
        </div>
      </div>

      {/* Label */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {milestones.map((m) => (
            <span
              key={m}
              className={`transition-colors duration-300 ${
                pct >= m ? '' : ''
              }`}
              style={{ color: pct >= m ? 'var(--accent)' : 'var(--text-muted)' }}
            >
              {m === 100 ? <Flower2 size={12} className="inline" /> : `${m}%`}
            </span>
          ))}
        </div>
        <span
          className="tabular-nums font-medium transition-colors duration-300"
          style={{ color: pct >= 100 ? 'var(--success)' : 'var(--text-secondary)' }}
        >
          {correct}/{total} ({pct}%)
        </span>
      </div>
    </div>
  );
}
