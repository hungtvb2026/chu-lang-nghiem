"use client";

import { useState, useCallback, useEffect, memo } from "react";
import { QuizVerse } from "@/lib/quiz";
import { Lightbulb, HelpCircle } from "lucide-react";

type Props = {
  qv: QuizVerse;
  onCorrect: (blank: number) => void;
  onReveal: () => void;
  onWrong?: () => void;
};

type BlankState = "idle" | "correct" | "wrong";

const QuizLine = memo(function QuizLine({ qv, onCorrect, onReveal, onWrong }: Props) {
  const { verse, words, hiddenIndices } = qv;

  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [states, setStates] = useState<Record<number, BlankState>>({});
  const [hints, setHints] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setInputs({});
    setStates({});
    setHints({});
  }, [verse.id, hiddenIndices]);

  const handleChange = useCallback((idx: number, val: string) => {
    setInputs((prev) => ({ ...prev, [idx]: val }));
    setStates((prev) =>
      prev[idx] === "wrong" ? { ...prev, [idx]: "idle" } : prev
    );
  }, []);

  const handleCheck = useCallback(
    (idx: number) => {
      const val = (inputs[idx] || "").trim().toLowerCase();
      const expected = words[idx].replace(/[;,.]$/g, "").trim().toLowerCase();
      if (!val) return;
      if (val === expected) {
        setStates((prev) => ({ ...prev, [idx]: "correct" }));
        onCorrect(idx);
      } else {
        setStates((prev) => ({ ...prev, [idx]: "wrong" }));
        onWrong?.();
      }
    },
    [inputs, words, onCorrect, onWrong]
  );

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Enter") { e.preventDefault(); handleCheck(idx); }
  };

  const handleHint = (idx: number) => {
    setHints((prev) => ({ ...prev, [idx]: true }));
    onReveal();
  };

  const blanksTotal = hiddenIndices.size;
  const blanksDone = Array.from(hiddenIndices).filter(i => states[i] === "correct").length;
  const lineComplete = blanksTotal > 0 && blanksDone === blanksTotal;

  return (
    <div
      className={`group flex flex-wrap items-baseline gap-x-1.5 gap-y-2
                  py-2.5 sm:py-2 px-2 sm:px-3 -mx-2 sm:-mx-3
                  rounded-lg transition-all duration-200
                  ${lineComplete ? '' : 'hover:bg-white/[0.01]'}`}
      style={lineComplete ? {
        background: 'rgba(74, 222, 128, 0.025)',
        borderLeft: '2px solid rgba(74, 222, 128, 0.18)',
      } : {
        borderLeft: '2px solid transparent',
      }}
    >
      <span
        className="text-xs mr-0.5 select-none tabular-nums shrink-0 transition-colors duration-200"
        style={{ color: lineComplete ? 'rgba(74, 222, 128, 0.3)' : 'var(--text-muted)' }}
      >
        {verse.id}
      </span>

      {words.map((word, idx) => {
        if (!hiddenIndices.has(idx)) {
          return (
            <span key={idx} className="font-serif text-2xl sm:text-3xl leading-relaxed"
              style={{ color: 'var(--text-primary)' }}>
              {word}
            </span>
          );
        }

        const state = states[idx] ?? "idle";
        const hint = hints[idx];
        const bareWord = word.replace(/[;,.]$/g, "");
        const inputWidth = `${Math.max(bareWord.length * 0.9 + 2, 4.5)}rem`;

        if (state === "correct") {
          return (
            <span key={idx}
              className="inline-block font-serif font-semibold leading-relaxed animate-correct-pop text-2xl sm:text-3xl"
              style={{
                color: 'var(--success)',
                padding: '2px 10px',
                borderRadius: '6px',
                background: 'rgba(74, 222, 128, 0.06)',
                border: '1px solid rgba(74, 222, 128, 0.18)',
              }}>
              {word}
            </span>
          );
        }

        return (
          <span key={idx} className="inline-flex items-center gap-0.5">
            <input
              type="text"
              id={`blank-${verse.id}-${idx}`}
              value={inputs[idx] ?? ""}
              onChange={(e) => handleChange(idx, e.target.value)}
              onBlur={() => handleCheck(idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              placeholder={hint ? bareWord[0] + "…" : "···"}
              style={{ width: inputWidth }}
              className={`quiz-input px-2.5 py-1.5 leading-normal
                ${state === "wrong" ? "is-wrong animate-shake" : ""}`}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              enterKeyHint="done"
              aria-label={`Từ còn thiếu vị trí ${idx + 1}`}
            />
            <button
              onClick={() => handleHint(idx)}
              title="Gợi ý chữ cái đầu"
              className="flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-[8px]
                         transition-all duration-200 active:scale-90"
              style={{
                color: hint ? 'var(--accent)' : 'var(--text-hint)',
                background: hint ? 'var(--accent-ghost)' : 'transparent',
              }}
              aria-label="Gợi ý"
            >
              {hint ? <Lightbulb size={18} /> : <HelpCircle size={18} />}
            </button>
          </span>
        );
      })}
    </div>
  );
});

export default QuizLine;
