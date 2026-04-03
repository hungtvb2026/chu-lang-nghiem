"use client";

import { Flower2 } from "lucide-react";

export default function SkeletonLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 animate-fade-in">
      {/* Lotus animation */}
      <div className="relative">
        <Flower2 size={48} className="animate-float" style={{ color: 'var(--accent)' }} />
        <div
          className="absolute -inset-4 rounded-full animate-pulse"
          style={{
            background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Skeleton bars */}
      <div className="space-y-3 w-64">
        <div className="h-3 rounded-full animate-shimmer"
          style={{
            background: 'linear-gradient(90deg, var(--bg-elevated) 0%, var(--bg-card) 50%, var(--bg-elevated) 100%)',
            backgroundSize: '200% 100%',
          }}
        />
        <div className="h-3 rounded-full animate-shimmer w-3/4 mx-auto"
          style={{
            background: 'linear-gradient(90deg, var(--bg-elevated) 0%, var(--bg-card) 50%, var(--bg-elevated) 100%)',
            backgroundSize: '200% 100%',
            animationDelay: '0.2s',
          }}
        />
        <div className="h-3 rounded-full animate-shimmer w-1/2 mx-auto"
          style={{
            background: 'linear-gradient(90deg, var(--bg-elevated) 0%, var(--bg-card) 50%, var(--bg-elevated) 100%)',
            backgroundSize: '200% 100%',
            animationDelay: '0.4s',
          }}
        />
      </div>

      <p className="text-sm font-serif animate-pulse" style={{ color: 'var(--accent)' }}>
        Đang tải kinh văn…
      </p>
    </div>
  );
}
