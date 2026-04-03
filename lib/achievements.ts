// Achievement definitions and checking logic

export type Achievement = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  condition: (stats: AchievementCheckData) => boolean;
  tier: "bronze" | "silver" | "gold" | "diamond";
};

export type AchievementCheckData = {
  totalXP: number;
  totalCorrect: number;
  totalWrong: number;
  currentStreak: number;
  bestStreak: number;
  totalSessions: number;
  totalTimeSeconds: number;
  deCompleted: number[]; // list of đệ IDs completed
  flashPerfect: boolean; // completed flash with 0 wrong
  level: number;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_step",
    title: "Sơ Khởi",
    description: "Hoàn thành bài luyện tập đầu tiên",
    emoji: "🌱",
    tier: "bronze",
    condition: (s) => s.totalSessions >= 1,
  },
  {
    id: "streak_3",
    title: "Tinh Tấn",
    description: "Duy trì streak 3 ngày liên tục",
    emoji: "🔥",
    tier: "bronze",
    condition: (s) => s.currentStreak >= 3,
  },
  {
    id: "streak_7",
    title: "Kiên Trì",
    description: "Duy trì streak 7 ngày liên tục",
    emoji: "🔥",
    tier: "silver",
    condition: (s) => s.currentStreak >= 7,
  },
  {
    id: "streak_30",
    title: "Bất Thoái Chuyển",
    description: "Duy trì streak 30 ngày liên tục",
    emoji: "💫",
    tier: "gold",
    condition: (s) => s.currentStreak >= 30,
  },
  {
    id: "xp_100",
    title: "Nhập Môn",
    description: "Tích lũy 100 XP",
    emoji: "⭐",
    tier: "bronze",
    condition: (s) => s.totalXP >= 100,
  },
  {
    id: "xp_1000",
    title: "Tinh Thông",
    description: "Tích lũy 1,000 XP",
    emoji: "🌟",
    tier: "silver",
    condition: (s) => s.totalXP >= 1000,
  },
  {
    id: "xp_10000",
    title: "Kim Cương",
    description: "Tích lũy 10,000 XP",
    emoji: "💎",
    tier: "diamond",
    condition: (s) => s.totalXP >= 10000,
  },
  {
    id: "de_1",
    title: "Đệ Nhất Thành",
    description: "Hoàn thành Đệ Nhất",
    emoji: "🪷",
    tier: "bronze",
    condition: (s) => s.deCompleted.includes(1),
  },
  {
    id: "de_all",
    title: "Chinh Phục",
    description: "Hoàn thành tất cả 5 Đệ",
    emoji: "🏔️",
    tier: "gold",
    condition: (s) =>
      [1, 2, 3, 4, 5].every((d) => s.deCompleted.includes(d)),
  },
  {
    id: "flash_master",
    title: "Siêu Trí Nhớ",
    description: "Hoàn thành Flash mode không sai câu nào",
    emoji: "⚡",
    tier: "gold",
    condition: (s) => s.flashPerfect,
  },
  {
    id: "accuracy_90",
    title: "Chính Xác",
    description: "Đạt tỷ lệ đúng trên 90%",
    emoji: "🎯",
    tier: "silver",
    condition: (s) => {
      const total = s.totalCorrect + s.totalWrong;
      return total >= 50 && s.totalCorrect / total >= 0.9;
    },
  },
  {
    id: "level_10",
    title: "Thập Cấp",
    description: "Đạt Level 10",
    emoji: "👑",
    tier: "gold",
    condition: (s) => s.level >= 10,
  },
];

export const TIER_COLORS: Record<Achievement["tier"], { bg: string; border: string; text: string }> = {
  bronze:  { bg: "rgba(205, 127, 50, 0.1)",  border: "rgba(205, 127, 50, 0.3)",  text: "#cd7f32" },
  silver:  { bg: "rgba(192, 192, 192, 0.1)",  border: "rgba(192, 192, 192, 0.3)",  text: "#c0c0c0" },
  gold:    { bg: "rgba(255, 215, 0, 0.1)",    border: "rgba(255, 215, 0, 0.3)",    text: "#ffd700" },
  diamond: { bg: "rgba(185, 242, 255, 0.1)",  border: "rgba(185, 242, 255, 0.3)",  text: "#b9f2ff" },
};

export function checkNewAchievements(
  data: AchievementCheckData,
  existing: string[]
): Achievement[] {
  return ACHIEVEMENTS.filter(
    (a) => !existing.includes(a.id) && a.condition(data)
  );
}
