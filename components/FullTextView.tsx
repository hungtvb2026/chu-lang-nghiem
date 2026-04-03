"use client";

import { Verse, DeSection, DE_LABELS } from "@/lib/types";

type Props = {
  verses: Verse[];
  sections: DeSection[];
  selectedDe: 0 | 1 | 2 | 3 | 4 | 5;
};

export default function FullTextView({ verses, sections, selectedDe }: Props) {
  const groups =
    selectedDe !== 0
      ? [{ de: selectedDe, label: DE_LABELS[selectedDe], verses }]
      : sections.map((s) => ({
          de: s.de,
          label: s.label,
          verses: verses.filter((v) => v.de === s.de),
        }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10 animate-fade-in-up">
      {groups.map(({ de, label, verses: groupVerses }) => (
        <section key={de}>
          {/* Section header */}
          <div className="lotus-divider mb-5">
            <h2
              className="font-serif font-semibold text-lg px-3"
              style={{ color: 'var(--accent)' }}
            >
              {label}
            </h2>
          </div>

          <div className="glass-card rounded-2xl px-5 py-4">
            {groupVerses.map((verse) => (
              <div
                key={verse.id}
                className="group flex gap-x-2 py-1.5 px-2 -mx-2 rounded-lg
                           transition-colors duration-200 hover:bg-white/[0.02]
                           cursor-default"
              >
                <span
                  className="text-xs tabular-nums select-none mt-1 shrink-0 w-8 text-right
                             transition-colors duration-200 group-hover:text-amber-600/60"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {verse.id}.
                </span>
                <p
                  className="font-serif text-base leading-relaxed flex-1"
                  style={{ color: 'var(--text-primary)' }}
                >
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
