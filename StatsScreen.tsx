import LevelBadge from '../components/LevelBadge';
import ScreenHeader from '../components/ScreenHeader';
import type { useGameProgress } from '../hooks/useGameProgress';

interface StatsScreenProps {
  progress: ReturnType<typeof useGameProgress>;
}

function Metric({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-surface rounded-xl p-3 flex flex-col gap-1 border border-border">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-xl font-bold ${color ?? 'text-white'}`}>{value}</span>
    </div>
  );
}

function ModeRow({
  icon,
  label,
  value,
  sub,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center justify-between bg-surface rounded-xl p-3 border border-border">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex flex-col">
          <span className="text-sm text-gray-200">{label}</span>
          {sub && <span className="text-xs text-gray-500">{sub}</span>}
        </div>
      </div>
      <span className="text-lg font-bold text-accent">{value}</span>
    </div>
  );
}

import { useState } from 'react';

export default function StatsScreen({ progress }: StatsScreenProps) {
  const { data } = progress;
  const { stats, modeStats, settings } = data;

  const [confirmReset, setConfirmReset] = useState(false);

  const winRate =
    stats.totalQuestions > 0
      ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
      : 0;

  const rate = (correct: number, total: number) =>
    total > 0 ? `${Math.round((correct / total) * 100)}%` : '-';

  const handleResetClick = () => {
    if (confirmReset) {
      progress.reset();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  return (
    <div className="min-h-full bg-[var(--color-bg)] pb-24">
      <ScreenHeader title="記録・統計" />
      <div className="flex flex-col gap-4 p-4">
      <LevelBadge stats={stats} />

      <div className="grid grid-cols-2 gap-3">
        <Metric label="総問題数" value={`${stats.totalQuestions}`} />
        <Metric label="正解率" value={`${winRate}%`} color="text-up" />
        <Metric label="現在の連勝" value={`${stats.currentStreak}`} color="text-accent" />
        <Metric label="最高連勝" value={`${stats.bestStreak}`} color="text-gold" />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-gray-300 mt-2">モード別成績</h2>

        <ModeRow
          icon="🔮"
          label="チャート予想"
          value={rate(modeStats.predict.correct, modeStats.predict.total)}
          sub={`${modeStats.predict.total}問`}
        />
        <ModeRow
          icon="🎯"
          label="エントリーゲーム"
          value={rate(modeStats.entry.winCount, modeStats.entry.total)}
          sub={`最高利益 ${modeStats.entry.bestProfit.toFixed(1)} pips`}
        />
        <ModeRow
          icon="📏"
          label="サポレジ発見"
          value={
            modeStats.supres.total > 0
              ? `${Math.round(modeStats.supres.totalScore / modeStats.supres.total)}点`
              : '-'
          }
          sub={`${modeStats.supres.total}回プレイ`}
        />
        <ModeRow
          icon="📊"
          label="トレンド判定"
          value={rate(modeStats.trend.correct, modeStats.trend.total)}
          sub={`${modeStats.trend.total}問`}
        />
        <ModeRow
          icon="🕯️"
          label="ローソク足パターン"
          value={rate(modeStats.pattern.correct, modeStats.pattern.total)}
          sub={`${modeStats.pattern.total}問`}
        />
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <h2 className="text-sm font-semibold text-gray-300">データ管理</h2>
        <button
          onClick={handleResetClick}
          className={`min-h-[44px] rounded-xl border font-semibold transition-colors ${
            confirmReset
              ? 'bg-down/20 border-down text-down'
              : 'bg-surface border-border text-gray-300'
          }`}
        >
          {confirmReset ? 'もう一度タップでリセット確定' : '進捗をリセット'}
        </button>
      </div>

      <div className="flex flex-col gap-1 mt-4 text-center text-xs text-gray-500">
        <span>ダークモード: {settings.darkMode ? 'ON' : 'OFF'}</span>
        <span>FX Chart Trainer v1.0.0</span>
      </div>
      </div>
    </div>
  );
}
