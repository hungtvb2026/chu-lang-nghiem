"use client";
import { useState, useEffect } from "react";
import { Difficulty } from "./quiz";

export type Settings = {
  de: 0 | 1 | 2 | 3 | 4 | 5;
  difficulty: Difficulty;
};

const DEFAULT: Settings = { de: 0, difficulty: "easy" };
const STORAGE_KEY = "chu_settings";

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettingsState(JSON.parse(raw));
    } catch (_) {}
    setHydrated(true);
  }, []);

  const setSettings = (next: Partial<Settings>) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...next };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
  };

  return { settings, setSettings, hydrated };
}
