"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Verse } from "@/lib/types";
import { generateQuiz, QuizVerse, Difficulty } from "@/lib/quiz";
import { useNotifications } from "@/lib/useNotifications";

const DEFAULT_ITEMS_PER_PAGE = 25;
const XP_PER_CORRECT = 10;

type UseQuizEngineProps = {
  verses: Verse[];
  difficulty: Difficulty;
  mode: "fill" | "progressive" | "flash" | "shuffle" | "smart";
  itemsPerPage?: number;
  onXP: (amount: number) => void;
  onCorrect: (verseId: number) => void;
  onWrong: (verseId: number) => void;
};

export function useQuizEngine({
  verses,
  difficulty,
  mode,
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
  onXP,
  onCorrect,
  onWrong,
}: UseQuizEngineProps) {
  const [seed, setSeed] = useState(0);
  const [correctSet, setCorrectSet] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const { showXP } = useNotifications();

  // Generate quiz
  const flashDifficulty: Difficulty = "expert";
  const activeDifficulty = mode === "flash" ? flashDifficulty : difficulty;

  const quizVerses: QuizVerse[] = useMemo(
    () => generateQuiz(verses, activeDifficulty, seed),
    [verses, activeDifficulty, seed]
  );

  const totalBlanks = useMemo(
    () => quizVerses.reduce((sum, qv) => sum + qv.hiddenIndices.size, 0),
    [quizVerses]
  );

  // Pagination
  const totalPages = Math.ceil(quizVerses.length / itemsPerPage);
  const paginatedVerses = useMemo(() => {
    const start = page * itemsPerPage;
    return quizVerses.slice(start, start + itemsPerPage);
  }, [quizVerses, page, itemsPerPage]);

  const allBlankIds = useMemo(() => {
    const ids: string[] = [];
    for (const qv of paginatedVerses) {
      const sorted = Array.from(qv.hiddenIndices).sort((a, b) => a - b);
      for (const idx of sorted) ids.push(`blank-${qv.verse.id}-${idx}`);
    }
    return ids;
  }, [paginatedVerses]);

  const allBlankIdsRef = useRef(allBlankIds);
  allBlankIdsRef.current = allBlankIds;

  // Reset page on verse/mode change
  useEffect(() => {
    setPage(0);
  }, [verses, mode]);

  const handleCorrect = useCallback(
    (verseId: number, wordIdx: number) => {
      onCorrect(verseId);
      setCorrectSet((prev) => new Set(prev).add(`${verseId}-${wordIdx}`));
      onXP(XP_PER_CORRECT);

      // Show XP popup near the answered blank
      const el = document.getElementById(`blank-${verseId}-${wordIdx}`);
      if (el) showXP(XP_PER_CORRECT, el);

      // Auto-focus next blank
      const ids = allBlankIdsRef.current;
      const pos = ids.indexOf(`blank-${verseId}-${wordIdx}`);
      const order = [...ids.slice(pos + 1), ...ids.slice(0, pos)];
      for (const id of order) {
        const nextEl = document.getElementById(id) as HTMLInputElement | null;
        if (nextEl) {
          nextEl.focus();
          break;
        }
      }
    },
    [onXP, onCorrect, showXP]
  );

  const handleWrong = useCallback((verseId: number) => {
    onWrong(verseId);
  }, [onWrong]);

  const refresh = useCallback(() => {
    setSeed((s) => s + 1);
    setCorrectSet(new Set());
    setPage(0);
  }, []);

  const resetCorrects = useCallback(() => {
    setCorrectSet(new Set());
  }, []);

  const isComplete =
    mode !== "flash" &&
    mode !== "shuffle" &&
    totalBlanks > 0 &&
    correctSet.size >= totalBlanks;

  return {
    seed,
    correctSet,
    page,
    setPage,
    quizVerses,
    paginatedVerses,
    totalBlanks,
    totalPages,
    itemsPerPage,
    handleCorrect,
    handleWrong,
    refresh,
    resetCorrects,
    isComplete,
  };
}

export { DEFAULT_ITEMS_PER_PAGE as ITEMS_PER_PAGE, XP_PER_CORRECT };
