"use client";

import { useState, useEffect, useCallback } from "react";

export type DailyEntry = {
  xp: number;
  correct: number;
  wrong: number;
};

export type GameStats = {
  totalXP: number;
  level: number;
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  dailyXP: number;
  dailyGoal: number;
  totalCorrect: number;
  totalWrong: number;
  totalSessions: number;
  totalTimeSeconds: number;
  achievements: string[];
  dailyHistory: Record<string, DailyEntry>;
  deCompleted: number[];
  flashPerfect: boolean;
};

const STORAGE_KEY = "chu_game_stats";

const DEFAULT_STATS: GameStats = {
  totalXP: 0,
  level: 1,
  currentStreak: 0,
  bestStreak: 0,
  lastActiveDate: "",
  dailyXP: 0,
  dailyGoal: 50,
  totalCorrect: 0,
  totalWrong: 0,
  totalSessions: 0,
  totalTimeSeconds: 0,
  achievements: [],
  dailyHistory: {},
  deCompleted: [],
  flashPerfect: false,
};

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function xpForLevel(level: number): number {
  // Exponential curve: level 1=0, 2=100, 3=250, 4=450, ...
  return Math.floor(50 * level * (level - 1));
}

export function getLevelFromXP(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return level;
}

export function getXPProgress(xp: number): { current: number; needed: number; pct: number } {
  const level = getLevelFromXP(xp);
  const currentLevelXP = xpForLevel(level);
  const nextLevelXP = xpForLevel(level + 1);
  const progress = xp - currentLevelXP;
  const needed = nextLevelXP - currentLevelXP;
  return { current: progress, needed, pct: Math.round((progress / needed) * 100) };
}

export function useGameStats() {
  const [stats, setStatsState] = useState<GameStats>(DEFAULT_STATS);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = { ...DEFAULT_STATS, ...JSON.parse(raw) };
        // Check streak continuity
        const today = getToday();
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

        if (parsed.lastActiveDate !== today && parsed.lastActiveDate !== yesterday) {
          // Streak broken
          parsed.currentStreak = 0;
        }

        // Reset daily XP if new day
        if (parsed.lastActiveDate !== today) {
          parsed.dailyXP = 0;
        }

        setStatsState(parsed);
      }
    } catch {}
    setHydrated(true);
  }, []);

  const save = useCallback((next: GameStats) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const addXP = useCallback(
    (amount: number) => {
      setStatsState((prev) => {
        const today = getToday();
        const isNewDay = prev.lastActiveDate !== today;

        const newDailyXP = (isNewDay ? 0 : prev.dailyXP) + amount;
        const newTotalXP = prev.totalXP + amount;
        const newLevel = getLevelFromXP(newTotalXP);

        // Update streak
        let newStreak = prev.currentStreak;
        if (isNewDay) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
          if (prev.lastActiveDate === yesterday || prev.lastActiveDate === "") {
            newStreak = prev.currentStreak + 1;
          } else {
            newStreak = 1;
          }
        }

        // Update daily history
        const prevDay = prev.dailyHistory[today] || { xp: 0, correct: 0, wrong: 0 };
        const dailyHistory = {
          ...prev.dailyHistory,
          [today]: { ...prevDay, xp: prevDay.xp + amount },
        };

        const next: GameStats = {
          ...prev,
          totalXP: newTotalXP,
          level: newLevel,
          dailyXP: newDailyXP,
          currentStreak: newStreak,
          bestStreak: Math.max(prev.bestStreak, newStreak),
          lastActiveDate: today,
          dailyHistory,
        };
        save(next);
        return next;
      });
    },
    [save]
  );

  const addCorrect = useCallback(() => {
    setStatsState((prev) => {
      const today = getToday();
      const prevDay = prev.dailyHistory[today] || { xp: 0, correct: 0, wrong: 0 };
      const next: GameStats = {
        ...prev,
        totalCorrect: prev.totalCorrect + 1,
        dailyHistory: {
          ...prev.dailyHistory,
          [today]: { ...prevDay, correct: prevDay.correct + 1 },
        },
      };
      save(next);
      return next;
    });
  }, [save]);

  const addWrong = useCallback(() => {
    setStatsState((prev) => {
      const today = getToday();
      const prevDay = prev.dailyHistory[today] || { xp: 0, correct: 0, wrong: 0 };
      const next: GameStats = {
        ...prev,
        totalWrong: prev.totalWrong + 1,
        dailyHistory: {
          ...prev.dailyHistory,
          [today]: { ...prevDay, wrong: prevDay.wrong + 1 },
        },
      };
      save(next);
      return next;
    });
  }, [save]);

  const completeDe = useCallback(
    (de: number) => {
      setStatsState((prev) => {
        if (prev.deCompleted.includes(de)) return prev;
        const next: GameStats = {
          ...prev,
          deCompleted: [...prev.deCompleted, de],
        };
        save(next);
        return next;
      });
    },
    [save]
  );

  const completeSession = useCallback(
    (timeSeconds: number) => {
      setStatsState((prev) => {
        const next: GameStats = {
          ...prev,
          totalSessions: prev.totalSessions + 1,
          totalTimeSeconds: prev.totalTimeSeconds + timeSeconds,
        };
        save(next);
        return next;
      });
    },
    [save]
  );

  const setFlashPerfect = useCallback(() => {
    setStatsState((prev) => {
      const next: GameStats = { ...prev, flashPerfect: true };
      save(next);
      return next;
    });
  }, [save]);

  const unlockAchievement = useCallback(
    (id: string) => {
      setStatsState((prev) => {
        if (prev.achievements.includes(id)) return prev;
        const next: GameStats = {
          ...prev,
          achievements: [...prev.achievements, id],
        };
        save(next);
        return next;
      });
    },
    [save]
  );

  return {
    stats,
    hydrated,
    addXP,
    addCorrect,
    addWrong,
    completeDe,
    completeSession,
    setFlashPerfect,
    unlockAchievement,
  };
}
