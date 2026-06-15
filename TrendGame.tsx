import { useMemo, useState } from 'react';
import CandleChart from '../components/CandleChart';
import ResultPanel from '../components/ResultPanel';
import ScreenHeader from '../components/ScreenHeader';
import { getRandomChartSet } from '../data/chartData';
import type { useGameProgress } from '../hooks/useGameProgress';
import type { Candle, TrendLabel } from '../types';

const PAST_LENGTH = 100;

interface TrendGameProps {
  progress: ReturnType<typeof useGameProgress>;
  onBack: () => void;
}

const LABELS: { key: TrendLabel; label: string; icon: string }[] = [
  { key: 'up', label: '上昇トレンド', icon: '📈' },
  { key: 'down', label: '下降トレンド', icon: '📉' },
  { key: 'range', label: 'レンジ', icon: '↔️' },
];

function judgeTrend(candles: Candle[]): TrendLabel {
  const closes = candles.map((c) => c.close);
  const n = closes.length;
  const xs = Array.from({ length: n }, (_, i) => i);
  const xMean = avg(xs);
  const yMean = avg(closes);

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (closes[i] - yMean);
    den += (xs[i] - xMean) ** 2;
  }
  const slope = num / den;

  const totalRange = Math.max(...closes) - Math.min(...closes);
  const normalizedSlope = (slope * n) / (totalRange || 1);

  if (normalizedSlope > 0.35) return 'up';
  if (normalizedSlope < -0.35) return 'down';
  return 'range';
}

function avg(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export default function TrendGame({ progress, onBack }: TrendGameProps) {
  const [chartSet, setChartSet] = useState(() => getRandomChartSet());
  const [answer, setAnswer] = useState<TrendLabel | null>(null);
  const [showResult, setShowResult] = useState(false);

  const pastCandles = useMemo(() => chartSet.candles.slice(0, PAST_LENGTH), [chartSet]);
  const correctTrend = useMemo(() => judgeTrend(pastCandles), [pastCandles]);

  function handleAnswer(choice: TrendLabel) {
    setAnswer(choice);
    setShowResult(true);
    progress.recordAnswer('trend', choice === correctTrend, 8);
  }

  function nextQuestion() {
    setChartSet(getRandomChartSet(chartSet.id));
    setAnswer(null);
    setShowResult(false);
  }

  const correct = answer === correctTrend;
  const correctLabelObj = LABELS.find((l) => l.key === correctTrend)!;

  return (
    <div className="flex min-h-full flex-col bg-[var(--color-bg)] pb-24">
      <ScreenHeader title="トレンド判定ゲーム" onBack={onBack} />

      <div className="px-4 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-full bg-[var(--color-surface-alt)] px-3 py-1 text-xs font-bold text-gray-300">
            {chartSet.pair}
          </span>
          <span className="text-xs text-gray-500">このチャートのトレンドは？</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
          <CandleChart candles={pastCandles} height={300} />
        </div>

        {!showResult && (
          <div className="mt-4 space-y-3">
            {LABELS.map((item) => (
              <button
                key={item.key}
                onClick={() => handleAnswer(item.key)}
                className="flex w-full items-center gap-3 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] py-4 px-4 text-left text-base font-bold text-gray-200 active:scale-[0.98] active:border-[var(--color-accent)]"
              >
                <span className="text-2xl">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <ResultPanel
        visible={showResult}
        correct={correct}
        title={`正解は「${correctLabelObj.label}」でした`}
        description="移動平均の傾きと値動きの幅から判定しています。実際のチャートでは複数のタイムフレームも確認しましょう。"
        expGain={correct ? 8 : 2}
        onNext={nextQuestion}
      />
    </div>
  );
}
