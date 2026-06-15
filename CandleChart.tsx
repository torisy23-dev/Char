interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export default function ScreenHeader({ title, onBack, right }: ScreenHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 px-3 py-3 backdrop-blur safe-top">
      {onBack && (
        <button
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-gray-300 active:bg-white/10"
          aria-label="戻る"
        >
          ←
        </button>
      )}
      <h1 className="flex-1 truncate text-base font-bold text-gray-100">{title}</h1>
      {right}
    </header>
  );
}
