"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { Verse, DeSection, DE_LABELS } from "@/lib/types";
import { generateQuiz, QuizVerse, Difficulty, DIFFICULTY_CONFIG } from "@/lib/quiz";
import { useSettings } from "@/lib/useSettings";
import { useProgress, levelToDifficulty } from "@/lib/useProgress";
import DeSelector from "@/components/DeSelector";
import DifficultySelector from "@/components/DifficultySelector";
import ModeSelector, { PracticeMode } from "@/components/ModeSelector";
import ProgressBar from "@/components/ProgressBar";
import QuizLine from "@/components/QuizLine";
import FlashMode from "@/components/FlashMode";
import ShuffleMode from "@/components/ShuffleMode";
import FullTextView from "@/components/FullTextView";

type Props = {
  allVerses: Verse[];
  sections: DeSection[];
};

export default function QuizClient({ allVerses, sections }: Props) {
  const { settings, setSettings, hydrated } = useSettings();
  const progress = useProgress();
  const [seed, setSeed] = useState(0);
  const [correctSet, setCorrectSet] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"quiz" | "text">("quiz");
  const [mode, setMode] = useState<PracticeMode>("fill");
  const [completionMsg, setCompletionMsg] = useState<string | null>(null);

  // Progressive mode: difficulty derived from completion history
  const progressiveDifficulty: Difficulty = levelToDifficulty(progress.getLevel(settings.de));

  const activeDifficulty: Difficulty =
    mode === "progressive" ? progressiveDifficulty : settings.difficulty;

  // Flash mode uses "expert" ratio (all blanks) regardless of difficulty setting
  const flashDifficulty: Difficulty = "expert";

  const verses = useMemo(() => {
    if (settings.de === 0) return allVerses;
    return allVerses.filter((v) => v.de === settings.de);
  }, [allVerses, settings.de]);

  const quizVerses: QuizVerse[] = useMemo(
    () => generateQuiz(verses, mode === "flash" ? flashDifficulty : activeDifficulty, seed),
    [verses, activeDifficulty, mode, seed]
  );

  const totalBlanks = useMemo(
    () => quizVerses.reduce((sum, qv) => sum + qv.hiddenIndices.size, 0),
    [quizVerses]
  );

  // Flat ordered blank IDs for global cross-line auto-focus
  const allBlankIds = useMemo(() => {
    const ids: string[] = [];
    for (const qv of quizVerses) {
      const sorted = Array.from(qv.hiddenIndices).sort((a, b) => a - b);
      for (const idx of sorted) ids.push(`blank-${qv.verse.id}-${idx}`);
    }
    return ids;
  }, [quizVerses]);

  const allBlankIdsRef = useRef(allBlankIds);
  allBlankIdsRef.current = allBlankIds;

  const handleCorrect = useCallback((verseId: number, wordIdx: number) => {
    setCorrectSet((prev) => new Set(prev).add(`${verseId}-${wordIdx}`));
    const ids = allBlankIdsRef.current;
    const pos = ids.indexOf(`blank-${verseId}-${wordIdx}`);
    const order = [...ids.slice(pos + 1), ...ids.slice(0, pos)];
    for (const id of order) {
      const el = document.getElementById(id) as HTMLInputElement | null;
      if (el) { el.focus(); break; }
    }
  }, []);

  const handleRefresh = () => {
    setSeed((s) => s + 1);
    setCorrectSet(new Set());
    setCompletionMsg(null);
  };

  const handleDeChange = (de: typeof settings.de) => {
    setSettings({ de });
    setCorrectSet(new Set());
    setCompletionMsg(null);
  };

  const handleDifficultyChange = (difficulty: Difficulty) => {
    setSettings({ difficulty });
    setCorrectSet(new Set());
  };

  const handleModeChange = (m: PracticeMode) => {
    setMode(m);
    setCorrectSet(new Set());
    setCompletionMsg(null);
    setSeed((s) => s + 1);
  };

  // Progressive: called when all blanks are filled
  const handleProgressiveComplete = () => {
    progress.increment(settings.de);
    const newLevel = progress.getLevel(settings.de) + 1;
    const newDiff = levelToDifficulty(newLevel);
    const label = DIFFICULTY_CONFIG[newDiff].label;
    setCompletionMsg(
      newLevel >= 4
        ? "🏆 Xuất sắc! Bạn đã đạt mức cao nhất!"
        : `🎉 Hoàn thành! Lần sau độ khó sẽ là: ${label} ${DIFFICULTY_CONFIG[newDiff].emoji}`
    );
  };

  // Flash complete callback
  const handleFlashComplete = (wrongIds: number[]) => {
    setCompletionMsg(
      wrongIds.length === 0
        ? "🎉 Tuyệt vời! Bạn nhớ đúng tất cả!"
        : `✅ Xong! ${wrongIds.length} câu cần ôn thêm.`
    );
  };

  // Shuffle complete callback
  const handleShuffleComplete = (rounds: number, totalWrong: number) => {
    setCompletionMsg(
      `🏆 Hoàn thành sau ${rounds} vòng! Tổng số câu sai: ${totalWrong}.`
    );
  };

  const groupedByDe = useMemo(() => {
    if (settings.de !== 0)
      return [{ de: settings.de, label: DE_LABELS[settings.de], qvs: quizVerses }];
    return sections.map((sec) => ({
      de: sec.de,
      label: sec.label,
      qvs: quizVerses.filter((qv) => qv.verse.de === sec.de),
    }));
  }, [quizVerses, settings.de, sections]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-amber-400 text-xl animate-pulse font-serif">
          Đang tải kinh văn…
        </div>
      </div>
    );
  }

  const isComplete = mode !== "flash" && mode !== "shuffle" && totalBlanks > 0 && correctSet.size >= totalBlanks;

  return (
    <div className="min-h-screen bg-stone-950">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur border-b border-stone-800 shadow-xl shadow-stone-950/80">
        <div className="max-w-4xl mx-auto px-4 py-4 space-y-3">

          {/* Title + Refresh */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-amber-400 font-serif tracking-wide">
                🪷 Chú Lăng Nghiêm
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                {verses.length} câu · {totalBlanks} ô cần điền
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-700/20 hover:bg-amber-700/40
                         border border-amber-700/40 text-amber-300 text-sm font-medium transition-all duration-200
                         hover:shadow-lg hover:shadow-amber-900/30"
            >
              <span>🔀</span><span>Làm mới</span>
            </button>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 bg-stone-900 rounded-lg p-1 w-fit">
            {(["quiz", "text"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                  ${tab === t ? "bg-amber-600 text-white shadow" : "text-stone-400 hover:text-stone-200"}`}
              >
                {t === "quiz" ? "✏️ Luyện tập" : "📖 Xem toàn bộ"}
              </button>
            ))}
          </div>

          {tab === "quiz" && (
            <>
              {/* Mode selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 shrink-0">Mode:</span>
                <ModeSelector value={mode} onChange={handleModeChange} />
              </div>

              {/* Progress only for fill/progressive */}
              {(mode === "fill" || mode === "progressive") && (
                <ProgressBar correct={correctSet.size} total={totalBlanks} />
              )}

              {/* Filters */}
              <div className="flex flex-wrap gap-y-2 gap-x-4 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 shrink-0">Đệ:</span>
                  <DeSelector value={settings.de} onChange={handleDeChange} />
                </div>

                {/* Progressive: show auto-difficulty badge */}
                {mode === "progressive" ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500">Độ khó:</span>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full bg-stone-800 border border-amber-700/40 ${DIFFICULTY_CONFIG[progressiveDifficulty].color}`}>
                      {DIFFICULTY_CONFIG[progressiveDifficulty].emoji} {DIFFICULTY_CONFIG[progressiveDifficulty].label}
                      <span className="text-stone-500 ml-1">(Lv.{progress.getLevel(settings.de)})</span>
                    </span>
                    <button
                      onClick={() => { progress.reset(settings.de); handleRefresh(); }}
                      className="text-xs text-stone-600 hover:text-red-400 transition-colors"
                      title="Reset tiến độ"
                    >↺ Reset</button>
                  </div>
                ) : mode === "fill" ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500 shrink-0">Độ khó:</span>
                    <DifficultySelector value={settings.difficulty} onChange={handleDifficultyChange} />
                  </div>
                ) : mode === "flash" ? (
                  <span className="text-xs text-stone-500 italic">⚡ Xem rồi nhớ lại — tất cả từ bị ẩn</span>
                ) : mode === "shuffle" ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500 shrink-0">Độ khó:</span>
                    <DifficultySelector value={settings.difficulty} onChange={handleDifficultyChange} />
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </header>

      {/* ─── Content ─── */}
      {tab === "text" ? (
        <FullTextView verses={verses} sections={sections} selectedDe={settings.de} />
      ) : (
        <>
          {/* Completion message */}
          {completionMsg && (
            <div className="max-w-4xl mx-auto px-4 pt-6">
              <div className="rounded-xl bg-amber-900/20 border border-amber-700/40 px-5 py-4 flex items-center justify-between gap-4">
                <p className="text-amber-200 font-medium text-sm">{completionMsg}</p>
                <button
                  onClick={handleRefresh}
                  className="shrink-0 px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-all"
                >
                  🔀 Làm mới
                </button>
              </div>
            </div>
          )}

          {/* ── Flash mode ── */}
          {mode === "flash" && !completionMsg && (
            <FlashMode
              quizVerses={quizVerses}
              flashDuration={3}
              onComplete={handleFlashComplete}
            />
          )}

          {/* ── Shuffle mode ── */}
          {mode === "shuffle" && !completionMsg && (
            <ShuffleMode
              quizVerses={quizVerses}
              seed={seed}
              onComplete={handleShuffleComplete}
            />
          )}

          {/* ── Fill / Progressive mode ── */}
          {(mode === "fill" || mode === "progressive") && (
            <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
              {groupedByDe.map(({ de, label, qvs }) => (
                <section key={de}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-amber-800/60 to-transparent" />
                    <h2 className="text-amber-500 font-serif font-semibold text-lg px-2">{label}</h2>
                    <div className="h-px flex-1 bg-gradient-to-l from-amber-800/60 to-transparent" />
                  </div>
                  <div className="bg-stone-900/50 rounded-2xl border border-stone-800 px-5 py-4 space-y-0.5">
                    {qvs.map((qv) =>
                      qv.hiddenIndices.size === 0 ? (
                        <div key={qv.verse.id} className="flex flex-wrap gap-1 py-1">
                          <span className="text-stone-600 text-xs mr-1 select-none tabular-nums">{qv.verse.id}.</span>
                          {qv.words.map((w, i) => (
                            <span key={i} className="text-stone-300 font-serif text-base">{w}</span>
                          ))}
                        </div>
                      ) : (
                        <QuizLine
                          key={`${qv.verse.id}-${seed}`}
                          qv={qv}
                          onCorrect={(wordIdx) => handleCorrect(qv.verse.id, wordIdx)}
                          onReveal={() => {}}
                        />
                      )
                    )}
                  </div>
                </section>
              ))}

              {/* Fill completion banner */}
              {isComplete && !completionMsg && (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🎉🪷🎉</div>
                  <p className="text-2xl font-serif text-amber-300 font-semibold">Nam Mô! Bạn đã hoàn thành!</p>
                  <p className="text-stone-400 mt-2 text-sm">
                    Điền đúng tất cả {totalBlanks} ô
                  </p>
                  {mode === "progressive" && (
                    <button
                      onClick={handleProgressiveComplete}
                      className="mt-4 px-5 py-2 rounded-xl bg-amber-700/40 border border-amber-600/40 text-amber-300 text-sm font-medium"
                    >
                      📈 Ghi nhận & tăng độ khó
                    </button>
                  )}
                  <button
                    onClick={handleRefresh}
                    className="mt-3 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold
                               transition-all duration-200 shadow-lg shadow-amber-900/40 ml-3"
                  >
                    🔀 Làm mới
                  </button>
                </div>
              )}
            </main>
          )}
        </>
      )}

      <footer className="text-center py-8 text-stone-700 text-xs border-t border-stone-900">
        Chú Lăng Nghiêm · {new Date().getFullYear()} · Học thuộc bằng cách điền từ
      </footer>
    </div>
  );
}
