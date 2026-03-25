"use client";

import { useState, useEffect, useCallback } from "react";
import { QuizVerse } from "@/lib/quiz";
import QuizLine from "./QuizLine";

type Props = {
  quizVerses: QuizVerse[];       // verses with ALL words hidden (caller sets difficulty to 100%)
  flashDuration?: number;        // seconds to show each verse (default 3)
  onComplete: (wrongIds: number[]) => void;
};

type Phase = "memorize" | "recall" | "result";

export default function FlashMode({ quizVerses, flashDuration = 3, onComplete }: Props) {
  const [cardIdx, setCardIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("memorize");
  const [countdown, setCountdown] = useState(flashDuration);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalBlanks, setTotalBlanks] = useState(0);
  const [cardCorrects, setCardCorrects] = useState<Set<string>>(new Set());
  const [wrongCards, setWrongCards] = useState<number[]>([]);

  const currentQV = quizVerses[cardIdx];
  const isLast = cardIdx === quizVerses.length - 1;

  // Reset when card changes
  useEffect(() => {
    setPhase("memorize");
    setCountdown(flashDuration);
    setCardCorrects(new Set());
    setTotalBlanks(currentQV?.hiddenIndices.size ?? 0);
    setCorrectCount(0);
  }, [cardIdx, currentQV, flashDuration]);

  // Countdown timer during memorize phase
  useEffect(() => {
    if (phase !== "memorize") return;
    if (countdown <= 0) { setPhase("recall"); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const handleCorrect = useCallback((wordIdx: number) => {
    const key = `${currentQV.verse.id}-${wordIdx}`;
    setCardCorrects((prev) => new Set(prev).add(key));
    setCorrectCount((c) => c + 1);
  }, [currentQV]);

  const handleNext = () => {
    // Check if card was fully correct
    const allCorrect = correctCount >= currentQV.hiddenIndices.size;
    if (!allCorrect) setWrongCards((prev) => [...prev, currentQV.verse.id]);

    if (isLast) {
      onComplete(wrongCards.concat(allCorrect ? [] : [currentQV.verse.id]));
    } else {
      setCardIdx((i) => i + 1);
    }
  };

  if (!currentQV) return null;

  const pct = Math.round(((flashDuration - countdown) / flashDuration) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress header */}
      <div className="flex items-center justify-between mb-6 text-sm text-stone-500">
        <span>Câu {cardIdx + 1} / {quizVerses.length}</span>
        <span className="text-amber-500 font-medium">
          {wrongCards.length > 0 ? `${wrongCards.length} câu sai` : "Chưa có câu sai"}
        </span>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-stone-700 bg-stone-900/70 overflow-hidden">
        {/* Verse number */}
        <div className="px-6 pt-5 pb-2 flex items-center gap-2">
          <span className="text-stone-600 text-sm tabular-nums">Câu {currentQV.verse.id}</span>
          <div className="flex-1 h-px bg-stone-800" />
          {phase === "memorize" && (
            <span className="text-amber-400 font-mono font-bold text-lg w-8 text-right">{countdown}</span>
          )}
        </div>

        {/* Timer bar (memorize phase) */}
        {phase === "memorize" && (
          <div className="mx-6 h-1 bg-stone-800 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-amber-500 transition-all duration-1000"
              style={{ width: `${100 - pct}%` }}
            />
          </div>
        )}

        <div className="px-6 pb-6">
          {phase === "memorize" ? (
            /* Show full verse text */
            <div>
              <p className="text-stone-200 font-serif text-lg leading-loose tracking-wide">
                {currentQV.words.join(" ")}
              </p>
              <button
                onClick={() => { setCountdown(0); setPhase("recall"); }}
                className="mt-4 text-xs text-stone-500 hover:text-amber-400 transition-colors"
              >
                Bỏ qua → Ghi ngay
              </button>
            </div>
          ) : (
            /* Recall phase: fill all blanks */
            <div>
              <p className="text-xs text-stone-500 mb-3 italic">Hãy điền lại những từ đã xem…</p>
              <QuizLine
                key={`flash-${currentQV.verse.id}`}
                qv={currentQV}
                onCorrect={handleCorrect}
                onReveal={() => {}}
              />
              <button
                onClick={handleNext}
                className="mt-6 w-full py-2.5 rounded-xl bg-amber-700/30 hover:bg-amber-600/50
                           border border-amber-700/40 text-amber-300 font-medium transition-all duration-200"
              >
                {isLast ? "Xem kết quả →" : "Tiếp theo →"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dots navigation */}
      <div className="flex justify-center gap-1.5 mt-6 flex-wrap">
        {quizVerses.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              i === cardIdx ? "bg-amber-400 w-4" :
              i < cardIdx  ? "bg-stone-600" :
                              "bg-stone-800"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
