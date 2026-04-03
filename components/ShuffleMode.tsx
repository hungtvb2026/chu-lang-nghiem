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
  const [doneSet, setDoneSet] = useState<Set<number>>(new Set());

  const shuffled = useMemo(() => {
    const arr = [...quizVerses];
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

      setDoneSet((prev) => {
        const qv = shuffled.find((q) => q.verse.id === verseId);
        if (!qv) return prev;
        const allDone = Array.from(qv.hiddenIndices).every(
          (idx) =>
            correctSet.has(`${round}-${verseId}-${idx}`) || idx === wordIdx
        );
        return allDone ? new Set(prev).add(verseId) : prev;
      });
    },
    [shuffled, correctSet, round]
  );

  const handleEndRound = () => {
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

    setWrongVerseIds(new Set(wrong.map((qv) => qv.verse.id)));
    setCorrectSet(new Set());
    setDoneSet(new Set());
    setRound((r) => r + 1);
  };

  const displayVerses =
    round === 1
      ? shuffled
      : shuffled.filter((qv) => wrongVerseIds.has(qv.verse.id));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-5 animate-fade-in-up">
      {/* Round header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="text-lg font-bold font-serif px-4 py-1.5 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))',
              border: '1px solid var(--border-active)',
              color: 'var(--accent)',
            }}
          >
            Vòng {round}
          </span>
          {round > 1 && (
            <span
              className="text-xs font-medium px-3 py-1 rounded-full animate-fade-in"
              style={{
                color: 'var(--red-error)',
                background: 'var(--red-glow)',
                border: '1px solid rgba(248, 113, 113, 0.2)',
              }}
            >
              Luyện lại {displayVerses.length} câu sai
            </span>
          )}
        </div>
        <button
          onClick={handleEndRound}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                     hover:shadow-lg active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.08))',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: 'var(--accent)',
          }}
        >
          Kết thúc vòng →
        </button>
      </div>

      <ProgressBar correct={correctSet.size} total={totalBlanks} />

      {/* Verses */}
      <div
        className="glass-card rounded-2xl px-5 py-4 space-y-0.5"
      >
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
