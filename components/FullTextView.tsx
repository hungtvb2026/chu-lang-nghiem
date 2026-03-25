"use client";

import { Verse, DeSection, DE_LABELS } from "@/lib/types";

type Props = {
  verses: Verse[];
  sections: DeSection[];
  selectedDe: 0 | 1 | 2 | 3 | 4 | 5;
};

export default function FullTextView({ verses, sections, selectedDe }: Props) {
  // Group current verses by đệ
  const groups =
    selectedDe !== 0
      ? [{ de: selectedDe, label: DE_LABELS[selectedDe], verses }]
      : sections.map((s) => ({
          de: s.de,
          label: s.label,
          verses: verses.filter((v) => v.de === s.de),
        }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {groups.map(({ de, label, verses: groupVerses }) => (
        <section key={de}>
          {/* Section header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-amber-800/60 to-transparent" />
            <h2 className="text-amber-500 font-serif font-semibold text-lg px-2">{label}</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-amber-800/60 to-transparent" />
          </div>

          <div className="bg-stone-900/50 rounded-2xl border border-stone-800 px-5 py-4">
            {groupVerses.map((verse) => (
              <div key={verse.id} className="flex flex-wrap gap-x-1.5 gap-y-0 py-1 group">
                <span className="text-stone-600 text-xs tabular-nums select-none mt-1 shrink-0 w-8 text-right">
                  {verse.id}.
                </span>
                <p className="text-stone-200 font-serif text-base leading-relaxed flex-1">
                  {verse.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
