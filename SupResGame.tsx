import { useMemo, useState } from 'react';
import CandleChart from '../components/CandleChart';
import ScreenHeader from '../components/ScreenHeader';
import { getRandomChartSet } from '../data/chartData';
import type { useGameProgress } from '../hooks/useGameProgress';
import type { Candle, Pair } from '../types';

const PAST_LENGTH = 100;

interface SupResGameProps {
  progress: ReturnType<typeof useGameProgress>;
  onBack: () => void;
}

function pipDivisor(pair: Pair): number {
  return pair === 'EURUSD' ? 0.0001 : 0.01;
}

function computeCorrectLines(candles: Candle[]): { support: number; resistance: number } {
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);

  const recent = candles.slice(-50);
  const recentHighs = recent.map((c) => c.high).sort((a, b) => b - a);
  const recentLows = recent.map((c) => c.low).sort((a, b) => a - b);

  const topN = Math.max(1, Math.floor(recentHighs.length * 0.1));
  const resistance = avg(recentHighs.slice(0, topN));
  const support = avg(recentLows.slice(0, topN));

  const minLow = Math.min(...lows);
  const maxHigh = Math.max(...highs);

  return {
    support: clamp(support, minLow, maxHigh),
    resistance: clamp(resistance, minLow, maxHigh),
  };
}

function avg(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

export default function SupResGame({ progress, onBack }: SupResGameProps) {
  const [chartSet, setChartSet] = useState(() => getRandomChartSet());
  const [step, setStep] = useState<'support' | 'resistance' | 'done'>('support');
  const [supportLine, setSupportLine] = useState<number | null>(null);
  const [resistanceLine, setResistanceLine] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [recorded, setRecorded] = useState(false);

  const pastCandles = useMemo(() => chartSet.candles.slice(0, PAST_LENGTH), [chartSet]);

  const correctLines = useMemo(() => computeCorrectLines(pastCandles), [pastCandles]);

  function handleClick(price: number) {
    if (showResult) return;
    if (step === 'support') {
      setSupportLine(price);
    } else if (step === 'resistance') {
      setResistanceLine(price);
    }
  }

  function nextStep() {
    if (step === 'support') {
      setStep('resistance');
    } else if (step === 'resistance') {
      setStep('done');
      setShowResult(true);
    }
  }

  const score = useMemo(() => {
    if (!showResult || supportLine === null || resistanceLine === null) return null;
    const div = pipDivisor(chartSet.pair);

    const supportDiffPips = Math.abs(supportLine - correctLines.support) / div;
    const resistanceDiffPips = Math.abs(resistanceLine - correctLines.resistance) / div;

    const scoreFromDiff = (diff: number) => {
      const maxAcceptable = 80;
      const s = Math.max(0, 100 - (diff / maxAcceptable) * 100);
      return Math.round(s);
    };

    const supportScore = scoreFromDiff(supportDiffPips);
    const resistanceScore = scoreFromDiff(resistanceDiffPips);
    const total = Math.round((supportScore + resistanceScore) / 2);

    return { supportScore, resistanceScore, total, supportDiffPips, resistanceDiffPips };
  }, [showResult, supportLine, resistanceLine, correctLines, chartSet.pair]);

  if (showResult && score && !recorded) {
    progress.recordSupResScore(score.total);
    setRecorded(true);
  }

  function startNext() {
    setChartSet(getRandomChartSet(chartSet.id));
    setStep('support');
    setSupportLine(null);
    setResistanceLine(null);
    setShowResult(false);
    setRecorded(false);
  }

  const lines = [];
  if (supportLine !== null) lines.push({ price: supportLine, color: '#22c55e', title: 'あなたのサポート' });
  if (resistanceLine !== null) lines.push({ price: resistanceLine, color: '#ef4444', title: 'あなたのレジスタンス' });
  if (showResult) {
    lines.push({ price: correctLines.support, color: '#22c55e80', title: '正解サポート' });
    lines.push({ price: correctLines.resistance, color: '#ef444480', title: '正解レジスタンス' });
  }

  return (
    <div className="flex min-h-full flex-col bg-[var(--color-bg)] pb-24">
      <ScreenHeader title="サポレジ発見ゲーム" onBack={onBack} />

      <div className="px-4 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-full bg-[var(--color-surface-alt)] px-3 py-1 text-xs font-bold text-gray-300">
            {chartSet.pair}
          </span>
          <span className="text-xs text-gray-500">
            {step === 'support' && 'チャートをタップしてサポートライン（支持線）を引く'}
            {step === 'resistance' && 'チャートをタップしてレジスタンスライン（抵抗線）を引く'}
            {step === 'done' && '結果'}
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
          <CandleChart
            candles={pastCandles}
            height={300}
            onPriceClick={showResult ? undefined : (price) => handleClick(price)}
            horizontalLines={lines}
          />
        </div>

        {!showResult && (
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-gray-400">
              {step === 'support' ? (
                <>
                  <span className="font-bold text-[var(--color-up)]">サポートライン</span>
                  ：価格が下がったときに反発しやすい「下値の壁」を予想して、チャートをタップしてください。
                </>
              ) : (
                <>
                  <span className="font-bold text-[var(--color-down)]">レジスタンスライン</span>
                  ：価格が上がったときに跳ね返されやすい「上値の壁」を予想して、チャートをタップしてください。
                </>
              )}
            </div>

            {step === 'support' && supportLine !== null && (
              <div className="text-center text-sm text-gray-300">
                選択中のサポート:{' '}
                <span className="font-bold text-[var(--color-up)]">
                  {supportLine.toFixed(chartSet.pair === 'EURUSD' ? 5 : 3)}
                </span>
              </div>
            )}
            {step === 'resistance' && resistanceLine !== null && (
              <div className="text-center text-sm text-gray-300">
                選択中のレジスタンス:{' '}
                <span className="font-bold text-[var(--color-down)]">
                  {resistanceLine.toFixed(chartSet.pair === 'EURUSD' ? 5 : 3)}
                </span>
              </div>
            )}

            <button
              onClick={nextStep}
              disabled={step === 'support' ? supportLine === null : resistanceLine === null}
              className="w-full rounded-xl bg-[var(--color-accent)] py-3.5 text-base font-bold text-black disabled:opacity-30 active:scale-[0.98]"
            >
              {step === 'support' ? '次：レジスタンスを引く' : '判定する'}
            </button>
          </div>
        )}

        {showResult && score && (
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border-2 border-[var(--color-accent)] bg-[var(--color-accent)]/10 p-5 text-center">
              <div className="text-xs text-gray-400">総合スコア</div>
              <div className="mt-1 text-4xl font-extrabold text-[var(--color-accent)]">{score.total}点</div>
              <div className="text-xs text-gray-500">/ 100点満点</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
                <div className="text-xs text-gray-500">サポート精度</div>
                <div className="mt-1 text-lg font-extrabold text-[var(--color-up)]">{score.supportScore}点</div>
                <div className="text-xs text-gray-500">誤差 {score.supportDiffPips.toFixed(1)} pips</div>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
                <div className="text-xs text-gray-500">レジスタンス精度</div>
                <div className="mt-1 text-lg font-extrabold text-[var(--color-down)]">{score.resistanceScore}点</div>
                <div className="text-xs text-gray-500">誤差 {score.resistanceDiffPips.toFixed(1)} pips</div>
              </div>
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
