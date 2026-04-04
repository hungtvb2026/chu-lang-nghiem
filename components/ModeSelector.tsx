"use client";

export type PracticeMode = "fill" | "progressive" | "flash" | "shuffle" | "smart";

import { PenLine, TrendingUp, Zap, Shuffle, BrainCircuit } from "lucide-react";

const MODES: {
  value: PracticeMode;
  label: string;
  icon: typeof PenLine;
  desc: string;
}[] = [
  { value: "fill",        icon: PenLine,     label: "Điền từ",    desc: "Điền từ còn thiếu theo thứ tự" },
  { value: "progressive", icon: TrendingUp,  label: "Tiến độ",    desc: "Tự động tăng độ khó" },
  { value: "flash",       icon: Zap,         label: "Flash",      desc: "Nhìn rồi ghi lại từ trí nhớ" },
  { value: "shuffle",     icon: Shuffle,     label: "Ngẫu nhiên", desc: "Thứ tự ngẫu nhiên" },
  { value: "smart",       icon: BrainCircuit,label: "Ôn tập",     desc: "Ôn tập thông minh câu sai" },
];

type Props = {
  value: PracticeMode;
  onChange: (m: PracticeMode) => void;
};

export default function ModeSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-1 sm:gap-1.5 min-w-0">
      {MODES.map((m) => {
        const active = value === m.value;
        const Icon = m.icon;
        return (
          <button
            key={m.value}
            onClick={() => onChange(m.value)}
            title={m.desc}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-lg
              text-[13px] font-semibold transition-all duration-200 whitespace-nowrap
              active:scale-95 shrink-0
            `}
            style={active ? {
              background: 'var(--accent-ghost)',
              border: '1px solid var(--border-active)',
              color: 'var(--accent)',
            } : {
              background: 'transparent',
              border: '1px solid transparent',
              color: 'var(--text-muted)',
            }}
          >
            <Icon size={15} strokeWidth={2} />
            <span className="hidden min-[480px]:inline">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export { MODES };
