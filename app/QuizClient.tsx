"use client";

import { useState, useMemo, useCallback, useEffect, type ReactNode } from "react";
import { Verse, DeSection, DE_LABELS } from "@/lib/types";
import { DIFFICULTY_CONFIG } from "@/lib/quiz";
import { useSettings } from "@/lib/useSettings";
import { useProgress, levelToDifficulty } from "@/lib/useProgress";
import { useGameStats } from "@/lib/useGameStats";
import { useSessionTimer } from "@/lib/useSessionTimer";
import { checkNewAchievements, type AchievementCheckData } from "@/lib/achievements";
import { useQuizEngine } from "@/lib/useQuizEngine";
import { useNotifications } from "@/lib/useNotifications";
import DeSelector from "@/components/DeSelector";
import DifficultySelector from "@/components/DifficultySelector";
import ModeSelector, { PracticeMode } from "@/components/ModeSelector";
import ProgressBar from "@/components/ProgressBar";
import FlashMode from "@/components/FlashMode";
import ShuffleMode from "@/components/ShuffleMode";
import FullTextView from "@/components/FullTextView";
import StatsTab from "@/components/StatsTab";
import StreakBadge from "@/components/StreakBadge";
import LevelBadge from "@/components/LevelBadge";
import DailyGoalRing from "@/components/DailyGoalRing";
import ConfettiCelebration from "@/components/ConfettiCelebration";
import SkeletonLoader from "@/components/SkeletonLoader";
import QuizContent from "@/components/QuizContent";
import CompletionScreen from "@/components/CompletionScreen";
import ThemeToggle from "@/components/ThemeToggle";
import {
  PenLine,
  BookOpen,
  BarChart3,
  Settings,
  RotateCcw,
  Star,
} from "lucide-react";
import { useUrlState } from "@/lib/useUrlState";

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
  const { showAchievement } = useNotifications();
  const { tab, mode, de, setTab, setMode, setDe } = useUrlState();
  const [completionMsg, setCompletionMsg] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevLevel, setPrevLevel] = useState(1);

  // Use URL `de` param as the active section, falling back to settings
  const activeDe = de !== 0 ? de : settings.de;

  const progressiveDifficulty = levelToDifficulty(progress.getLevel(activeDe));
  const activeDifficulty =
    mode === "progressive" ? progressiveDifficulty : settings.difficulty;

  // Filter verses by selected Đệ
  const verses = useMemo(() => {
    let list = allVerses;
    if (activeDe !== 0) list = allVerses.filter((v) => v.de === activeDe);
    if (mode === "smart") {
      list = list
        .filter((v) => (game.stats.wrongVerseCounts[v.id] || 0) > 0)
        .sort((a, b) => game.stats.wrongVerseCounts[b.id] - game.stats.wrongVerseCounts[a.id]);
    }
    return list;
  }, [allVerses, activeDe, mode, game.stats.wrongVerseCounts]);

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
      showAchievement(a);
    }
  }, [game, showAchievement]);

  // Quiz engine hook
  const quiz = useQuizEngine({
    verses,
    difficulty: activeDifficulty,
    mode,
    itemsPerPage: settings.itemsPerPage,
    onXP: game.addXP,
    onCorrect: (verseId) => {
      game.addCorrect();
      if (mode === "smart") {
        game.healWrong(verseId);
      }
    },
    onWrong: game.addWrong,
  });

  // Level up detection
  useEffect(() => {
    if (game.stats.level > prevLevel && prevLevel > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    setPrevLevel(game.stats.level);
  }, [game.stats.level, prevLevel]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowLeft" && quiz.page > 0) quiz.setPage((p) => p - 1);
      else if (e.key === "ArrowRight" && quiz.page < quiz.totalPages - 1)
        quiz.setPage((p) => p + 1);
      else if (e.key === "Escape") setSettingsOpen(false);
      else if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        handleRefresh();
      } else if (e.key === "1") handleModeChange("fill");
      else if (e.key === "2") handleModeChange("progressive");
      else if (e.key === "3") handleModeChange("flash");
      else if (e.key === "4") handleModeChange("shuffle");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [quiz.page, quiz.totalPages]);

  const handleRefresh = () => {
    quiz.refresh();
    setCompletionMsg(null);
  };

  const handleDeChange = (nextDe: 0 | 1 | 2 | 3 | 4 | 5) => {
    setDe(nextDe);
    setSettings({ de: nextDe });
    quiz.refresh();
    setCompletionMsg(null);
  };

  const handleExport = useCallback(() => {
    try {
      const data = {
        stats: JSON.parse(localStorage.getItem("chu_game_stats") || "{}"),
        settings: JSON.parse(localStorage.getItem("chu_settings") || "{}"),
        exportDate: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chu-lang-nghiem-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Lỗi khi tải dữ liệu backup.");
    }
  }, []);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.stats) localStorage.setItem("chu_game_stats", JSON.stringify(data.stats));
        if (data.settings) localStorage.setItem("chu_settings", JSON.stringify(data.settings));
        alert("Khôi phục thành công! Trang web sẽ tải lại.");
        window.location.reload();
      } catch (err) {
        alert("File backup không hợp lệ.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  const handleModeChange = (m: PracticeMode) => {
    setMode(m);
    quiz.refresh();
    setCompletionMsg(null);
  };

  const handleProgressiveComplete = () => {
    progress.increment(activeDe);
    game.addXP(XP_BONUS_COMPLETE);
    game.completeSession(session.seconds);
    if (activeDe !== 0) game.completeDe(activeDe);
    const newLevel = progress.getLevel(activeDe) + 1;
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
    else wrongIds.forEach((id) => game.addWrong(id));
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

  const handleFillComplete = () => {
    game.addXP(XP_BONUS_COMPLETE);
    game.completeSession(session.seconds);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    quiz.refresh();
    setTimeout(checkAchievements, 200);
  };

  const groupedByDe = useMemo(() => {
    if (activeDe !== 0)
      return [{ de: activeDe, label: DE_LABELS[activeDe], qvs: quiz.paginatedVerses }];
    return sections
      .map((sec) => ({
        de: sec.de,
        label: sec.label,
        qvs: quiz.paginatedVerses.filter((qv) => qv.verse.de === sec.de),
      }))
      .filter((g) => g.qvs.length > 0);
  }, [quiz.paginatedVerses, activeDe, sections]);

  if (!hydrated || !game.hydrated) return <SkeletonLoader />;

  const TABS: { id: TabType; label: string; icon: ReactNode }[] = [
    { id: "quiz", label: "Luyện tập", icon: <PenLine size={20} /> },
    { id: "text", label: "Toàn bộ", icon: <BookOpen size={20} /> },
    { id: "stats", label: "Thống kê", icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col pb-16 sm:pb-0">
      <ConfettiCelebration active={showConfetti} />

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 glass-header gradient-border">
        <div className="max-w-5xl mx-auto px-4 py-2.5">
          {/* Row 1: Logo + Gamification + Actions */}
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-lg sm:text-xl font-bold font-serif tracking-wide text-gradient shrink-0">
              Chú Lăng Nghiêm
            </h1>

            <div className="flex items-center gap-1 sm:gap-1.5">
              <LevelBadge level={game.stats.level} totalXP={game.stats.totalXP} />
              <StreakBadge streak={game.stats.currentStreak} bestStreak={game.stats.bestStreak} />
              <DailyGoalRing current={game.stats.dailyXP} goal={game.stats.dailyGoal} />
              <span
                className="text-[11px] tabular-nums px-1.5 py-0.5 rounded-md font-semibold hidden sm:inline-flex sm:items-center sm:gap-1"
                style={{ background: "var(--accent-ghost)", color: "var(--accent)" }}
              >
                <Star size={10} fill="currentColor" />
                {game.stats.totalXP.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span
                className="text-[10px] tabular-nums px-1.5 py-0.5 rounded hidden sm:inline-block"
                style={{ color: "var(--text-muted)" }}
              >
                {session.formatted}
              </span>
              <ThemeToggle />
              {tab === "quiz" && (
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-90"
                  style={{
                    background: settingsOpen ? "var(--accent-ghost)" : "transparent",
                    color: settingsOpen ? "var(--accent)" : "var(--text-secondary)",
                  }}
                  aria-label="Cài đặt"
                >
                  <Settings size={20} />
                </button>
              )}
              <button
                onClick={handleRefresh}
                className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 active:scale-90"
                style={{
                  background: "var(--accent-ghost)",
                  border: "1px solid var(--border-active)",
                }}
                aria-label="Làm mới"
              >
                <RotateCcw size={18} style={{ color: "var(--accent)" }} />
              </button>
            </div>
          </div>

          {/* Row 2: Desktop tab bar + Mode selector */}
          <div className="hidden sm:flex items-center gap-1 mt-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95"
                style={{
                  color: tab === t.id ? "var(--accent)" : "var(--text-secondary)",
                  background: tab === t.id ? "var(--accent-ghost)" : "transparent",
                  border:
                    tab === t.id
                      ? "1px solid var(--border-active)"
                      : "1px solid transparent",
                }}
              >
                <span className="flex items-center gap-1.5">
                  {t.icon} {t.label}
                </span>
              </button>
            ))}
            <div className="flex-1" />
            {tab === "quiz" && <ModeSelector value={mode} onChange={handleModeChange} />}
          </div>

          {/* Mobile mode selector */}
          {tab === "quiz" && (
            <div className="mt-2 -mx-4 px-4 overflow-x-auto scrollbar-none sm:hidden">
              <ModeSelector value={mode} onChange={handleModeChange} />
            </div>
          )}

          {/* Progress bar */}
          {tab === "quiz" && (mode === "fill" || mode === "progressive") && (
            <div className="mt-2">
              <ProgressBar correct={quiz.correctSet.size} total={quiz.totalBlanks} />
            </div>
          )}
        </div>

        {/* Settings panel */}
        {tab === "quiz" && settingsOpen && (
          <div
            className="animate-slide-down border-t"
            style={{
              borderColor: "var(--border-subtle)",
              background: "rgba(7, 7, 13, 0.85)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div className="max-w-5xl mx-auto px-4 py-3 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <span
                  className="text-xs font-medium shrink-0"
                  style={{ color: "var(--text-muted)" }}
                >
                  Phần
                </span>
                <DeSelector value={activeDe} onChange={handleDeChange} />
              </div>

              {tab === "quiz" && mode === "progressive" ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className="text-xs font-medium shrink-0" style={{ color: "var(--text-muted)" }}>Độ khó</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-3 py-1.5 rounded-lg"
                      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-active)", color: "var(--accent)" }}>
                      {DIFFICULTY_CONFIG[progressiveDifficulty].emoji}{" "}
                      {DIFFICULTY_CONFIG[progressiveDifficulty].label}
                      <span className="ml-1.5" style={{ color: "var(--text-muted)" }}>Lv.{progress.getLevel(activeDe)}</span>
                    </span>
                    <button
                      onClick={() => {
                        progress.reset(activeDe);
                        handleRefresh();
                      }}
                      className="text-xs px-2 py-1 rounded-md transition-colors duration-200 hover:text-red-400 active:scale-95"
                      style={{ color: "var(--text-muted)", background: "var(--bg-elevated)" }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ) : mode === "fill" || mode === "shuffle" ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span
                    className="text-xs font-medium shrink-0"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Độ khó
                  </span>
                  <DifficultySelector
                    value={settings.difficulty}
                    onChange={(d) => {
                      setSettings({ difficulty: d });
                      quiz.resetCorrects();
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Độ khó
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Tất cả từ bị ẩn
                  </span>
                </div>
              )}

              {/* ── Advanced settings ── */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <span className="text-xs font-medium shrink-0" style={{ color: "var(--text-muted)" }}>Mục tiêu XP</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range" min={20} max={200} step={10}
                    value={settings.dailyGoal}
                    onChange={(e) => setSettings({ dailyGoal: Number(e.target.value) })}
                    className="w-28 accent-amber-400"
                    aria-label="Daily XP goal"
                  />
                  <span className="text-xs tabular-nums" style={{ color: "var(--accent)" }}>{settings.dailyGoal} XP</span>
                </div>
              </div>

              {mode === "flash" && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className="text-xs font-medium shrink-0" style={{ color: "var(--text-muted)" }}>Flash thời gian</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range" min={1} max={10} step={1}
                      value={settings.flashDuration}
                      onChange={(e) => setSettings({ flashDuration: Number(e.target.value) })}
                      className="w-28 accent-amber-400"
                      aria-label="Flash memorize duration"
                    />
                    <span className="text-xs tabular-nums" style={{ color: "var(--accent)" }}>{settings.flashDuration}s</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <span className="text-xs font-medium shrink-0" style={{ color: "var(--text-muted)" }}>Câu/trang</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range" min={10} max={50} step={5}
                    value={settings.itemsPerPage}
                    onChange={(e) => setSettings({ itemsPerPage: Number(e.target.value) })}
                    className="w-28 accent-amber-400"
                    aria-label="Items per page"
                  />
                  <span className="text-xs tabular-nums" style={{ color: "var(--accent)" }}>{settings.itemsPerPage}</span>
                </div>
              </div>

              {/* ── Backup ── */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <span className="text-xs font-medium shrink-0" style={{ color: "var(--text-muted)" }}>Dữ liệu</span>
                <div className="flex items-center gap-2">
                  <button onClick={handleExport} className="text-[11px] px-3 py-1.5 rounded-lg border hover:bg-white/5 active:scale-95 transition-all" style={{ borderColor: "var(--border-active)", color: "var(--text-primary)" }}>
                    Tải file Backup
                  </button>
                  <label className="text-[11px] px-3 py-1.5 rounded-lg border hover:bg-white/5 active:scale-95 transition-all cursor-pointer" style={{ borderColor: "var(--border-active)", color: "var(--text-primary)" }}>
                    Khôi phục
                    <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
                  </label>
                </div>
              </div>

              {/* Keyboard hints — desktop only */}
              <div className="hidden sm:flex flex-wrap gap-2 pt-1">
                {[
                  { key: "←→", desc: "Chuyển trang" },
                  { key: "1-4", desc: "Chuyển mode" },
                  { key: "Ctrl+↵", desc: "Làm mới" },
                  { key: "Esc", desc: "Đóng" },
                ].map((s) => (
                  <span
                    key={s.key}
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
                  >
                    <kbd className="font-mono mr-1" style={{ color: "var(--text-secondary)" }}>
                      {s.key}
                    </kbd>
                    {s.desc}
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
            {/* Completion message banner */}
            {completionMsg && (
              <div className="max-w-4xl mx-auto px-4 pt-4 sm:pt-6 animate-fade-in-up">
                <div
                  className="glass-card rounded-xl px-4 py-3 sm:px-5 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  style={{ boxShadow: "0 0 20px var(--accent-glow)" }}
                >
                  <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
                    {completionMsg}
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="shrink-0 w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 active:scale-95 text-center"
                    style={{
                      background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
                      color: "white",
                    }}
                  >
                    Làm mới
                  </button>
                </div>
              </div>
            )}

            {mode === "flash" && !completionMsg && (
              <FlashMode
                quizVerses={quiz.quizVerses}
                flashDuration={settings.flashDuration}
                onComplete={handleFlashComplete}
              />
            )}

            {mode === "shuffle" && !completionMsg && (
              <ShuffleMode
                quizVerses={quiz.quizVerses}
                seed={quiz.seed}
                onComplete={handleShuffleComplete}
              />
            )}

            {(mode === "fill" || mode === "progressive" || mode === "smart") && (
              <>
                {verses.length === 0 && mode === "smart" ? (
                  <div className="max-w-4xl mx-auto px-4 py-12 text-center animate-fade-in-up">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'var(--success-ghost)', color: 'var(--success)' }}>
                      <Star size={32} />
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-gradient">Tuyệt vời!</h2>
                    <p style={{ color: "var(--text-muted)" }}>Bạn không có câu nào cần ôn tập ở phần này.</p>
                  </div>
                ) : (
                  <QuizContent
                    groupedByDe={groupedByDe}
                    correctSet={quiz.correctSet}
                    seed={quiz.seed}
                    page={quiz.page}
                    totalPages={quiz.totalPages}
                    quizVerses={quiz.quizVerses}
                    onCorrect={quiz.handleCorrect}
                    onWrong={quiz.handleWrong}
                    onPageChange={quiz.setPage}
                  />
                )}

                {quiz.isComplete && verses.length > 0 && !completionMsg && (
                  <CompletionScreen
                    totalBlanks={quiz.totalBlanks}
                    mode={mode}
                    progressiveDifficulty={progressiveDifficulty}
                    progressiveLevel={progress.getLevel(settings.de)}
                    onRefresh={handleFillComplete}
                    onProgressiveComplete={handleProgressiveComplete}
                    sessionSeconds={session.seconds}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* ─── Bottom Tab Bar (mobile) ─── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 sm:hidden glass-header"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-stretch">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors duration-200 active:scale-95"
              style={{
                color: tab === t.id ? "var(--accent)" : "var(--text-muted)",
                background: tab === t.id ? "var(--accent-ghost)" : "transparent",
              }}
            >
              {t.icon}
              <span className="text-[10px] font-semibold">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ─── Footer (desktop) ─── */}
      <footer
        className="hidden sm:block text-center py-5 text-xs"
        style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)" }}
      >
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-center gap-3">
          <span>Chú Lăng Nghiêm · {new Date().getFullYear()}</span>
          <span>·</span>
          <span>
            Level {game.stats.level} · {game.stats.totalXP.toLocaleString()} XP
          </span>
        </div>
      </footer>
    </div>
  );
}
