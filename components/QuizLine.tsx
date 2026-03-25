"use client";

import { useState, useCallback, useEffect } from "react";
import { QuizVerse } from "@/lib/quiz";

type Props = {
  qv: QuizVerse;
  onCorrect: (blank: number) => void;
  onReveal: () => void;
};

type BlankState = "idle" | "correct" | "wrong";

export default function QuizLine({ qv, onCorrect, onReveal }: Props) {
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
        onCorrect(idx); // QuizClient handles global focus
      } else {
        setStates((prev) => ({ ...prev, [idx]: "wrong" }));
      }
    },
    [inputs, words, onCorrect]
  );

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCheck(idx);
    }
  };

  const handleHint = (idx: number) => {
    setHints((prev) => ({ ...prev, [idx]: true }));
    onReveal();
  };

  return (
    <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0.5 py-1">
      <span className="text-stone-600 text-xs mr-1 select-none tabular-nums">
        {verse.id}.
      </span>
      {words.map((word, idx) => {
        if (!hiddenIndices.has(idx)) {
          return (
            <span key={idx} className="text-stone-300 font-serif text-base leading-relaxed">
              {word}
            </span>
          );
        }

        const state = states[idx] ?? "idle";
        const hint = hints[idx];
        const bareWord = word.replace(/[;,.]$/g, "");

        if (state === "correct") {
          return (
            <span
              key={idx}
              className="inline-block px-1.5 py-0.5 rounded text-green-300 font-serif font-semibold
                         bg-green-900/30 border border-green-700/40 text-base leading-relaxed"
            >
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
              placeholder={hint ? bareWord[0] + "…" : "___"}
              style={{ width: `${Math.max(bareWord.length * 0.62 + 1.2, 3)}rem` }}
              className={`
                px-1.5 py-0.5 text-base font-serif rounded border outline-none
                bg-stone-900/80 text-amber-200 placeholder-stone-600
                transition-all duration-150
                ${state === "wrong"
                  ? "border-red-500/70 animate-shake bg-red-900/20"
                  : "border-amber-700/40 focus:border-amber-500 focus:bg-stone-800"
                }
              `}
            />
            <button
              onClick={() => handleHint(idx)}
              title="Gợi ý"
              className="text-stone-600 hover:text-amber-500 text-xs transition-colors px-0.5 leading-none"
            >
              ?
            </button>
          </span>
        );
      })}
    </div>
  );
}
