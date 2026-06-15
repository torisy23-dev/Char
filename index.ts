// 共通型定義

export interface Candle {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
}

export type Pair = 'USDJPY' | 'EURUSD' | 'GBPJPY';

export interface ChartSet {
  id: string;
  pair: Pair;
  candles: Candle[]; // 全体（過去+未来）
}

export type TrendLabel = 'up' | 'down' | 'range';

export type CandlePatternKey =
  | 'pinbar_bull'
  | 'pinbar_bear'
  | 'engulfing_bull'
  | 'engulfing_bear'
  | 'doji'
  | 'harami_bull'
  | 'harami_bear';

export interface CandlePatternQuestion {
  id: string;
  candles: Candle[]; // 表示する数本（最後が問題対象）
  answer: CandlePatternKey;
}

// ユーザー進捗・統計
export interface UserStats {
  totalQuestions: number;
  totalCorrect: number;
  currentStreak: number;
  bestStreak: number;
  exp: number;
  level: number;
}

export interface GameModeStats {
  predict: { total: number; correct: number };
  entry: { total: number; bestProfit: number; winCount: number };
  supres: { total: number; totalScore: number };
  trend: { total: number; correct: number };
  pattern: { total: number; correct: number };
}

export interface AppSettings {
  darkMode: boolean;
  soundEnabled: boolean;
}

export interface SaveData {
  stats: UserStats;
  modeStats: GameModeStats;
  settings: AppSettings;
  version: number;
}

export const LEVEL_TITLES: { level: number; title: string }[] = [
  { level: 1, title: '初心者トレーダー' },
  { level: 5, title: '見習いトレーダー' },
  { level: 10, title: '専業候補' },
  { level: 15, title: 'ベテラントレーダー' },
  { level: 20, title: 'プロトレーダー' },
];

export function getLevelTitle(level: number): string {
  let title = LEVEL_TITLES[0].title;
  for (const lt of LEVEL_TITLES) {
    if (level >= lt.level) title = lt.title;
  }
  return title;
}

// レベルアップに必要なEXP（累積ではなく次レベルまでの必要量）
export function expForLevel(level: number): number {
  return 50 + (level - 1) * 25;
}
