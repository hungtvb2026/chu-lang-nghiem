"use client";

import { useState, useEffect, useCallback } from "react";
import { Achievement, TIER_COLORS } from "@/lib/achievements";
import { Award } from "lucide-react";

type ToastItem = {
  id: string;
  achievement: Achievement;
};

let toastQueue: ((a: Achievement) => void) | null = null;

export function showAchievementToast(achievement: Achievement) {
  if (toastQueue) toastQueue(achievement);
}

export default function AchievementToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((achievement: Achievement) => {
    const id = `${achievement.id}-${Date.now()}`;
    setToasts((prev) => [...prev, { id, achievement }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    toastQueue = addToast;
    return () => { toastQueue = null; };
  }, [addToast]);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((t) => {
        const colors = TIER_COLORS[t.achievement.tier];
        return (
          <div
            key={t.id}
            className="pointer-events-auto animate-toast-in rounded-xl px-4 py-3 flex items-center gap-3 shadow-2xl"
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              backdropFilter: 'blur(16px)',
              minWidth: '280px',
            }}
          >
            <Award size={24} style={{ color: colors.text }} />
            <div>
              <p className="text-xs font-bold" style={{ color: colors.text }}>
                Thành tựu mới!
              </p>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t.achievement.title}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {t.achievement.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
