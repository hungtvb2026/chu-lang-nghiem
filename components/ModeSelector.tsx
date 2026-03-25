"use client";

export type PracticeMode = "fill" | "progressive" | "flash" | "shuffle";

const MODES: { value: PracticeMode; label: string; emoji: string; desc: string }[] = [
  { value: "fill",        emoji: "✏️",  label: "Điền từ",    desc: "Fill-in-blank theo thứ tự" },
  { value: "progressive", emoji: "📈", label: "Tiến độ",    desc: "Tự động tăng độ khó sau mỗi lần hoàn thành" },
  { value: "flash",       emoji: "⚡",  label: "Flash",      desc: "Nhìn rồi ghi lại từ trí nhớ" },
  { value: "shuffle",     emoji: "🔀",  label: "Ngẫu nhiên", desc: "Thứ tự ngẫu nhiên, luyện lại câu sai" },
];

type Props = {
  value: PracticeMode;
  onChange: (m: PracticeMode) => void;
};

export default function ModeSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {MODES.map((m) => (
        <button
          key={m.value}
          onClick={() => onChange(m.value)}
          title={m.desc}
          className={`
            px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border
            ${value === m.value
              ? "bg-stone-700 border-amber-500/70 text-amber-300"
              : "bg-stone-800/40 border-stone-700/40 text-stone-400 hover:text-stone-200 hover:border-stone-600"
            }
          `}
        >
          <span className="mr-1">{m.emoji}</span>{m.label}
        </button>
      ))}
    </div>
  );
}

export { MODES };
