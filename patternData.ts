interface ResultPanelProps {
  visible: boolean;
  correct: boolean;
  title: string;
  description?: string;
  expGain?: number;
  onNext: () => void;
  nextLabel?: string;
}

export default function ResultPanel({
  visible,
  correct,
  title,
  description,
  expGain,
  onNext,
  nextLabel = '次の問題へ',
}: ResultPanelProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-3xl border-t border-[var(--color-border)] bg-[var(--color-surface)] p-5 pb-8 safe-bottom">
        <div className="mb-3 flex items-center gap-2">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-full text-xl font-bold ${
              correct ? 'bg-[var(--color-up)]/15 text-[var(--color-up)]' : 'bg-[var(--color-down)]/15 text-[var(--color-down)]'
            }`}
          >
            {correct ? '◎' : '×'}
          </span>
          <div>
            <div className={`text-lg font-bold ${correct ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'}`}>
              {correct ? '正解！' : '不正解'}
            </div>
            <div className="text-sm font-medium text-gray-200">{title}</div>
          </div>
          {expGain !== undefined && (
            <div className="ml-auto rounded-full bg-[var(--color-accent)]/15 px-3 py-1 text-xs font-bold text-[var(--color-accent)]">
              +{expGain} EXP
            </div>
          )}
        </div>
        {description && <p className="mb-4 text-sm leading-relaxed text-gray-400">{description}</p>}
        <button
          onClick={onNext}
          className="w-full rounded-xl bg-[var(--color-accent)] py-3.5 text-base font-bold text-black active:scale-[0.98]"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
