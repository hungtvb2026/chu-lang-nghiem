"use client";

import { memo } from "react";
import { GameStats, getXPProgress } from "@/lib/useGameStats";
import { ACHIEVEMENTS, TIER_COLORS } from "@/lib/achievements";
import { Star, Flame, Target, Clock, Trophy, Award, Lock, Check, Circle, Calendar, TrendingUp, BarChart2 } from "lucide-react";

type Props = {
  stats: GameStats;
};

const StatsTab = memo(function 
StatsTab({ stats }: Props) {
  const { current: xpCurrent, needed: xpNeeded, pct: levelPct } = getXPProgress(stats.totalXP);
  const accuracy =
    stats.totalCorrect + stats.totalWrong > 0
      ? Math.round(
          (stats.totalCorrect / (stats.totalCorrect + stats.totalWrong)) * 100
        )
      : 0;

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const calendarDays = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (27 - i));
    const key = d.toISOString().split("T")[0];
    const entry = stats.dailyHistory[key];
    return { date: key, day: d.getDate(), xp: entry?.xp || 0, correct: entry?.correct || 0, wrong: entry?.wrong || 0 };
  });

  const maxDayXP = Math.max(1, ...calendarDays.map((d) => d.xp));

  const formatTime = (s: number) => {
    if (s < 60) return `${s} giây`;
    if (s < 3600) return `${Math.floor(s / 60)} phút`;
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}p`;
  };

  const deList = [1, 2, 3, 4, 5];
  const deLabels: Record<number, string> = { 1: "Nhất", 2: "Nhị", 3: "Tam", 4: "Tứ", 5: "Ngũ" };

  const todayEntry = stats.dailyHistory[todayStr];
  const todayXP = todayEntry?.xp || 0;
  const todayCorrect = todayEntry?.correct || 0;
  const todayWrong = todayEntry?.wrong || 0;
  const todayAccuracy = todayCorrect + todayWrong > 0
    ? Math.round((todayCorrect / (todayCorrect + todayWrong)) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 animate-fade-in-up">

      {/* ═══ HERO SECTION ═══ */}
      <div className="glass-card rounded-2xl p-5 sm:p-7 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
          {/* Level Circle */}
          <div className="flex items-center gap-5 sm:gap-6">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="42" fill="none"
                  stroke="rgba(129, 140, 248, 0.06)" strokeWidth="4" />
                <circle cx="48" cy="48" r="42" fill="none"
                  stroke="url(#heroGrad)" strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - levelPct / 100)}
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
                <defs>
                  <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" />
                    <stop offset="100%" stopColor="var(--indigo)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-gradient">{stats.level}</span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-medium" style={{ color: 'var(--text-muted)' }}>Level</span>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Star size={16} fill="var(--accent)" style={{ color: 'var(--accent)' }} />
                <span className="text-lg sm:text-xl font-bold">{stats.totalXP.toLocaleString()}</span>
                <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>XP</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${levelPct}%`,
                      background: 'linear-gradient(90deg, var(--accent), var(--indigo))',
                    }} />
                </div>
                <span className="text-[10px] tabular-nums shrink-0 font-medium" style={{ color: 'var(--text-muted)' }}>
                  {xpCurrent}/{xpNeeded}
                </span>
              </div>
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-hint)' }}>
                Cần {xpNeeded - xpCurrent} XP để lên Level {stats.level + 1}
              </p>
            </div>
          </div>

          <div className="hidden sm:block w-px h-16 shrink-0" style={{ background: 'var(--border-subtle)' }} />

          {/* Quick stats grid */}
          <div className="grid grid-cols-3 gap-5 flex-1">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Flame size={20} style={{ color: stats.currentStreak >= 7 ? 'var(--error)' : 'var(--accent)' }} />
              </div>
              <div className="text-xl sm:text-2xl font-bold tabular-nums"
                style={{ color: stats.currentStreak >= 7 ? 'var(--error)' : 'var(--accent)' }}>
                {stats.currentStreak}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>ngày streak</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Target size={20} style={{ color: 'var(--success)' }} />
              </div>
              <div className="text-xl sm:text-2xl font-bold tabular-nums"
                style={{ color: 'var(--success)' }}>
                {accuracy}%
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>chính xác</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Clock size={20} style={{ color: 'var(--indigo)' }} />
              </div>
              <div className="text-xl sm:text-2xl font-bold tabular-nums"
                style={{ color: 'var(--indigo)' }}>
                {stats.totalSessions}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>phiên</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 2-COLUMN LAYOUT ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-3 space-y-5">

          {/* Today Card */}
          <div className="glass-card rounded-xl p-4 sm:p-5">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2.5" style={{ color: 'var(--text-primary)' }}>
              <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
              Hôm nay
            </h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold tabular-nums" style={{ color: 'var(--accent)' }}>{todayXP}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>XP</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold tabular-nums" style={{ color: 'var(--success)' }}>{todayCorrect}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>đúng</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold tabular-nums" style={{ color: 'var(--error)' }}>{todayWrong}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>sai</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold tabular-nums" style={{ color: todayAccuracy >= 90 ? 'var(--success)' : 'var(--text-secondary)' }}>{todayAccuracy}%</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>chính xác</div>
              </div>
            </div>
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span style={{ color: 'var(--text-muted)' }}>Mục tiêu: {stats.dailyXP}/{stats.dailyGoal} XP</span>
                {stats.dailyXP >= stats.dailyGoal && (
                  <span className="font-semibold flex items-center gap-1" style={{ color: 'var(--success)' }}>
                    <Check size={12} /> Đạt
                  </span>
                )}
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.round((stats.dailyXP / stats.dailyGoal) * 100))}%`,
                    background: stats.dailyXP >= stats.dailyGoal
                      ? 'var(--success)'
                      : 'linear-gradient(90deg, var(--accent), var(--accent-light))',
                  }} />
              </div>
            </div>
          </div>

          {/* Streak Calendar */}
          <div className="glass-card rounded-xl p-4 sm:p-5">
            <h3 className="text-base font-semibold mb-4 flex items-center justify-between"
              style={{ color: 'var(--text-primary)' }}>
              <span className="flex items-center gap-2.5">
                <Calendar size={20} style={{ color: 'var(--indigo)' }} />
                Lịch luyện tập
              </span>
              <span className="text-[11px] font-normal" style={{ color: 'var(--text-muted)' }}>
                Kỷ lục: {stats.bestStreak} ngày
              </span>
            </h3>
            <div className="grid grid-cols-7 gap-1.5">
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
                <div key={d} className="text-[10px] text-center pb-1 font-semibold"
                  style={{ color: 'var(--text-muted)' }}>{d}</div>
              ))}
              {calendarDays.map((d) => {
                const intensity = d.xp > 0 ? Math.max(0.1, d.xp / maxDayXP) : 0;
                const isToday = d.date === todayStr;
                return (
                  <div key={d.date}
                    className="aspect-square rounded-md flex items-center justify-center
                               text-[10px] sm:text-[11px] tabular-nums cursor-default
                               transition-all duration-200 hover:scale-105 hover:ring-1 focus:ring-1"
                    tabIndex={0}
                    aria-label={`${d.date}: ${d.xp} XP, ${d.correct} đúng, ${d.wrong} sai`}
                    style={{
                      background: d.xp > 0
                        ? `rgba(74, 222, 128, ${intensity})`
                        : 'var(--bg-elevated)',
                      border: isToday ? '1.5px solid var(--accent)' : '1px solid transparent',
                      color: d.xp > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontWeight: isToday ? 700 : 400,
                    }}
                    title={`${d.date}: ${d.xp} XP`}
                  >
                    {d.day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total Stats */}
          <div className="glass-card rounded-xl p-4 sm:p-5">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2.5"
              style={{ color: 'var(--text-primary)' }}>
              <BarChart2 size={20} style={{ color: 'var(--accent)' }} />
              Tổng quan
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-4">
              {[
                { label: "Tổng câu đúng", value: stats.totalCorrect.toLocaleString(), color: 'var(--success)' },
                { label: "Tổng câu sai", value: stats.totalWrong.toLocaleString(), color: 'var(--error)' },
                { label: "Tổng thời gian", value: formatTime(stats.totalTimeSeconds), color: 'var(--indigo)' },
                { label: "Phiên luyện tập", value: stats.totalSessions.toString(), color: 'var(--accent)' },
                { label: "Kỷ lục streak", value: `${stats.bestStreak} ngày`, color: 'var(--text-secondary)' },
                { label: "Đệ hoàn thành", value: `${stats.deCompleted.length}/5`, color: 'var(--success)' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between gap-2 py-2 px-2.5 rounded-lg"
                  style={{ background: 'var(--bg-elevated)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-5">

          {/* Đệ Progress */}
          <div className="glass-card rounded-xl p-4 sm:p-5">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2.5"
              style={{ color: 'var(--text-primary)' }}>
              <Trophy size={20} style={{ color: 'var(--accent)' }} />
              Tiến độ theo Đệ
            </h3>
            <div className="space-y-3">
              {deList.map((de) => {
                const completed = stats.deCompleted.includes(de);
                return (
                  <div key={de} className="flex items-center gap-3 py-1.5">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: completed ? 'rgba(74, 222, 128, 0.08)' : 'var(--bg-elevated)',
                        border: `1.5px solid ${completed ? 'rgba(74, 222, 128, 0.25)' : 'var(--border-subtle)'}`,
                      }}>
                      {completed ? (
                        <Check size={16} style={{ color: 'var(--success)' }} />
                      ) : (
                        <Circle size={14} style={{ color: 'var(--text-muted)' }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Đệ {deLabels[de]}
                        </span>
                        <span className="text-[10px] font-medium" style={{ color: completed ? 'var(--success)' : 'var(--text-muted)' }}>
                          {completed ? 'Hoàn thành' : 'Chưa xong'}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: completed ? '100%' : '0%',
                            background: completed
                              ? 'linear-gradient(90deg, var(--success), var(--accent))'
                              : 'transparent',
                          }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Achievements */}
          <div className="glass-card rounded-xl p-4 sm:p-5">
            <h3 className="text-base font-semibold mb-4 flex items-center justify-between"
              style={{ color: 'var(--text-primary)' }}>
              <span className="flex items-center gap-2.5">
                <Award size={20} style={{ color: 'var(--accent)' }} />
                Thành tựu
              </span>
              <span className="text-[10px] font-normal tabular-nums" style={{ color: 'var(--text-muted)' }}>
                {stats.achievements.length}/{ACHIEVEMENTS.length}
              </span>
            </h3>
            <div className="space-y-1.5">
              {ACHIEVEMENTS.map((a) => {
                const unlocked = stats.achievements.includes(a.id);
                const colors = TIER_COLORS[a.tier];
                return (
                  <div key={a.id}
                    className="flex items-center gap-3 py-2 px-2.5 rounded-lg transition-all duration-200"
                    style={{
                      background: unlocked ? colors.bg : 'transparent',
                      border: `1px solid ${unlocked ? colors.border : 'transparent'}`,
                      opacity: unlocked ? 1 : 0.4,
                    }}>
                    <span className="flex items-center justify-center w-8 h-8 shrink-0">
                      {unlocked ? (
                        <span className="text-lg">{a.emoji}</span>
                      ) : (
                        <Lock size={16} style={{ color: 'var(--text-muted)' }} />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate"
                        style={{ color: unlocked ? colors.text : 'var(--text-muted)' }}>
                        {a.title}
                      </p>
                      <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                        {a.description}
                      </p>
                    </div>
                    {unlocked && (
                      <span className="text-[9px] uppercase tracking-wider font-bold shrink-0 px-1.5 py-0.5 rounded"
                        style={{ color: colors.text, background: `${colors.border}30` }}>
                        {a.tier}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default StatsTab;
