import { describe, it, expect } from "vitest";
import {
  ACHIEVEMENTS,
  checkNewAchievements,
  type AchievementCheckData,
} from "../achievements";

function makeData(overrides: Partial<AchievementCheckData> = {}): AchievementCheckData {
  return {
    totalXP: 0,
    totalCorrect: 0,
    totalWrong: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalSessions: 0,
    totalTimeSeconds: 0,
    deCompleted: [],
    flashPerfect: false,
    level: 1,
    ...overrides,
  };
}

describe("ACHIEVEMENTS", () => {
  it("has 12 achievements defined", () => {
    expect(ACHIEVEMENTS).toHaveLength(12);
  });

  it("all achievements have required fields", () => {
    ACHIEVEMENTS.forEach((a) => {
      expect(a.id).toBeTruthy();
      expect(a.title).toBeTruthy();
      expect(a.description).toBeTruthy();
      expect(a.emoji).toBeTruthy();
      expect(["bronze", "silver", "gold", "diamond"]).toContain(a.tier);
      expect(typeof a.condition).toBe("function");
    });
  });

  it("all achievement IDs are unique", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

describe("achievement conditions", () => {
  it("first_step — triggers at totalSessions >= 1", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "first_step")!;
    expect(a.condition(makeData({ totalSessions: 0 }))).toBe(false);
    expect(a.condition(makeData({ totalSessions: 1 }))).toBe(true);
    expect(a.condition(makeData({ totalSessions: 5 }))).toBe(true);
  });

  it("streak_3 — triggers at currentStreak >= 3", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "streak_3")!;
    expect(a.condition(makeData({ currentStreak: 2 }))).toBe(false);
    expect(a.condition(makeData({ currentStreak: 3 }))).toBe(true);
  });

  it("streak_7 — triggers at currentStreak >= 7", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "streak_7")!;
    expect(a.condition(makeData({ currentStreak: 6 }))).toBe(false);
    expect(a.condition(makeData({ currentStreak: 7 }))).toBe(true);
  });

  it("streak_30 — triggers at currentStreak >= 30", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "streak_30")!;
    expect(a.condition(makeData({ currentStreak: 29 }))).toBe(false);
    expect(a.condition(makeData({ currentStreak: 30 }))).toBe(true);
  });

  it("xp_100 — triggers at totalXP >= 100", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "xp_100")!;
    expect(a.condition(makeData({ totalXP: 99 }))).toBe(false);
    expect(a.condition(makeData({ totalXP: 100 }))).toBe(true);
  });

  it("xp_1000 — triggers at totalXP >= 1000", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "xp_1000")!;
    expect(a.condition(makeData({ totalXP: 999 }))).toBe(false);
    expect(a.condition(makeData({ totalXP: 1000 }))).toBe(true);
  });

  it("xp_10000 — triggers at totalXP >= 10000", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "xp_10000")!;
    expect(a.condition(makeData({ totalXP: 9999 }))).toBe(false);
    expect(a.condition(makeData({ totalXP: 10000 }))).toBe(true);
  });

  it("de_1 — triggers when deCompleted includes 1", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "de_1")!;
    expect(a.condition(makeData({ deCompleted: [] }))).toBe(false);
    expect(a.condition(makeData({ deCompleted: [2] }))).toBe(false);
    expect(a.condition(makeData({ deCompleted: [1] }))).toBe(true);
    expect(a.condition(makeData({ deCompleted: [1, 2, 3] }))).toBe(true);
  });

  it("de_all — requires all 5 sections completed", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "de_all")!;
    expect(a.condition(makeData({ deCompleted: [1, 2, 3, 4] }))).toBe(false);
    expect(a.condition(makeData({ deCompleted: [1, 2, 3, 4, 5] }))).toBe(true);
  });

  it("flash_master — requires flashPerfect = true", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "flash_master")!;
    expect(a.condition(makeData({ flashPerfect: false }))).toBe(false);
    expect(a.condition(makeData({ flashPerfect: true }))).toBe(true);
  });

  it("accuracy_90 — requires >= 50 total and >= 90% accuracy", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "accuracy_90")!;
    // Not enough samples
    expect(a.condition(makeData({ totalCorrect: 49, totalWrong: 0 }))).toBe(false);
    // Enough samples, 90% exactly
    expect(a.condition(makeData({ totalCorrect: 45, totalWrong: 5 }))).toBe(true);
    // Enough samples, below 90%
    expect(a.condition(makeData({ totalCorrect: 44, totalWrong: 6 }))).toBe(false);
    // 100% accuracy
    expect(a.condition(makeData({ totalCorrect: 100, totalWrong: 0 }))).toBe(true);
  });

  it("level_10 — triggers at level >= 10", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "level_10")!;
    expect(a.condition(makeData({ level: 9 }))).toBe(false);
    expect(a.condition(makeData({ level: 10 }))).toBe(true);
  });
});

describe("checkNewAchievements", () => {
  it("returns only achievements not already unlocked", () => {
    const data = makeData({ totalSessions: 1, totalXP: 100 });
    const existing = ["first_step"]; // already unlocked
    const newOnes = checkNewAchievements(data, existing);
    const ids = newOnes.map((a) => a.id);
    expect(ids).not.toContain("first_step");
    expect(ids).toContain("xp_100");
  });

  it("returns empty array if all met achievements already unlocked", () => {
    const data = makeData({ totalSessions: 1 });
    const existing = ["first_step"];
    const newOnes = checkNewAchievements(data, existing);
    expect(newOnes).toHaveLength(0);
  });

  it("returns empty array for fresh user with no progress", () => {
    const data = makeData();
    const newOnes = checkNewAchievements(data, []);
    expect(newOnes).toHaveLength(0);
  });

  it("returns multiple achievements if multiple conditions met", () => {
    const data = makeData({
      totalSessions: 1,
      totalXP: 1000,
      currentStreak: 7,
    });
    const newOnes = checkNewAchievements(data, []);
    const ids = newOnes.map((a) => a.id);
    expect(ids).toContain("first_step");
    expect(ids).toContain("xp_100");
    expect(ids).toContain("xp_1000");
    expect(ids).toContain("streak_3");
    expect(ids).toContain("streak_7");
  });

  it("never returns duplicates", () => {
    const data = makeData({ totalXP: 10000, totalSessions: 5, currentStreak: 30, level: 10, flashPerfect: true, deCompleted: [1,2,3,4,5] });
    const newOnes = checkNewAchievements(data, []);
    const ids = newOnes.map((a) => a.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});
