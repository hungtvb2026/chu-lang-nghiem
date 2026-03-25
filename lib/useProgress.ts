"use client";
import { useState, useEffect } from "react";

// Tracks how many times user has completed each đệ (0 = all)
// completions[de] increments each full completion → maps to difficulty
export type ProgressData = Record<string, number>; // key = de as string

const STORAGE_KEY = "chu_progress";

const DIFFICULTY_FROM_LEVEL = ["easy", "medium", "hard", "expert"] as const;
export type Difficulty = (typeof DIFFICULTY_FROM_LEVEL)[number];

export function levelToDifficulty(count: number): Difficulty {
  const idx = Math.min(count, DIFFICULTY_FROM_LEVEL.length - 1);
  return DIFFICULTY_FROM_LEVEL[idx];
}

export function useProgress() {
  const [data, setData] = useState<ProgressData>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch (_) {}
  }, []);

  const getLevel = (de: number): number => data[String(de)] ?? 0;

  const increment = (de: number) => {
    setData((prev) => {
      const next = { ...prev, [String(de)]: (prev[String(de)] ?? 0) + 1 };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (_) {}
      return next;
    });
  };

  const reset = (de: number) => {
    setData((prev) => {
      const next = { ...prev, [String(de)]: 0 };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (_) {}
      return next;
    });
  };

  return { getLevel, increment, reset };
}
