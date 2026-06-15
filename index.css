import { expForLevel, getLevelTitle } from '../types';
import type { UserStats } from '../types';

interface LevelBadgeProps {
  stats: UserStats;
  compact?: boolean;
}

export default function LevelBadge({ stats, compact = false }: LevelBadgeProps) {
  const needed = expForLevel(stats.level);
  const pct = Math.min(100, Math.round((stats.exp / needed) * 100));
  const title = getLevelTitle(stats.level);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent)]/15 text-sm font-bold text-[var(--color-accent)]">
          {stats.level}
        </div>
        <div className="text-xs text-gray-400">{title}</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)]/15 text-lg font-bold text-[var(--color-accent)]">
            Lv{stats.level}
          </div>
          <div>
            <div className="text-sm font-bold text-gray-100">{title}</div>
            <div className="text-xs text-gray-500">
              EXP {stats.exp} / {needed}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-alt)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-alt)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
