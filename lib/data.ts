// Client-safe data layer — imports from static JSON, no fs/path
import versesJson from "../data/verses.json";
import { Verse, DeSection, DE_LABELS } from "./types";

export type { Verse, DeSection };
export { DE_LABELS };

const VERSES = versesJson as Verse[];

export function getAllVerses(): Verse[] {
  return VERSES;
}

export function getVersesByDe(de: 0 | 1 | 2 | 3 | 4 | 5): Verse[] {
  if (de === 0) return VERSES;
  return VERSES.filter((v) => v.de === de);
}

export function getDeSections(): DeSection[] {
  return [1, 2, 3, 4, 5].map((de) => ({
    de: de as 1 | 2 | 3 | 4 | 5,
    label: DE_LABELS[de],
    verses: VERSES.filter((v) => v.de === de),
  }));
}
