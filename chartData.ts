import type { Candle, ChartSet, Pair } from '../types';

// シード付き擬似乱数（再現性のため）
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface PairConfig {
  basePrice: number;
  pip: number; // 1pipの価格単位
  volatility: number; // 1本あたりの標準的な値動き(pips換算前の価格単位)
  decimals: number;
}

const PAIR_CONFIG: Record<Pair, PairConfig> = {
  USDJPY: { basePrice: 150.0, pip: 0.01, volatility: 0.045, decimals: 3 },
  EURUSD: { basePrice: 1.085, pip: 0.0001, volatility: 0.00045, decimals: 5 },
  GBPJPY: { basePrice: 190.0, pip: 0.01, volatility: 0.07, decimals: 3 },
};

// トレンドフェーズを生成: 各フェーズはトレンド方向・強さ・長さを持つ
interface Phase {
  length: number;
  drift: number; // 1本あたりの平均変化
  volMultiplier: number; // ボラティリティ倍率（クラスタリング表現）
}

function generatePhases(rand: () => number, totalCandles: number): Phase[] {
  const phases: Phase[] = [];
  let remaining = totalCandles;
  while (remaining > 0) {
    const length = Math.min(remaining, 15 + Math.floor(rand() * 40)); // 15-55本
    const phaseType = rand();
    let drift: number;
    let volMultiplier: number;

    if (phaseType < 0.35) {
      // 上昇トレンド
      drift = 0.15 + rand() * 0.45;
      volMultiplier = 0.8 + rand() * 0.6;
    } else if (phaseType < 0.7) {
      // 下降トレンド
      drift = -(0.15 + rand() * 0.45);
      volMultiplier = 0.8 + rand() * 0.6;
    } else {
      // レンジ（弱いドリフト・低ボラ）
      drift = (rand() - 0.5) * 0.08;
      volMultiplier = 0.4 + rand() * 0.5;
    }

    // ときどき急変動フェーズ（ニュースイベント風）
    if (rand() < 0.08) {
      volMultiplier *= 2.2;
    }

    phases.push({ length, drift, volMultiplier });
    remaining -= length;
  }
  return phases;
}

// 1セット分のローソク足を生成（過去100本+未来30本 = 130本）
export function generateCandleSet(seed: number, pair: Pair, totalCandles = 130): Candle[] {
  const rand = mulberry32(seed);
  const cfg = PAIR_CONFIG[pair];
  const candles: Candle[] = [];

  const phases = generatePhases(rand, totalCandles);

  let price = cfg.basePrice * (1 + (rand() - 0.5) * 0.02); // 開始価格に少しランダム性
  const startTime = Math.floor(Date.now() / 1000) - totalCandles * 3600; // 1時間足想定
  let momentum = 0; // 直近の値動きの慣性（連続性を出す）

  let phaseIdx = 0;
  let phaseRemaining = phases[0]?.length ?? totalCandles;

  for (let i = 0; i < totalCandles; i++) {
    if (phaseRemaining <= 0 && phaseIdx < phases.length - 1) {
      phaseIdx++;
      phaseRemaining = phases[phaseIdx].length;
    }
    phaseRemaining--;
    const phase = phases[phaseIdx];

    const baseVol = cfg.volatility * phase.volMultiplier;

    // ノイズ + ドリフト + 慣性
    const noise = (rand() - 0.5) * 2 * baseVol;
    momentum = momentum * 0.3 + noise * 0.7;
    const change = phase.drift * cfg.pip * 10 + momentum;

    const open = price;
    const close = open + change;

    // ヒゲの生成: ボディに対してランダムな比率で上下に伸びる
    const bodyRange = Math.abs(close - open);
    const wickBase = baseVol * (0.3 + rand() * 0.9);
    const upperWick = wickBase * rand();
    const lowerWick = wickBase * rand();

    const high = Math.max(open, close) + upperWick + bodyRange * 0.05;
    const low = Math.min(open, close) - lowerWick - bodyRange * 0.05;

    candles.push({
      time: startTime + i * 3600,
      open: round(open, cfg.decimals),
      high: round(high, cfg.decimals),
      low: round(low, cfg.decimals),
      close: round(close, cfg.decimals),
    });

    price = close;

    // 価格が極端にずれないよう緩やかに基準値へ引き戻す
    const meanReversion = (cfg.basePrice - price) * 0.0015;
    price += meanReversion;
  }

  return candles;
}

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// 100セット生成 (USDJPY / EURUSD / GBPJPY を均等に)
export function generateAllChartSets(): ChartSet[] {
  const pairs: Pair[] = ['USDJPY', 'EURUSD', 'GBPJPY'];
  const sets: ChartSet[] = [];
  for (let i = 0; i < 100; i++) {
    const pair = pairs[i % pairs.length];
    const seed = 1000 + i * 37;
    sets.push({
      id: `set-${i}`,
      pair,
      candles: generateCandleSet(seed, pair),
    });
  }
  return sets;
}

// メモ化されたデータセット（アプリ起動時に1度だけ生成）
let cachedSets: ChartSet[] | null = null;
export function getChartSets(): ChartSet[] {
  if (!cachedSets) {
    cachedSets = generateAllChartSets();
  }
  return cachedSets;
}

export function getRandomChartSet(excludeId?: string): ChartSet {
  const sets = getChartSets();
  let candidate: ChartSet;
  do {
    candidate = sets[Math.floor(Math.random() * sets.length)];
  } while (sets.length > 1 && candidate.id === excludeId);
  return candidate;
}
