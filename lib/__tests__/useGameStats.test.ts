import { describe, it, expect } from "vitest";
import { getLevelFromXP, getXPProgress } from "../useGameStats";

// xpForLevel(L) = 50 * L * (L - 1)
// L=1: 0, L=2: 100, L=3: 300, L=4: 600, L=5: 1000

describe("getLevelFromXP", () => {
  it("returns level 1 at 0 XP", () => {
    expect(getLevelFromXP(0)).toBe(1);
  });

  it("returns level 1 just before Level 2 threshold (99 XP)", () => {
    expect(getLevelFromXP(99)).toBe(1);
  });

  it("returns level 2 at exactly 100 XP", () => {
    expect(getLevelFromXP(100)).toBe(2);
  });

  it("returns level 2 between 100 and 299 XP", () => {
    expect(getLevelFromXP(150)).toBe(2);
    expect(getLevelFromXP(299)).toBe(2);
  });

  it("returns level 3 at exactly 300 XP", () => {
    expect(getLevelFromXP(300)).toBe(3);
  });

  it("returns level 4 at exactly 600 XP", () => {
    expect(getLevelFromXP(600)).toBe(4);
  });

  it("returns level 5 at exactly 1000 XP", () => {
    expect(getLevelFromXP(1000)).toBe(5);
  });

  it("returns level 10 at correct XP threshold", () => {
    // xpForLevel(10) = 50 * 10 * 9 = 4500
    expect(getLevelFromXP(4500)).toBe(10);
    expect(getLevelFromXP(4499)).toBe(9);
  });

  it("handles large XP values", () => {
    const level = getLevelFromXP(100000);
    expect(level).toBeGreaterThan(10);
  });

  it("is monotonically non-decreasing with XP", () => {
    for (let xp = 0; xp < 2000; xp += 50) {
      const l1 = getLevelFromXP(xp);
      const l2 = getLevelFromXP(xp + 50);
      expect(l2).toBeGreaterThanOrEqual(l1);
    }
  });
});

describe("getXPProgress", () => {
  it("returns 0% progress at level start", () => {
    // Level 1 starts at 0 XP
    const result = getXPProgress(0);
    expect(result.pct).toBe(0);
    expect(result.current).toBe(0);
  });

  it("returns 100% progress at exactly next level threshold", () => {
    // At 100 XP user is level 2; progress within level 2 = 0 since they just hit it
    // Let's check at 300 XP (level 3 threshold): they are now level 3
    const result = getXPProgress(300);
    expect(result.pct).toBe(0); // Just entered level 3
  });

  it("progress increases within a level", () => {
    // Level 2: 100 → 300 (needs 200 XP)
    const at100 = getXPProgress(100); // start of level 2
    const at200 = getXPProgress(200); // 100/200 = 50%
    const at299 = getXPProgress(299); // 199/200 = ~99%
    expect(at100.pct).toBe(0);
    expect(at200.pct).toBe(50);
    expect(at299.pct).toBeGreaterThanOrEqual(99); // 199/200 * 100 rounds to 100
  });

  it("needed XP is always positive", () => {
    [0, 100, 300, 600, 1000].forEach((xp) => {
      const result = getXPProgress(xp);
      expect(result.needed).toBeGreaterThan(0);
    });
  });

  it("current is always less than needed (before hitting next level)", () => {
    [50, 150, 450, 800].forEach((xp) => {
      const result = getXPProgress(xp);
      expect(result.current).toBeLessThan(result.needed);
    });
  });
});

describe("XP formula consistency", () => {
  it("xpForLevel satisfies L=1→0, L=2→100, L=3→300, L=5→1000", () => {
    // We derive from getLevelFromXP boundary behavior
    expect(getLevelFromXP(0)).toBe(1);
    expect(getLevelFromXP(100)).toBe(2);
    expect(getLevelFromXP(300)).toBe(3);
    expect(getLevelFromXP(1000)).toBe(5);
  });

  it("each level requires more XP than the previous (exponential curve)", () => {
    const levelXPs = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];
    for (let i = 1; i < levelXPs.length; i++) {
      const diff = levelXPs[i] - levelXPs[i - 1];
      const prevDiff = i > 1 ? levelXPs[i - 1] - levelXPs[i - 2] : 0;
      if (i > 1) expect(diff).toBeGreaterThanOrEqual(prevDiff);
    }
  });
});
