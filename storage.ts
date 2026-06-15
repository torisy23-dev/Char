import type { SaveData } from '../types';

const STORAGE_KEY = 'fx-trainer-save-v1';

export const DEFAULT_SAVE: SaveData = {
  stats: {
    totalQuestions: 0,
    totalCorrect: 0,
    currentStreak: 0,
    bestStreak: 0,
    exp: 0,
    level: 1,
  },
  modeStats: {
    predict: { total: 0, correct: 0 },
    entry: { total: 0, bestProfit: 0, winCount: 0 },
    supres: { total: 0, totalScore: 0 },
    trend: { total: 0, correct: 0 },
    pattern: { total: 0, correct: 0 },
  },
  settings: {
    darkMode: true,
    soundEnabled: false,
  },
  version: 1,
};

// Capacitor等のWebView環境でもlocalStorageは利用可能だが、
// 念のため例外処理を行い、失敗時はメモリ上のフォールバックを使う
let memoryFallback: SaveData | null = null;

export function loadSaveData(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_SAVE);
    const parsed = JSON.parse(raw) as SaveData;
    // マージして欠けているフィールドを補完（将来の機能追加に備える）
    return {
      ...structuredClone(DEFAULT_SAVE),
      ...parsed,
      stats: { ...DEFAULT_SAVE.stats, ...parsed.stats },
      modeStats: {
        ...DEFAULT_SAVE.modeStats,
        ...parsed.modeStats,
      },
      settings: { ...DEFAULT_SAVE.settings, ...parsed.settings },
    };
  } catch {
    return memoryFallback ? structuredClone(memoryFallback) : structuredClone(DEFAULT_SAVE);
  }
}

export function saveSaveData(data: SaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    memoryFallback = structuredClone(data);
  }
}

export function resetSaveData(): SaveData {
  const fresh = structuredClone(DEFAULT_SAVE);
  saveSaveData(fresh);
  return fresh;
}
