"use client";

import { Flower2 } from "lucide-react";
import { DIFFICULTY_CONFIG, type Difficulty } from "@/lib/quiz";
import { levelToDifficulty } from "@/lib/useProgress";
import { DE_LABELS } from "@/lib/types";

type Props = {
  totalBlanks: number;
  mode: "fill" | "progressive" | "smart";
  progressiveDifficulty: Difficulty;
  progressiveLevel: number;
  onRefresh: () => void;
  onProgressiveComplete: () => void;
  sessionSeconds: number;
};

export default function CompletionScreen({
  totalBlanks,
  mode,
  progressiveDifficulty,
  progressiveLevel,
  onRefresh,
  onProgressiveComplete,
}: Props) {
  return (
    <div className="text-center py-12 sm:py-16 animate-fade-in-up">
      <Flower2
        size={56}
        className="mx-auto mb-4 animate-float"
        style={{ color: "var(--accent)" }}
      />
      <p className="text-xl sm:text-2xl font-serif font-semibold text-gradient">
        Hoàn thành xuất sắc!
      </p>
      <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
        Điền đúng tất cả {totalBlanks} ô
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 px-4">
        {mode === "progressive" && (
          <button
            onClick={onProgressiveComplete}
            className="w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 active:scale-95"
            style={{
              background: "linear-gradient(135deg, var(--accent-ghost), var(--indigo-glow))",
              border: "1px solid var(--border-active)",
              color: "var(--accent)",
            }}
          >
            Ghi nhận &amp; tăng độ khó
          </button>
        )}
        <button
          onClick={onRefresh}
          className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 active:scale-95"
          style={{
            background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
            boxShadow: "0 4px 16px var(--accent-glow)",
          }}
        >
          Làm mới
        </button>
      </div>
    </div>
  );
}
