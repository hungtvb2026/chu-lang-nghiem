"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { QuizVerse } from "@/lib/quiz";
import { DeSection } from "@/lib/types";
import { DE_LABELS } from "@/lib/types";
import QuizLine from "@/components/QuizLine";

const ITEMS_PER_PAGE = 25;

type GroupedSection = {
  de: number;
  label: string;
  qvs: QuizVerse[];
};

type Props = {
  groupedByDe: GroupedSection[];
  correctSet: Set<string>;
  seed: number;
  page: number;
  totalPages: number;
  quizVerses: QuizVerse[];
  onCorrect: (verseId: number, wordIdx: number) => void;
  onWrong: (verseId: number) => void;
  onPageChange: (page: number) => void;
};

export default function QuizContent({
  groupedByDe,
  correctSet,
  seed,
  page,
  totalPages,
  quizVerses,
  onCorrect,
  onWrong,
  onPageChange,
}: Props) {
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-5 sm:space-y-6 animate-fade-in-up">
      {/* Page indicator */}
      {totalPages > 1 && (
        <div className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
          Trang {page + 1}/{totalPages}
          <span className="ml-1.5 text-slate-600">
            (câu {page * ITEMS_PER_PAGE + 1}–
            {Math.min((page + 1) * ITEMS_PER_PAGE, quizVerses.length)})
          </span>
        </div>
      )}

      {/* Verses grouped by Đệ */}
      {groupedByDe.map(({ de, label, qvs }) => (
        <section key={de}>
          <div className="lotus-divider mb-3 sm:mb-4">
            <h2
              className="font-serif font-semibold text-base sm:text-lg px-3"
              style={{ color: "var(--accent)" }}
            >
              {label}
            </h2>
          </div>
          <div className="glass-card rounded-xl sm:rounded-2xl px-3 sm:px-5 py-3 sm:py-4 space-y-0.5">
            {qvs.map((qv) =>
              qv.hiddenIndices.size === 0 ? (
                <div key={qv.verse.id} className="flex flex-wrap gap-1 py-1.5 px-1 sm:px-2">
                  <span
                    className="text-xs mr-0.5 select-none tabular-nums"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {qv.verse.id}.
                  </span>
                  {qv.words.map((w, i) => (
                    <span
                      key={i}
                      className="font-serif text-2xl sm:text-3xl"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {w}
                    </span>
                  ))}
                </div>
              ) : (
                <QuizLine
                  key={`${qv.verse.id}-${seed}`}
                  qv={qv}
                  onCorrect={(wordIdx) => onCorrect(qv.verse.id, wordIdx)}
                  onReveal={() => {}}
                  onWrong={() => onWrong(qv.verse.id)}
                />
              )
            )}
          </div>
        </section>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-2">
          <button
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0}
            className="h-10 px-4 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            style={{
              background: "var(--bg-elevated)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => {
            const showPage = i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1;
            const showEllipsis = i === page - 2 || i === page + 2;
            if (!showPage && !showEllipsis) return null;
            if (showEllipsis)
              return (
                <span key={i} className="text-xs px-1" style={{ color: "var(--text-muted)" }}>
                  …
                </span>
              );
            return (
              <button
                key={i}
                onClick={() => onPageChange(i)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 ${
                  page === i ? "text-white" : "hover:text-slate-200"
                }`}
                style={
                  page === i
                    ? {
                        background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
                        boxShadow: "0 2px 8px var(--accent-glow)",
                      }
                    : { color: "var(--text-muted)", background: "var(--bg-elevated)" }
                }
              >
                {i + 1}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            disabled={page === totalPages - 1}
            className="h-10 px-4 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            style={{
              background: "var(--bg-elevated)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
