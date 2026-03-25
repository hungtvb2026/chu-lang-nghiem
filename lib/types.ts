// Shared types — no Node.js imports, safe to use on both server and client

export type Verse = {
  id: number;
  text: string;
  de: 1 | 2 | 3 | 4 | 5;
};

export type DeSection = {
  de: 1 | 2 | 3 | 4 | 5;
  label: string;
  verses: Verse[];
};

export const DE_LABELS: Record<number, string> = {
  1: "Đệ Nhất",
  2: "Đệ Nhị",
  3: "Đệ Tam",
  4: "Đệ Tứ",
  5: "Đệ Ngũ",
};
