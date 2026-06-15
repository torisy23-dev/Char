import LevelBadge from '../components/LevelBadge';
import type { useGameProgress } from '../hooks/useGameProgress';
import type { ScreenKey } from '../App';

export type GameKey = 'predict' | 'entry' | 'supres' | 'trend' | 'pattern';

interface HomeScreenProps {
  progress: ReturnType<typeof useGameProgress>;
  onNavigate: (screen: ScreenKey) => void;
  onStartGame: (game: GameKey) => void;
}

const QUICK_GAMES: { key: GameKey; label: string; icon: string; desc: string }[] = [
  { key: 'predict', label: 'チャート予想', icon: '🔮', desc: '10本後の上下を予想' },
  { key: 'pattern', label: 'パターン問題', icon: '🕯️', desc: 'ローソク足の形を学ぶ' },
];

export default function HomeScreen({ progress, onNavigate, onStartGame }: HomeScreenProps) {
  const { stats } = progress.data;
  const winRate =
    stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0;

  return (
    <div className="min-h-full bg-[var(--color-bg)] pb-24">
      <div className="px-4 pt-6">
        <div className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
          FX CHART TRAINER
        </div>
        <h1 className="mb-4 text-2xl font-extrabold text-gray-50">今日も相場を読む練習をしよう</h1>

        <LevelBadge stats={stats} />

        <div className="mt-4 grid grid-cols-3 gap-3">
          <StatCard label="総問題数" value={stats.totalQuestions.toString()} />
          <StatCard label="正解率" value={`${winRate}%`} />
          <StatCard label="連勝中" value={stats.currentStreak.toString()} highlight />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <StatCard label="最高連勝" value={stats.bestStreak.toString()} />
          <StatCard label="獲得EXP合計" value={stats.exp.toString()} />
        </div>

        <div className="mt-6">
          <div className="mb-2 text-sm font-bold text-gray-300">クイックスタート</div>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_GAMES.map((g) => (
              <button
                key={g.key}
                onClick={() => onStartGame(g.key)}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left active:scale-[0.97] active:border-[var(--color-accent)]"
              >
                <div className="text-2xl">{g.icon}</div>
                <div className="mt-2 text-sm font-bold text-gray-100">{g.label}</div>
                <div className="text-xs text-gray-500">{g.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onNavigate('games')}
          className="mt-6 w-full rounded-xl bg-[var(--color-accent)] py-4 text-base font-extrabold text-black active:scale-[0.98]"
        >
          すべてのゲームを見る →
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`mt-1 text-xl font-extrabold ${highlight ? 'text-[var(--color-accent)]' : 'text-gray-100'}`}>
        {value}
      </div>
    </div>
  );
}
