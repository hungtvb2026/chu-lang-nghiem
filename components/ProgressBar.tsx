type Props = {
  correct: number;
  total: number;
};

export default function ProgressBar({ correct, total }: Props) {
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-stone-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-stone-400 tabular-nums w-24 text-right">
        {correct}/{total} ô ({pct}%)
      </span>
    </div>
  );
}
