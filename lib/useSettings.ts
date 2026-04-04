"use client";
import { useState, useEffect } from "react";
import { Difficulty } from "./quiz";

export type Settings = {
  de: 0 | 1 | 2 | 3 | 4 | 5;
  difficulty: Difficulty;
  dailyGoal: number;       // XP goal per day (20–200)
  flashDuration: number;   // seconds to memorize in Flash mode (1–10)
  itemsPerPage: number;    // verses per page (10–50)
};

const DEFAULT: Settings = {
  de: 0,
  difficulty: "easy",
  dailyGoal: 50,
  flashDuration: 3,
  itemsPerPage: 25,
};

const STORAGE_KEY = "chu_settings";

function isValidSettings(data: unknown): data is Partial<Settings> {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if ("de" in d && ![0, 1, 2, 3, 4, 5].includes(d.de as number)) return false;
  if ("difficulty" in d && !["easy", "medium", "hard", "expert"].includes(d.difficulty as string)) return false;
  if ("dailyGoal" in d && (typeof d.dailyGoal !== "number" || d.dailyGoal < 20 || d.dailyGoal > 200)) return false;
  if ("flashDuration" in d && (typeof d.flashDuration !== "number" || d.flashDuration < 1 || d.flashDuration > 10)) return false;
  if ("itemsPerPage" in d && (typeof d.itemsPerPage !== "number" || d.itemsPerPage < 10 || d.itemsPerPage > 50)) return false;
  return true;
}

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (isValidSettings(parsed)) {
          setSettingsState({ ...DEFAULT, ...parsed });
        }
      }
    } catch (_) {}
    setHydrated(true);
  }, []);

  const setSettings = (next: Partial<Settings>) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...next };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  return { settings, setSettings, hydrated };
}
