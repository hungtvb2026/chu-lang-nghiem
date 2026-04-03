"use client";

import { useState, useMemo, useCallback, useRef, useEffect, type ReactNode } from "react";
import { Verse, DeSection, DE_LABELS } from "@/lib/types";
import {
  generateQuiz,
  QuizVerse,
  Difficulty,
  DIFFICULTY_CONFIG,
} from "@/lib/quiz";
import { useSettings } from "@/lib/useSettings";
import { useProgress, levelToDifficulty } from "@/lib/useProgress";
import { useGameStats } from "@/lib/useGameStats";
import { useSessionTimer } from "@/lib/useSessionTimer";
import { checkNewAchievements, type AchievementCheckData } from "@/lib/achievements";
import DeSelector from "@/components/DeSelector";
import DifficultySelector from "@/components/DifficultySelector";
import ModeSelector, { PracticeMode } from "@/components/ModeSelector";
import ProgressBar from "@/components/ProgressBar";
import QuizLine from "@/components/QuizLine";
import FlashMode from "@/components/FlashMode";
import ShuffleMode from "@/components/ShuffleMode";
import FullTextView from "@/components/FullTextView";
import StatsTab from "@/components/StatsTab";
import StreakBadge from "@/components/StreakBadge";
import LevelBadge from "@/components/LevelBadge";
import DailyGoalRing from "@/components/DailyGoalRing";
import XPPopup, { triggerXPPopup } from "@/components/XPPopup";
import AchievementToast, { showAchievementToast } from "@/components/AchievementToast";
import ConfettiCelebration from "@/components/ConfettiCelebration";
import SkeletonLoader from "@/components/SkeletonLoader";
import { PenLine, BookOpen, BarChart3, Settings, RotateCcw, Flower2, Star, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 25;
const XP_PER_CORRECT = 10;
const XP_BONUS_COMPLETE = 100;

type TabType = "quiz" | "text" | "stats";

type Props = {
  allVerses: Verse[];
  sections: DeSection[];
};

export default function QuizClient({ allVerses, sections }: Props) {
  const { settings, setSettings, hydrated } = useSettings();
  const progress = useProgress();
  const game = useGameStats();
  const session = useSessionTimer();

  const [seed, setSeed] = useState(0);
  const [correctSet, setCorrectSet] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<TabType>("quiz");
  const [mode, setMode] = useState<PracticeMode>("fill");
  const [completionMsg, setCompletionMsg] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevLevel, setPrevLevel] = useState(1);

  const progressiveDifficulty: Difficulty = levelToDifficulty(
    progress.getLevel(settings.de)
  );
  const activeDifficulty: Difficulty =
    mode === "progressive" ? progressiveDifficulty : settings.difficulty;
  const flashDifficulty: Difficulty = "expert";

  const verses = useMemo(() => {
    if (settings.de === 0) return allVerses;
    return allVerses.filter((v) => v.de === settings.de);
  }, [allVerses, settings.de]);

  const quizVerses: QuizVerse[] = useMemo(
    () =>
      generateQuiz(
        verses,
        mode === "flash" ? flashDifficulty : activeDifficulty,
        seed
      ),
    [verses, activeDifficulty, mode, seed]
  );

  const totalBlanks = useMemo(
    () => quizVerses.reduce((sum, qv) => sum + qv.hiddenIndices.size, 0),
    [quizVerses]
  );

  // Pagination
  const totalPages = Math.ceil(quizVerses.length / ITEMS_PER_PAGE);
  const paginatedVerses = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return quizVerses.slice(start, start + ITEMS_PER_PAGE);
  }, [quizVerses, page]);

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

  // Level up detection
  useEffect(() => {
    if (game.stats.level > prevLevel && prevLevel > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    setPrevLevel(game.stats.level);
  }, [game.stats.level, prevLevel]);

  // Achievement checking
  const checkAchievements = useCallback(() => {
    const data: AchievementCheckData = {
      totalXP: game.stats.totalXP,
      totalCorrect: game.stats.totalCorrect,
      totalWrong: game.stats.totalWrong,
      currentStreak: game.stats.currentStreak,
      bestStreak: game.stats.bestStreak,
      totalSessions: game.stats.totalSessions,
      totalTimeSeconds: game.stats.totalTimeSeconds,
      deCompleted: game.stats.deCompleted,
      flashPerfect: game.stats.flashPerfect,
      level: game.stats.level,
    };
    const newAchievements = checkNewAchievements(data, game.stats.achievements);
    for (const a of newAchievements) {
      game.unlockAchievement(a.id);
      showAchievementToast(a);
    }
  }, [game]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowLeft" && page > 0) setPage((p) => p - 1);
      else if (e.key === "ArrowRight" && page < totalPages - 1) setPage((p) => p + 1);
      else if (e.key === "Escape") setSettingsOpen(false);
      else if (e.ctrlKey && e.key === "Enter") { e.preventDefault(); handleRefresh(); }
      else if (e.key === "1") handleModeChange("fill");
      else if (e.key === "2") handleModeChange("progressive");
      else if (e.key === "3") handleModeChange("flash");
      else if (e.key === "4") handleModeChange("shuffle");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [page, totalPages]);

  const handleCorrect = useCallback(
    (verseId: number, wordIdx: number) => {
      setCorrectSet((prev) => new Set(prev).add(`${verseId}-${wordIdx}`));
      game.addXP(XP_PER_CORRECT);
      game.addCorrect();
      const el = document.getElementById(`blank-${verseId}-${wordIdx}`);
      if (el) triggerXPPopup(XP_PER_CORRECT, el);
      setTimeout(checkAchievements, 100);
      // Auto-focus next blank
      const ids = allBlankIdsRef.current;
      const pos = ids.indexOf(`blank-${verseId}-${wordIdx}`);
      const order = [...ids.slice(pos + 1), ...ids.slice(0, pos)];
      for (const id of order) {
        const nextEl = document.getElementById(id) as HTMLInputElement | null;
        if (nextEl) { nextEl.focus(); break; }
      }
    },
    [game, checkAchievements]
  );

  const handleWrong = useCallback(() => { game.addWrong(); }, [game]);

  const handleRefresh = () => {
    setSeed((s) => s + 1);
    setCorrectSet(new Set());
    setCompletionMsg(null);
    setPage(0);
  };

  const handleDeChange = (de: typeof settings.de) => {
    setSettings({ de });
    setCorrectSet(new Set());
    setCompletionMsg(null);
    setPage(0);
  };

  const handleDifficultyChange = (difficulty: Difficulty) => {
    setSettings({ difficulty });
    setCorrectSet(new Set());
    setPage(0);
  };

  const handleModeChange = (m: PracticeMode) => {
    setMode(m);
    setCorrectSet(new Set());
    setCompletionMsg(null);
    setSeed((s) => s + 1);
    setPage(0);
  };

  const handleProgressiveComplete = () => {
    progress.increment(settings.de);
    game.addXP(XP_BONUS_COMPLETE);
    game.completeSession(session.seconds);
    if (settings.de !== 0) game.completeDe(settings.de);
    const newLevel = progress.getLevel(settings.de) + 1;
    const newDiff = levelToDifficulty(newLevel);
    const label = DIFFICULTY_CONFIG[newDiff].label;
    setCompletionMsg(
      newLevel >= 4
        ? "Xuất sắc! Bạn đã đạt mức cao nhất!"
        : `Hoàn thành! Lần sau: ${label} ${DIFFICULTY_CONFIG[newDiff].emoji}`
    );
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    setTimeout(checkAchievements, 200);
  };

  const handleFlashComplete = (wrongIds: number[]) => {
    game.addXP(XP_BONUS_COMPLETE);
    game.completeSession(session.seconds);
    if (wrongIds.length === 0) game.setFlashPerfect();
    setCompletionMsg(
      wrongIds.length === 0
        ? "Tuyệt vời! Bạn nhớ đúng tất cả!"
        : `Hoàn thành! ${wrongIds.length} câu cần ôn thêm.`
    );
    setShowConfetti(wrongIds.length === 0);
    if (wrongIds.length === 0) setTimeout(() => setShowConfetti(false), 3000);
    setTimeout(checkAchievements, 200);
  };

  const handleShuffleComplete = (rounds: number, totalWrong: number) => {
    game.addXP(XP_BONUS_COMPLETE);
    game.completeSession(session.seconds);
    setCompletionMsg(`Hoàn thành sau ${rounds} vòng! Sai: ${totalWrong}.`);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    setTimeout(checkAchievements, 200);
  };

  const groupedByDe = useMemo(() => {
    if (settings.de !== 0)
      return [{ de: settings.de, label: DE_LABELS[settings.de], qvs: paginatedVerses }];
    return sections
      .map((sec) => ({
        de: sec.de,
        label: sec.label,
        qvs: paginatedVerses.filter((qv) => qv.verse.de === sec.de),
      }))
      .filter((g) => g.qvs.length > 0);
  }, [paginatedVerses, settings.de, sections]);

  if (!hydrated || !game.hydrated) return <SkeletonLoader />;

  const isComplete =
    mode !== "flash" && mode !== "shuffle" &&
    totalBlanks > 0 && correctSet.size >= totalBlanks;

  // Tab config for bottom nav
  const TABS: { id: TabType; label: string; icon: ReactNode }[] = [
    { id: "quiz", label: "Luyện tập", icon: <PenLine size={18} /> },
    { id: "text", label: "Toàn bộ", icon: <BookOpen size={18} /> },
    { id: "stats", label: "Thống kê", icon: <BarChart3 size={18} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col pb-16 sm:pb-0">
      {/* Global overlays */}
      <XPPopup />
      <AchievementToast />
      <ConfettiCelebration active={showConfetti} />

      {/* ─── Top Header (minimal, clean) ─── */}
      <header className="sticky top-0 z-40 glass-header gradient-border">
        <div className="max-w-5xl mx-auto px-4 py-2.5">
          {/* Row 1: Logo + Gamification + Actions */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: Title */}
            <h1 className="text-base sm:text-lg font-bold font-serif tracking-wide text-gradient shrink-0">
              Chú Lăng Nghiêm
            </h1>

            {/* Center: Gamification badges - compact */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <LevelBadge level={game.stats.level} totalXP={game.stats.totalXP} />
              <StreakBadge streak={game.stats.currentStreak} bestStreak={game.stats.bestStreak} />
              <DailyGoalRing current={game.stats.dailyXP} goal={game.stats.dailyGoal} />
              <span
                className="text-[11px] tabular-nums px-1.5 py-0.5 rounded-md font-semibold hidden sm:inline-flex sm:items-center sm:gap-1"
                style={{ background: 'var(--accent-ghost)', color: 'var(--accent)' }}
              >
                <Star size={10} fill="currentColor" />
                {game.stats.totalXP.toLocaleString()}
              </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
              <span
                className="text-[10px] tabular-nums px-1.5 py-0.5 rounded hidden sm:inline-block"
                style={{ color: 'var(--text-muted)' }}
              >
                {session.formatted}
              </span>
              {tab === "quiz" && (
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg
                             transition-all duration-200 active:scale-90"
                  style={{
                    background: settingsOpen ? 'var(--accent-ghost)' : 'transparent',
                    color: settingsOpen ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                  aria-label="Cài đặt"
                >
                  <Settings size={16} />
                </button>
              )}
              <button
                onClick={handleRefresh}
                className="w-8 h-8 flex items-center justify-center rounded-lg
                           transition-all duration-300 active:scale-90"
                style={{
                  background: 'var(--accent-ghost)',
                  border: '1px solid var(--border-active)',
                }}
                aria-label="Làm mới"
              >
                <RotateCcw size={14} style={{ color: 'var(--accent)' }} />
              </button>
            </div>
          </div>

          {/* Row 2: Desktop Tab Bar (hidden on mobile — uses bottom nav instead) */}
          <div className="hidden sm:flex items-center gap-1 mt-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium
                           transition-all duration-200 active:scale-95"
                style={{
                  color: tab === t.id ? 'var(--accent)' : 'var(--text-secondary)',
                  background: tab === t.id ? 'var(--accent-ghost)' : 'transparent',
                  border: tab === t.id ? '1px solid var(--border-active)' : '1px solid transparent',
                }}
              >
                <span className="flex items-center gap-1.5">{t.icon} {t.label}</span>
              </button>
            ))}
            {/* Spacer */}
            <div className="flex-1" />
            {/* Mode selector on same row for desktop when in quiz tab */}
            {tab === "quiz" && (
              <ModeSelector value={mode} onChange={handleModeChange} />
            )}
          </div>

          {/* Row 2 (mobile only): Mode selector when quiz tab */}
          {tab === "quiz" && (
            <div className="mt-2 -mx-4 px-4 overflow-x-auto scrollbar-none sm:hidden">
              <ModeSelector value={mode} onChange={handleModeChange} />
            </div>
          )}

          {/* Row 3: Progress bar (fill/progressive) */}
          {tab === "quiz" && (mode === "fill" || mode === "progressive") && (
            <div className="mt-2">
              <ProgressBar correct={correctSet.size} total={totalBlanks} />
            </div>
          )}
        </div>

        {/* Settings Panel */}
        {tab === "quiz" && settingsOpen && (
          <div
            className="animate-slide-down border-t"
            style={{
              borderColor: 'var(--border-subtle)',
              background: 'rgba(7, 7, 13, 0.85)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="max-w-5xl mx-auto px-4 py-3 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <span className="text-xs font-medium shrink-0" style={{ color: 'var(--text-muted)' }}>Phần</span>
                <DeSelector value={settings.de} onChange={handleDeChange} />
              </div>

              {mode === "progressive" ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className="text-xs font-medium shrink-0" style={{ color: 'var(--text-muted)' }}>Độ khó</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-3 py-1.5 rounded-lg"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-active)', color: 'var(--accent)' }}>
                      {DIFFICULTY_CONFIG[progressiveDifficulty].emoji}{" "}
                      {DIFFICULTY_CONFIG[progressiveDifficulty].label}
                      <span className="ml-1.5" style={{ color: 'var(--text-muted)' }}>
                        Lv.{progress.getLevel(settings.de)}
                      </span>
                    </span>
                    <button onClick={() => { progress.reset(settings.de); handleRefresh(); }}
                      className="text-xs px-2 py-1 rounded-md transition-colors duration-200 hover:text-red-400 active:scale-95"
                      style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}>
                      Reset
                    </button>
                  </div>
                </div>
              ) : mode === "fill" || mode === "shuffle" ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className="text-xs font-medium shrink-0" style={{ color: 'var(--text-muted)' }}>Độ khó</span>
                  <DifficultySelector value={settings.difficulty} onChange={handleDifficultyChange} />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Độ khó</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Tất cả từ bị ẩn</span>
                </div>
              )}

              {/* Keyboard hints - desktop only */}
              <div className="hidden sm:flex flex-wrap gap-2 pt-1">
                {[
                  { key: "←→", desc: "Chuyển trang" },
                  { key: "1-4", desc: "Chuyển mode" },
                  { key: "Ctrl+↵", desc: "Làm mới" },
                  { key: "Esc", desc: "Đóng" },
                ].map((s) => (
                  <span key={s.key} className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                    <kbd className="font-mono mr-1" style={{ color: 'var(--text-secondary)' }}>{s.key}</kbd>{s.desc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ─── Content ─── */}
      <main className="flex-1">
        {tab === "stats" ? (
          <StatsTab stats={game.stats} />
        ) : tab === "text" ? (
          <FullTextView verses={verses} sections={sections} selectedDe={settings.de} />
        ) : (
          <>
            {completionMsg && (
              <div className="max-w-4xl mx-auto px-4 pt-4 sm:pt-6 animate-fade-in-up">
                <div className="glass-card rounded-xl px-4 py-3 sm:px-5 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  style={{ boxShadow: '0 0 20px var(--accent-glow)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>{completionMsg}</p>
                  <button onClick={handleRefresh}
                    className="shrink-0 w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-medium
                               transition-all duration-300 active:scale-95 text-center"
                    style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', color: 'white' }}>
                    Làm mới
                  </button>
                </div>
              </div>
            )}

            {mode === "flash" && !completionMsg && (
              <FlashMode quizVerses={quizVerses} flashDuration={3} onComplete={handleFlashComplete} />
            )}

            {mode === "shuffle" && !completionMsg && (
              <ShuffleMode quizVerses={quizVerses} seed={seed} onComplete={handleShuffleComplete} />
            )}

            {(mode === "fill" || mode === "progressive") && (
              <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-5 sm:space-y-6 animate-fade-in-up">
                {totalPages > 1 && (
                  <div className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                    Trang {page + 1}/{totalPages}
                    <span className="ml-1.5 text-slate-600">
                      (câu {page * ITEMS_PER_PAGE + 1}–{Math.min((page + 1) * ITEMS_PER_PAGE, quizVerses.length)})
                    </span>
                  </div>
                )}

                {groupedByDe.map(({ de, label, qvs }) => (
                  <section key={de}>
                    <div className="lotus-divider mb-3 sm:mb-4">
                      <h2 className="font-serif font-semibold text-base sm:text-lg px-3" style={{ color: 'var(--accent)' }}>
                        {label}
                      </h2>
                    </div>
                    <div className="glass-card rounded-xl sm:rounded-2xl px-3 sm:px-5 py-3 sm:py-4 space-y-0.5">
                      {qvs.map((qv) =>
                        qv.hiddenIndices.size === 0 ? (
                          <div key={qv.verse.id} className="flex flex-wrap gap-1 py-1.5 px-1 sm:px-2">
                            <span className="text-xs mr-0.5 select-none tabular-nums" style={{ color: 'var(--text-muted)' }}>
                              {qv.verse.id}.
                            </span>
                            {qv.words.map((w, i) => (
                              <span key={i} className="font-serif text-[15px] sm:text-base" style={{ color: 'var(--text-primary)' }}>
                                {w}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <QuizLine key={`${qv.verse.id}-${seed}`} qv={qv}
                            onCorrect={(wordIdx) => handleCorrect(qv.verse.id, wordIdx)}
                            onReveal={() => {}} onWrong={handleWrong} />
                        )
                      )}
                    </div>
                  </section>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 pt-2">
                    <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                      className="h-10 px-4 rounded-lg text-sm font-medium transition-all duration-200
                                 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => {
                      const showPage = i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1;
                      const showEllipsis = i === page - 2 || i === page + 2;
                      if (!showPage && !showEllipsis) return null;
                      if (showEllipsis) return <span key={i} className="text-xs px-1" style={{ color: 'var(--text-muted)' }}>…</span>;
                      return (
                        <button key={i} onClick={() => setPage(i)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95
                            ${page === i ? "text-white" : "hover:text-slate-200"}`}
                          style={page === i ? {
                            background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                            boxShadow: '0 2px 8px var(--accent-glow)',
                          } : { color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}>
                          {i + 1}
                        </button>
                      );
                    })}

                    <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page === totalPages - 1}
                      className="h-10 px-4 rounded-lg text-sm font-medium transition-all duration-200
                                 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}

                {/* Completion */}
                {isComplete && !completionMsg && (
                  <div className="text-center py-12 sm:py-16 animate-fade-in-up">
                    <Flower2 size={56} className="mx-auto mb-4 animate-float" style={{ color: 'var(--accent)' }} />
                    <p className="text-xl sm:text-2xl font-serif font-semibold text-gradient">
                      Hoàn thành xuất sắc!
                    </p>
                    <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Điền đúng tất cả {totalBlanks} ô
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 px-4">
                      {mode === "progressive" && (
                        <button onClick={handleProgressiveComplete}
                          className="w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 active:scale-95"
                          style={{
                            background: 'linear-gradient(135deg, var(--accent-ghost), var(--indigo-glow))',
                            border: '1px solid var(--border-active)', color: 'var(--accent)',
                          }}>
                          Ghi nhận & tăng độ khó
                        </button>
                      )}
                      <button onClick={() => {
                          game.addXP(XP_BONUS_COMPLETE);
                          game.completeSession(session.seconds);
                          setShowConfetti(true);
                          setTimeout(() => setShowConfetti(false), 3000);
                          handleRefresh();
                          setTimeout(checkAchievements, 200);
                        }}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold text-white
                                   transition-all duration-300 active:scale-95"
                        style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', boxShadow: '0 4px 16px var(--accent-glow)' }}>
                        Làm mới
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* ─── Bottom Tab Bar (mobile-first) ─── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 sm:hidden glass-header"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-stretch">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5
                          transition-colors duration-200 active:scale-95"
              style={{
                color: tab === t.id ? 'var(--accent)' : 'var(--text-muted)',
                background: tab === t.id ? 'var(--accent-ghost)' : 'transparent',
              }}
            >
              {t.icon}
              <span className="text-[10px] font-semibold">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ─── Footer (desktop only) ─── */}
      <footer className="hidden sm:block text-center py-5 text-xs"
        style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-center gap-3">
          <span>Chú Lăng Nghiêm · {new Date().getFullYear()}</span>
          <span>·</span>
          <span>Level {game.stats.level} · {game.stats.totalXP.toLocaleString()} XP</span>
        </div>
      </footer>
    </div>
  );
}
