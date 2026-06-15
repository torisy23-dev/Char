import { useEffect, useRef, useState } from 'react';
import CandleChart from '../components/CandleChart';
import ScreenHeader from '../components/ScreenHeader';
import { getRandomChartSet } from '../data/chartData';

const TOTAL_LENGTH = 130;
const INITIAL_VISIBLE = 30;

interface ReplayModeProps {
  onBack: () => void;
}

export default function ReplayMode({ onBack }: ReplayModeProps) {
  const [chartSet, setChartSet] = useState(() => getRandomChartSet());
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const allCandles = chartSet.candles.slice(0, TOTAL_LENGTH);
  const visibleCandles = allCandles.slice(0, visibleCount);

  useEffect(() => {
    if (playing) {
      const interval = speed === 1 ? 700 : 250;
      intervalRef.current = setInterval(() => {
        setVisibleCount((prev) => {
          if (prev >= allCandles.length) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, interval);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, speed, allCandles.length]);

  function stepForward() {
    setPlaying(false);
    setVisibleCount((prev) => Math.min(prev + 1, allCandles.length));
  }

  function reset() {
    setPlaying(false);
    setVisibleCount(INITIAL_VISIBLE);
  }

  function newChart() {
    setPlaying(false);
    setChartSet(getRandomChartSet(chartSet.id));
    setVisibleCount(INITIAL_VISIBLE);
  }

  const isFinished = visibleCount >= allCandles.length;

  return (
    <div className="flex min-h-full flex-col bg-[var(--color-bg)] pb-24">
      <ScreenHeader title="リプレイモード" onBack={onBack} />

      <div className="px-4 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-full bg-[var(--color-surface-alt)] px-3 py-1 text-xs font-bold text-gray-300">
            {chartSet.pair}
          </span>
          <span className="text-xs text-gray-500">
            {visibleCount} / {allCandles.length} 本
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
          <CandleChart candles={visibleCandles} height={320} />
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-lg text-gray-300 active:scale-95"
            aria-label="リセット"
          >
            ⏮
          </button>
          <button
            onClick={() => setPlaying((p) => !p)}
            disabled={isFinished}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent)] text-2xl text-black disabled:opacity-30 active:scale-95"
            aria-label={playing ? '一時停止' : '再生'}
          >
            {playing ? '⏸' : '▶'}
          </button>
          <button
            onClick={stepForward}
            disabled={isFinished}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-lg text-gray-300 disabled:opacity-30 active:scale-95"
            aria-label="1本進める"
          >
            ⏩
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setSpeed(1)}
            className={`rounded-full px-4 py-2 text-xs font-bold ${
              speed === 1 ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface-alt)] text-gray-400'
            }`}
          >
            通常速度
          </button>
          <button
            onClick={() => setSpeed(2)}
            className={`rounded-full px-4 py-2 text-xs font-bold ${
              speed === 2 ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface-alt)] text-gray-400'
            }`}
          >
            倍速
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-gray-400">
          1本ずつローソク足を進めながら、次の値動きを予想してみましょう。未来を見ずに「今ならどう判断するか」を考える練習に最適です。
        </div>

        <button
          onClick={newChart}
          className="mt-4 w-full rounded-xl border-2 border-[var(--color-accent)] py-3.5 text-base font-bold text-[var(--color-accent)] active:scale-[0.98]"
        >
          別のチャートで練習する
        </button>
      </div>
    </div>
  );
}
