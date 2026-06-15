import type { Candle, CandlePatternKey, CandlePatternQuestion } from '../types';

export const PATTERN_INFO: Record<CandlePatternKey, { label: string; description: string }> = {
  pinbar_bull: {
    label: 'ピンバー（買いサイン）',
    description:
      '下に長いヒゲを持つローソク足。一度大きく売られたあと買い戻されたことを示し、下落からの反転（上昇）のサインとされます。',
  },
  pinbar_bear: {
    label: 'ピンバー（売りサイン）',
    description:
      '上に長いヒゲを持つローソク足。一度大きく買われたあと売られたことを示し、上昇からの反転（下落）のサインとされます。',
  },
  engulfing_bull: {
    label: '包み足（買い）',
    description:
      '前のローソク足を完全に包み込む大きな上昇の実体。売りの勢いを買いが圧倒したことを示し、上昇への転換サインとされます。',
  },
  engulfing_bear: {
    label: '包み足（売り）',
    description:
      '前のローソク足を完全に包み込む大きな下降の実体。買いの勢いを売りが圧倒したことを示し、下落への転換サインとされます。',
  },
  doji: {
    label: '十字線（ドジ）',
    description:
      '始値と終値がほぼ同じローソク足。買いと売りの力が均衡している状態を示し、トレンドの転換や迷いを表すことが多いです。',
  },
  harami_bull: {
    label: 'はらみ足（買い）',
    description:
      '大きな下降の実体の中に、小さな上昇の実体が収まる形。下落の勢いが弱まり反転の可能性を示します。',
  },
  harami_bear: {
    label: 'はらみ足（売り）',
    description:
      '大きな上昇の実体の中に、小さな下降の実体が収まる形。上昇の勢いが弱まり反転の可能性を示します。',
  },
};

const PATTERN_OPTIONS: CandlePatternKey[] = [
  'pinbar_bull',
  'pinbar_bear',
  'engulfing_bull',
  'engulfing_bear',
  'doji',
  'harami_bull',
  'harami_bear',
];

const BASE = 150.0;
const PIP = 0.01;

function c(time: number, open: number, high: number, low: number, close: number): Candle {
  return { time, open, high, low, close };
}

// 各パターンを明示的に作る（最後のローソク足が問題対象）
function buildPattern(key: CandlePatternKey, seedOffset: number): Candle[] {
  const t0 = 1700000000 + seedOffset * 3600;
  const prev: Candle = c(t0, BASE, BASE + 10 * PIP, BASE - 5 * PIP, BASE + 6 * PIP);

  switch (key) {
    case 'pinbar_bull': {
      const target = c(t0 + 3600, BASE + 4 * PIP, BASE + 6 * PIP, BASE - 25 * PIP, BASE + 5 * PIP);
      return [prev, target];
    }
    case 'pinbar_bear': {
      const target = c(t0 + 3600, BASE + 6 * PIP, BASE + 26 * PIP, BASE + 4 * PIP, BASE + 5 * PIP);
      return [prev, target];
    }
    case 'engulfing_bull': {
      const p2 = c(t0, BASE + 8 * PIP, BASE + 9 * PIP, BASE - 2 * PIP, BASE);
      const target = c(t0 + 3600, BASE - 1 * PIP, BASE + 13 * PIP, BASE - 2 * PIP, BASE + 11 * PIP);
      return [p2, target];
    }
    case 'engulfing_bear': {
      const p2 = c(t0, BASE - 8 * PIP, BASE + 2 * PIP, BASE - 9 * PIP, BASE);
      const target = c(t0 + 3600, BASE + 1 * PIP, BASE + 2 * PIP, BASE - 12 * PIP, BASE - 11 * PIP);
      return [p2, target];
    }
    case 'doji': {
      const target = c(t0 + 3600, BASE + 5 * PIP, BASE + 15 * PIP, BASE - 10 * PIP, BASE + 5.3 * PIP);
      return [prev, target];
    }
    case 'harami_bull': {
      const p2 = c(t0, BASE + 10 * PIP, BASE + 11 * PIP, BASE - 10 * PIP, BASE - 8 * PIP);
      const target = c(t0 + 3600, BASE - 6 * PIP, BASE + 1 * PIP, BASE - 7 * PIP, BASE - 1 * PIP);
      return [p2, target];
    }
    case 'harami_bear': {
      const p2 = c(t0, BASE - 10 * PIP, BASE + 10 * PIP, BASE - 11 * PIP, BASE + 8 * PIP);
      const target = c(t0 + 3600, BASE + 6 * PIP, BASE + 7 * PIP, BASE - 1 * PIP, BASE + 1 * PIP);
      return [p2, target];
    }
  }
}

export function generatePatternQuestion(index: number): CandlePatternQuestion {
  const key = PATTERN_OPTIONS[index % PATTERN_OPTIONS.length];
  return {
    id: `pattern-${index}`,
    candles: buildPattern(key, index),
    answer: key,
  };
}

export function getPatternChoices(answer: CandlePatternKey, count = 4): CandlePatternKey[] {
  const choices = new Set<CandlePatternKey>([answer]);
  const pool = [...PATTERN_OPTIONS];
  while (choices.size < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    choices.add(pool[idx]);
    pool.splice(idx, 1);
  }
  return shuffle([...choices]);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
