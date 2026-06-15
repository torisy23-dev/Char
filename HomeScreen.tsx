import { useMemo, useState } from 'react';
import CandleChart from '../components/CandleChart';
import ResultPanel from '../components/ResultPanel';
import ScreenHeader from '../components/ScreenHeader';
import { getRandomChartSet } from '../data/chartData';
import type { useGameProgress } from '../hooks/useGameProgress';

const PAST_LENGTH = 100;
const FUTURE_LENGTH = 10;

interface PredictModeProps {
  progress: ReturnType<typeof useGameProgress>;
  onBack: () => void;
}

export default function PredictMode({ progress, onBack }: PredictModeProps) {
  const [chartSet, setChartSet] = useState(() => getRandomChartSet());
  const [answer, setAnswer] = useState<'buy' | 'sell' | null>(null);
  const [showResult, setShowResult] = useState(false);

  const pastCandles = useMemo(() => chartSet.candles.slice(0, PAST_LENGTH), [chartSet]);
  const fullCandles = useMemo(
    () => chartSet.candles.slice(0, PAST_LENGTH + FUTURE_LENGTH),
    [chartSet]
  );

  const visibleCandles = showResult ? fullCandles : pastCandles;

  const correct = useMemo(() => {
    if (!answer) return false;
    const lastPast = pastCandles[pastCandles.length - 1];
    const future = fullCandles[fullCandles.length - 1];
    const went = future.close >= lastPast.close ? 'buy' : 'sell';
    return went === answer;
  }, [answer, pastCandles, fullCandles]);

  const priceDiff = useMemo(() => {
    const lastPast = pastCandles[pastCandles.length - 1];
    const future = fullCandles[fullCandles.length - 1];
    return future.close - lastPast.close;
  }, [pastCandles, fullCandles]);

  function handleAnswer(choice: 'buy' | 'sell') {
    setAnswer(choice);
    setShowResult(true);
    const lastPast = pastCandles[pastCandles.length - 1];
    const future = fullCandles[fullCandles.length - 1];
    const went = future.close >= lastPast.close ? 'buy' : 'sell';
    progress.recordAnswer('predict', went === choice, 10);
  }

  function nextQuestion() {
    setChartSet(getRandomChartSet(chartSet.id));
    setAnswer(null);
    setShowResult(false);
  }

  return (
    <div className="flex min-h-full flex-col bg-[var(--color-bg)] pb-24">
      <ScreenHeader title="チャート予想モード" onBack={onBack} />

      <div className="px-4 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-full bg-[var(--color-surface-alt)] px-3 py-1 text-xs font-bold text-gray-300">
            {chartSet.pair}
          </span>
          <span className="text-xs text-gray-500">10本後の価格は上か下か？</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
          <CandleChart candles={visibleCandles} height={300} />
        </div>

        {!showResult && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAnswer('buy')}
              className="rounded-2xl bg-[var(--color-up)]/15 border-2 border-[var(--color-up)] py-5 text-lg font-extrabold text-[var(--color-up)] active:scale-[0.97]"
            >
              ▲ BUY（上がる）
            </button>
            <button
              onClick={() => handleAnswer('sell')}
              className="rounded-2xl bg-[var(--color-down)]/15 border-2 border-[var(--color-down)] py-5 text-lg font-extrabold text-[var(--color-down)] active:scale-[0.97]"
            >
              ▼ SELL（下がる）
            </button>
          </div>
        )}

        {showResult && (
          <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">あなたの予想</span>
              <span className={`font-bold ${answer === 'buy' ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'}`}>
                {answer === 'buy' ? 'BUY（上がる）' : 'SELL（下がる）'}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-gray-400">実際の値動き</span>
              <span className={`font-bold ${priceDiff >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'}`}>
                {priceDiff >= 0 ? '+' : ''}
                {priceDiff.toFixed(chartSet.pair === 'EURUSD' ? 5 : 3)}
              </span>
            </div>
          </div>
        )}
      </div>

      <ResultPanel
        visible={showResult}
        correct={correct}
        title={correct ? '予想通りの方向に動きました！' : '予想と逆方向に動きました'}
        description={
          correct
            ? '相場の流れを正しく読めています。続けて感覚を磨きましょう。'
            : '結果は確率の一部です。チャート全体の流れ・直近の勢いを振り返ってみましょう。'
        }
        expGain={correct ? 10 : 2}
        onNext={nextQuestion}
      />
    </div>
  );
}
