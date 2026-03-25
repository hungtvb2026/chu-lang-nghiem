import { Verse } from "./types";

export type Difficulty = "easy" | "medium" | "hard" | "expert";

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; ratio: number; color: string; emoji: string }
> = {
  easy:   { label: "Dễ",       ratio: 0.15, color: "text-green-400",  emoji: "🌱" },
  medium: { label: "Vừa",      ratio: 0.30, color: "text-yellow-400", emoji: "🌙" },
  hard:   { label: "Khó",      ratio: 0.50, color: "text-orange-400", emoji: "🔥" },
  expert: { label: "Siêu khó", ratio: 0.80, color: "text-red-400",    emoji: "⚡" },
};

export type QuizVerse = {
  verse: Verse;
  words: string[];
  hiddenIndices: Set<number>;
};

export function generateQuiz(verses: Verse[], difficulty: Difficulty, seed = 0): QuizVerse[] {
  const ratio = DIFFICULTY_CONFIG[difficulty].ratio;

  return verses.map((verse) => {
    const words = verse.text.split(" ");
    const count = Math.max(1, Math.round(words.length * ratio));

    const indices = words.map((_, i) => i);
    seededShuffle(indices, verse.id + seed * 997);

    const hiddenIndices = new Set(indices.slice(0, count));
    return { verse, words, hiddenIndices };
  });
}

function seededShuffle(arr: number[], seed: number): void {
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = ((s * 1664525 + 1013904223) >>> 0);
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
