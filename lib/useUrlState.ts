"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { PracticeMode } from "@/components/ModeSelector";

type TabType = "quiz" | "text" | "stats";

const VALID_TABS: TabType[] = ["quiz", "text", "stats"];
const VALID_MODES: PracticeMode[] = ["fill", "progressive", "flash", "shuffle", "smart"];
const VALID_DE = [0, 1, 2, 3, 4, 5];

function parseTab(raw: string | null): TabType {
  return VALID_TABS.includes(raw as TabType) ? (raw as TabType) : "quiz";
}

function parseMode(raw: string | null): PracticeMode {
  return VALID_MODES.includes(raw as PracticeMode) ? (raw as PracticeMode) : "fill";
}

function parseDe(raw: string | null): 0 | 1 | 2 | 3 | 4 | 5 {
  const n = Number(raw);
  return VALID_DE.includes(n) ? (n as 0 | 1 | 2 | 3 | 4 | 5) : 0;
}

export function useUrlState() {
  const router = useRouter();
  const params = useSearchParams();

  const tab = parseTab(params.get("tab"));
  const mode = parseMode(params.get("mode"));
  const de = parseDe(params.get("de"));

  const setTab = useCallback(
    (next: TabType) => {
      const p = new URLSearchParams(params.toString());
      p.set("tab", next);
      router.replace(`?${p.toString()}`, { scroll: false });
    },
    [router, params]
  );

  const setMode = useCallback(
    (next: PracticeMode) => {
      const p = new URLSearchParams(params.toString());
      p.set("mode", next);
      router.replace(`?${p.toString()}`, { scroll: false });
    },
    [router, params]
  );

  const setDe = useCallback(
    (next: 0 | 1 | 2 | 3 | 4 | 5) => {
      const p = new URLSearchParams(params.toString());
      p.set("de", String(next));
      router.replace(`?${p.toString()}`, { scroll: false });
    },
    [router, params]
  );

  return { tab, mode, de, setTab, setMode, setDe };
}
