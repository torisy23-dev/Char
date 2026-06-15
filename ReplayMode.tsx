import { useMemo, useState } from 'react';
import CandleChart from '../components/CandleChart';
import ScreenHeader from '../components/ScreenHeader';
import { getRandomChartSet } from '../data/chartData';
import type { useGameProgress } from '../hooks/useGameProgress';
import type { Pair } from '../types';

const PAST_LENGTH = 100;
const FUTURE_LENGTH = 30;

interface EntryGameProps {
  progress: ReturnType<typeof useGameProgress>;
  onBack: () => void;
}

function pipDivisor(pair: Pair): number {
  return pair === 'EURUSD' ? 0.0001 : 0.01;
}

export default function EntryGame({ progress, onBack }: EntryGameProps) {
  const [chartSet, setChartSet] = useState(() => getRandomChartSet());
  const [entryTime, setEntryTime] = useState<number | null>(null);
  const [entryPrice, setEntryPrice] = useState<number | null>(null);
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy');
  const [showResult, setShowResult] = useState(false);
  const [recorded, setRecorded] = useState(false);

  const pastCandles = useMemo(() => chartSet.candles.slice(0, PAST_LENGTH), [chartSet]);
  const fullCandles = useMemo(
    () => chartSet.candles.slice(0, PAST_LENGTH + FUTURE_LENGTH),
    [chartSet]
  );

  const visibleCandles = showResult ? fullCandles : pastCandles;

  function handlePriceClick(price: number, time: number) {
    if (showResult) return;
    const nearest = pastCandles.reduce((prev, cur) =>
      Math.abs(cur.time - time) < Math.abs(prev.time - time) ? cur : prev
    );
    setEntryTime(nearest.time);
    setEntryPrice(price);
  }

  const evaluation = useMemo(() => {
    if (entryTime === null || entryPrice === null) return null;
    const entryIdx = fullCandles.findIndex((c) => c.time === entryTime);
    if (entryIdx === -1) return null;

    const future = fullCandles.slice(entryIdx + 1);
    if (future.length === 0) return null;

    const div = pipDivisor(chartSet.pair);
    let maxProfit = -Infinity;
    let maxDrawdown = Infinity;

    future.forEach((c) => {
      const highDiff = direction === 'buy' ? c.high - entryPrice : entryPrice - c.low;
      const lowDiff = direction === 'buy' ? c.low - entryPrice : entryPrice - c.high;
      maxProfit = Math.max(maxProfit, highDiff);
      maxDrawdown = Math.min(maxDrawdown, lowDiff);
    });

    const finalDiff =
      direction === 'buy'
        ? future[future.length - 1].close - entryPrice
        : entryPrice - future[future.length - 1].close;

    const maxProfitPips = maxProfit / div;
    const maxDrawdownPips = maxDrawdown / div;
    const finalPips = finalDiff / div;
    const win = finalPips > 0;

    return { maxProfitPips, maxDrawdownPips, finalPips, win };
  }, [entryTime, entryPrice, direction, fullCandles, chartSet.pair]);

  function confirmEntry() {
    if (entryPrice === null) return;
    setShowResult(true);
  }

  // 結果表示時に一度だけスコアを記録
  if (showResult && evaluation && !recorded) {
    progress.recordEntryResult(evaluation.maxProfitPips, evaluation.win);
    setRecorded(true);
  }

  function startNext() {
    setChartSet(getRandomChartSet(chartSet.id));
    setEntryTime(null);
    setEntryPrice(null);
    setShowResult(false);
    setRecorded(false);
  }

  return (
    <div className="flex min-h-full flex-col bg-[var(--color-bg)] pb-24">
      <ScreenHeader title="エントリーポイント当てゲーム" onBack={onBack} />

      <div className="px-4 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-full bg-[var(--color-surface-alt)] px-3 py-1 text-xs font-bold text-gray-300">
            {chartSet.pair}
          </span>
          <span className="text-xs text-gray-500">
            {showResult ? '結果：30本後までの動き' : 'チャートをタップしてエントリー位置を選択'}
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
          <CandleChart
            candles={visibleCandles}
            height={300}
            onPriceClick={showResult ? undefined : handlePriceClick}
            markerTime={entryTime ?? undefined}
            markerColor={direction === 'buy' ? '#22c55e' : '#ef4444'}
          />
        </div>

        {!showResult && (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => setDirection('buy')}
                className={`rounded-2xl border-2 py-3 text-sm font-extrabold active:scale-[0.97] ${
                  direction === 'buy'
                    ? 'border-[var(--color-up)] bg-[var(--color-up)]/15 text-[var(--color-up)]'
                    : 'border-[var(--color-border)] text-gray-500'
                }`}
              >
                ▲ BUYでエントリー
              </button>
              <button
                onClick={() => setDirection('sell')}
                className={`rounded-2xl border-2 py-3 text-sm font-extrabold active:scale-[0.97] ${
                  direction === 'sell'
                    ? 'border-[var(--color-down)] bg-[var(--color-down)]/15 text-[var(--color-down)]'
                    : 'border-[var(--color-border)] text-gray-500'
                }`}
              >
                ▼ SELLでエントリー
              </button>
            </div>

            {entryPrice !== null && (
              <div className="mt-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-gray-300">
                選択した価格:{' '}
                <span className="font-bold text-[var(--color-accent)]">
                  {entryPrice.toFixed(chartSet.pair === 'EURUSD' ? 5 : 3)}
                </span>
              </div>
            )}

            <button
              onClick={confirmEntry}
              disabled={entryPrice === null}
              className="mt-4 w-full rounded-xl bg-[var(--color-accent)] py-3.5 text-base font-bold text-black disabled:opacity-30 active:scale-[0.98]"
            >
              このポイントでエントリー確定
            </button>
          </>
        )}

        {showResult && evaluation && (
          <div className="mt-4 space-y-3">
            <div
              className={`rounded-2xl border-2 p-4 text-center ${
                evaluation.win
                  ? 'border-[var(--color-up)] bg-[var(--color-up)]/10'
                  : 'border-[var(--color-down)] bg-[var(--color-down)]/10'
              }`}
            >
              <div className={`text-2xl font-extrabold ${evaluation.win ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'}`}>
                {evaluation.win ? '勝ち（プラス）' : '負け（マイナス）'}
              </div>
              <div className="mt-1 text-sm text-gray-400">
                最終損益: {evaluation.finalPips >= 0 ? '+' : ''}
                {evaluation.finalPips.toFixed(1)} pips
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
                <div className="text-xs text-gray-500">最高利益</div>
                <div className="mt-1 text-lg font-extrabold text-[var(--color-up)]">
                  +{evaluation.maxProfitPips.toFixed(1)} pips
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
                <div className="text-xs text-gray-500">最大含み損</div>
                <div className="mt-1 text-lg font-extrabold text-[var(--color-down)]">
                  {evaluation.maxDrawdownPips.toFixed(1)} pips
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-gray-400">
              {evaluation.win
                ? 'エントリー後に有利な方向へ動きました。利確・損切りのタイミングも意識してみましょう。'
                : 'エントリー後に不利な方向へ動きました。エントリー直前のトレンドや反発ポイントを振り返ってみましょう。'}
            </div>

            <button
              onClick={startNext}
              className="w-full rounded-xl bg-[var(--color-accent)] py-3.5 text-base font-bold text-black active:scale-[0.98]"
            >
              次の問題へ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
