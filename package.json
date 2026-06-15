import ScreenHeader from '../components/ScreenHeader';
import type { GameKey } from './HomeScreen';

interface GamesScreenProps {
  onBack: () => void;
  onStartGame: (game: GameKey) => void;
}

const GAMES: { key: GameKey; label: string; icon: string; desc: string; color: string }[] = [
  {
    key: 'predict',
    label: 'チャート予想モード',
    icon: '🔮',
    desc: '過去チャートを見て、10本後に上がるか下がるかを予想します。',
    color: 'var(--color-accent)',
  },
  {
    key: 'entry',
    label: 'エントリーポイント当てゲーム',
    icon: '🎯',
    desc: 'チャートをタップしてエントリー位置を選び、利益・含み損・勝率を判定します。',
    color: 'var(--color-up)',
  },
  {
    key: 'supres',
    label: 'サポレジ発見ゲーム',
    icon: '📏',
    desc: 'サポートライン・レジスタンスラインを引いて、正解との誤差を100点満点で採点します。',
    color: 'var(--color-gold)',
  },
  {
    key: 'trend',
    label: 'トレンド判定ゲーム',
    icon: '📊',
    desc: 'チャートが上昇・下降・レンジのどれかを当てて正解率を記録します。',
    color: 'var(--color-accent-alt)',
  },
  {
    key: 'pattern',
    label: 'ローソク足パターン問題',
    icon: '🕯️',
    desc: 'ピンバー・包み足・十字線・はらみ足などのパターンを解説付きで学びます。',
    color: 'var(--color-down)',
  },
];

export default function GamesScreen({ onBack, onStartGame }: GamesScreenProps) {
  return (
    <div className="min-h-full bg-[var(--color-bg)] pb-24">
      <ScreenHeader title="ゲームを選ぶ" onBack={onBack} />
      <div className="px-4 pt-4">
        <div className="space-y-3">
          {GAMES.map((g) => (
            <button
              key={g.key}
              onClick={() => onStartGame(g.key)}
              className="flex w-full items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left active:scale-[0.98]"
              style={{ borderLeftWidth: 4, borderLeftColor: g.color }}
            >
              <div className="text-3xl">{g.icon}</div>
              <div className="flex-1">
                <div className="text-base font-bold text-gray-100">{g.label}</div>
                <div className="mt-0.5 text-xs leading-relaxed text-gray-500">{g.desc}</div>
              </div>
              <div className="text-gray-500">›</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
