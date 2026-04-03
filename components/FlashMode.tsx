"use client";

import { useState, useEffect, useCallback } from "react";
import { QuizVerse } from "@/lib/quiz";
import QuizLine from "./QuizLine";

type Props = {
  quizVerses: QuizVerse[];
  flashDuration?: number;
  onComplete: (wrongIds: number[]) => void;
};

type Phase = "memorize" | "recall";

export default function FlashMode({ quizVerses, flashDuration = 3, onComplete }: Props) {
  const [cardIdx, setCardIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("memorize");
  const [countdown, setCountdown] = useState(flashDuration);
  const [correctCount, setCorrectCount] = useState(0);
  const [cardCorrects, setCardCorrects] = useState<Set<string>>(new Set());
  const [wrongCards, setWrongCards] = useState<number[]>([]);

  const currentQV = quizVerses[cardIdx];
  const isLast = cardIdx === quizVerses.length - 1;
  const total = quizVerses.length;
  const progressPct = Math.round(((cardIdx + 1) / total) * 100);

  useEffect(() => {
    setPhase("memorize");
    setCountdown(flashDuration);
    setCardCorrects(new Set());
    setCorrectCount(0);
  }, [cardIdx, flashDuration]);

  useEffect(() => {
    if (phase !== "memorize") return;
    if (countdown <= 0) { setPhase("recall"); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const handleCorrect = useCallback(
    (wordIdx: number) => {
      const key = `${currentQV.verse.id}-${wordIdx}`;
      setCardCorrects((prev) => new Set(prev).add(key));
      setCorrectCount((c) => c + 1);
    },
    [currentQV]
  );

  const handleNext = () => {
    const allCorrect = correctCount >= currentQV.hiddenIndices.size;
    if (!allCorrect) setWrongCards((prev) => [...prev, currentQV.verse.id]);
    if (isLast) {
      onComplete(wrongCards.concat(allCorrect ? [] : [currentQV.verse.id]));
    } else {
      setCardIdx((i) => i + 1);
    }
  };

  if (!currentQV) return null;

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const timerPct = countdown / flashDuration;
  const strokeOffset = circumference * (1 - timerPct);

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8 animate-fade-in-up">
      {/* Progress header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Câu <span className="text-amber-400 font-bold">{cardIdx + 1}</span>
          <span className="text-slate-600"> / {total}</span>
        </span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{
            color: wrongCards.length > 0 ? 'var(--red-error)' : 'var(--green-success)',
            background: wrongCards.length > 0 ? 'var(--red-glow)' : 'rgba(52, 211, 153, 0.1)',
          }}>
          {wrongCards.length > 0 ? `${wrongCards.length} sai` : "Chưa sai"}
        </span>
      </div>

      {/* Mini progress bar */}
      <div className="h-1 rounded-full mb-5 sm:mb-6 overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
      </div>

      {/* Card */}
      <div className="glass-card rounded-xl sm:rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)' }}>
        {/* Card header */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 flex items-center gap-3"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <span className="text-sm tabular-nums" style={{ color: 'var(--text-muted)' }}>
            Câu {currentQV.verse.id}
          </span>
          <div className="flex-1" />

          {phase === "memorize" && (
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="3" />
                <circle cx="32" cy="32" r={radius} fill="none" stroke="var(--amber-primary)" strokeWidth="3"
                  strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeOffset}
                  style={{ transition: 'stroke-dashoffset 1s linear' }} />
              </svg>
              <span className="text-amber-400 font-bold text-lg font-mono">{countdown}</span>
            </div>
          )}
        </div>

        <div className="px-4 sm:px-6 pb-5 sm:pb-6 pt-4">
          {phase === "memorize" ? (
            <div className="animate-fade-in">
              <p className="font-serif text-lg sm:text-xl leading-loose tracking-wide"
                style={{ color: 'var(--text-primary)' }}>
                {currentQV.words.join(" ")}
              </p>
              <button onClick={() => { setCountdown(0); setPhase("recall"); }}
                className="mt-4 sm:mt-5 text-xs transition-colors duration-200 hover:text-amber-400 active:scale-95"
                style={{ color: 'var(--text-muted)' }}>
                Bỏ qua → Ghi ngay
              </button>
            </div>
          ) : (
            <div className="animate-fade-in-up">
              <p className="text-xs mb-3 sm:mb-4" style={{ color: 'var(--text-muted)' }}>
                Hãy điền lại những từ đã xem…
              </p>
              <QuizLine key={`flash-${currentQV.verse.id}`} qv={currentQV}
                onCorrect={handleCorrect} onReveal={() => {}} />
              <button onClick={handleNext}
                className="mt-5 sm:mt-6 w-full py-3.5 sm:py-3 rounded-xl font-medium transition-all duration-300
                           active:scale-[0.98] text-base sm:text-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.1))',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: 'var(--accent)',
                }}>
                {isLast ? "Xem kết quả" : "Tiếp theo →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
