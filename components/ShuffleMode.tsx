"use client";

import { useState, useMemo, useCallback } from "react";
import { QuizVerse } from "@/lib/quiz";
import QuizLine from "./QuizLine";
import ProgressBar from "./ProgressBar";

type Props = {
  quizVerses: QuizVerse[];
  seed: number;
  onComplete: (rounds: number, totalWrong: number) => void;
};

export default function ShuffleMode({ quizVerses, seed, onComplete }: Props) {
  const [round, setRound] = useState(1);
  const [correctSet, setCorrectSet] = useState<Set<string>>(new Set());
  const [wrongVerseIds, setWrongVerseIds] = useState<Set<number>>(new Set());
  const [totalWrongEver, setTotalWrongEver] = useState(0);
  const [doneSet, setDoneSet] = useState<Set<number>>(new Set()); // verses fully done this round

  // Shuffle verses for current round (seed changes per round)
  const shuffled = useMemo(() => {
    const arr = [...quizVerses];
    // Seeded shuffle
    let s = seed * 31 + round * 997;
    for (let i = arr.length - 1; i > 0; i--) {
      s = ((s * 1664525 + 1013904223) >>> 0);
      const j = s % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [quizVerses, seed, round]);

  const totalBlanks = useMemo(
    () => shuffled.reduce((s, qv) => s + qv.hiddenIndices.size, 0),
    [shuffled]
  );

  const handleCorrect = useCallback(
    (verseId: number, wordIdx: number) => {
      const key = `${round}-${verseId}-${wordIdx}`;
      setCorrectSet((prev) => new Set(prev).add(key));

      // Check if entire verse is now done
      setDoneSet((prev) => {
        const qv = shuffled.find((q) => q.verse.id === verseId);
        if (!qv) return prev;
        const allDone = Array.from(qv.hiddenIndices).every((idx) =>
          correctSet.has(`${round}-${verseId}-${idx}`) || idx === wordIdx
        );
        return allDone ? new Set(prev).add(verseId) : prev;
      });
    },
    [shuffled, correctSet, round]
  );

  const handleEndRound = () => {
    // Find verses with at least one wrong (not in correctSet)
    const wrong = shuffled.filter((qv) => {
      const allCorrect = Array.from(qv.hiddenIndices).every((idx) =>
        correctSet.has(`${round}-${qv.verse.id}-${idx}`)
      );
      return !allCorrect;
    });

    const wrongCount = wrong.length;
    setTotalWrongEver((t) => t + wrongCount);

    if (wrongCount === 0) {
      onComplete(round, totalWrongEver);
      return;
    }

    // Next round: only wrong verses
    setWrongVerseIds(new Set(wrong.map((qv) => qv.verse.id)));
    setCorrectSet(new Set());
    setDoneSet(new Set());
    setRound((r) => r + 1);
  };

  const displayVerses = round === 1
    ? shuffled
    : shuffled.filter((qv) => wrongVerseIds.has(qv.verse.id));

  const isDone = correctSet.size >= totalBlanks && round > 1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Round header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-amber-400 font-bold font-serif text-lg">
            Vòng {round}
          </span>
          {round > 1 && (
            <span className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 px-2 py-0.5 rounded-full">
              Luyện lại {displayVerses.length} câu sai
            </span>
          )}
        </div>
        <button
          onClick={handleEndRound}
          className="px-4 py-2 rounded-lg bg-amber-700/20 hover:bg-amber-700/40 border
                     border-amber-700/40 text-amber-300 text-sm font-medium transition-all duration-200"
        >
          Kết thúc vòng →
        </button>
      </div>

      <ProgressBar correct={correctSet.size} total={totalBlanks} />

      {/* Verses */}
      <div className="bg-stone-900/50 rounded-2xl border border-stone-800 px-5 py-4 space-y-0.5">
        {displayVerses.map((qv) => (
          <QuizLine
            key={`shuffle-${round}-${qv.verse.id}-${seed}`}
            qv={qv}
            onCorrect={(wordIdx) => handleCorrect(qv.verse.id, wordIdx)}
            onReveal={() => {}}
          />
        ))}
      </div>
    </div>
  );
}
