"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { Achievement, TIER_COLORS } from "@/lib/achievements";
import { Award } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type XPEvent = {
  id: number;
  amount: number;
  x: number;
  y: number;
};

type ToastItem = {
  id: string;
  achievement: Achievement;
};

type NotificationContextType = {
  showXP: (amount: number, element?: HTMLElement) => void;
  showAchievement: (achievement: Achievement) => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const NotificationContext = createContext<NotificationContextType>({
  showXP: () => {},
  showAchievement: () => {},
});

export function useNotifications() {
  return useContext(NotificationContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

let xpEventId = 0;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [xpPopups, setXpPopups] = useState<XPEvent[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const xpTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const toastTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      xpTimers.current.forEach(clearTimeout);
      toastTimers.current.forEach(clearTimeout);
    };
  }, []);

  const showXP = useCallback((amount: number, element?: HTMLElement) => {
    const id = ++xpEventId;
    const x = element
      ? element.getBoundingClientRect().left + element.offsetWidth / 2
      : window.innerWidth / 2;
    const y = element ? element.getBoundingClientRect().top : window.innerHeight / 2;

    setXpPopups((prev) => [...prev, { id, amount, x, y }]);

    const timer = setTimeout(() => {
      setXpPopups((prev) => prev.filter((p) => p.id !== id));
      xpTimers.current.delete(id);
    }, 1200);
    xpTimers.current.set(id, timer);
  }, []);

  const showAchievement = useCallback((achievement: Achievement) => {
    const id = `${achievement.id}-${Date.now()}`;
    setToasts((prev) => [...prev, { id, achievement }]);

    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      toastTimers.current.delete(id);
    }, 4000);
    toastTimers.current.set(id, timer);
  }, []);

  return (
    <NotificationContext.Provider value={{ showXP, showAchievement }}>
      {children}

      {/* XP Popups */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {xpPopups.map((p) => (
          <div
            key={p.id}
            className="absolute text-sm font-bold animate-xp-float"
            style={{
              left: p.x,
              top: p.y,
              color: "var(--accent)",
              textShadow: "0 0 8px var(--accent-glow)",
            }}
          >
            +{p.amount} XP
          </div>
        ))}
      </div>

      {/* Achievement Toasts */}
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
                backdropFilter: "blur(16px)",
                minWidth: "280px",
              }}
            >
              <Award size={24} style={{ color: colors.text }} />
              <div>
                <p className="text-xs font-bold" style={{ color: colors.text }}>
                  Thành tựu mới!
                </p>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {t.achievement.title}
                </p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {t.achievement.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}
