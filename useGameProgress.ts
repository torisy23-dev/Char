import { useCallback, useEffect, useState } from 'react';
import type { GameModeStats, SaveData } from '../types';
import { expForLevel } from '../types';
import { loadSaveData, saveSaveData, resetSaveData } from '../utils/storage';

export interface AnswerResult {
  correct: boolean;
  expGain: number;
}

export function useGameProgress() {
  const [data, setData] = useState<SaveData>(() => loadSaveData());

  useEffect(() => {
    saveSaveData(data);
  }, [data]);

  // 正解/不正解の記録 + EXP付与 + レベルアップ判定
  const recordAnswer = useCallback(
    (mode: keyof GameModeStats, correct: boolean, baseExp: number): AnswerResult => {
      setData((prev) => {
        const next = structuredClone(prev);
        next.stats.totalQuestions += 1;
        if (correct) {
          next.stats.totalCorrect += 1;
          next.stats.currentStreak += 1;
          next.stats.bestStreak = Math.max(next.stats.bestStreak, next.stats.currentStreak);
        } else {
          next.stats.currentStreak = 0;
        }

        const expGain = correct ? baseExp : Math.floor(baseExp * 0.25);
        next.stats.exp += expGain;

        // レベルアップ処理（複数回上がる可能性に対応）
        let needed = expForLevel(next.stats.level);
        while (next.stats.exp >= needed) {
          next.stats.exp -= needed;
          next.stats.level += 1;
          needed = expForLevel(next.stats.level);
        }

        // モード別統計
        switch (mode) {
          case 'predict':
            next.modeStats.predict.total += 1;
            if (correct) next.modeStats.predict.correct += 1;
            break;
          case 'trend':
            next.modeStats.trend.total += 1;
            if (correct) next.modeStats.trend.correct += 1;
            break;
          case 'pattern':
            next.modeStats.pattern.total += 1;
            if (correct) next.modeStats.pattern.correct += 1;
            break;
          default:
            break;
        }

        return next;
      });

      const expGain = correct ? baseExp : Math.floor(baseExp * 0.25);
      return { correct, expGain };
    },
    []
  );

  const recordEntryResult = useCallback((profitPips: number, win: boolean) => {
    setData((prev) => {
      const next = structuredClone(prev);
      next.modeStats.entry.total += 1;
      if (win) next.modeStats.entry.winCount += 1;
      next.modeStats.entry.bestProfit = Math.max(next.modeStats.entry.bestProfit, profitPips);

      // スコアシステムとも連動
      next.stats.totalQuestions += 1;
      if (win) {
        next.stats.totalCorrect += 1;
        next.stats.currentStreak += 1;
        next.stats.bestStreak = Math.max(next.stats.bestStreak, next.stats.currentStreak);
      } else {
        next.stats.currentStreak = 0;
      }
      const expGain = win ? 12 : 3;
      next.stats.exp += expGain;
      let needed = expForLevel(next.stats.level);
      while (next.stats.exp >= needed) {
        next.stats.exp -= needed;
        next.stats.level += 1;
        needed = expForLevel(next.stats.level);
      }
      return next;
    });
  }, []);

  const recordSupResScore = useCallback((score: number) => {
    setData((prev) => {
      const next = structuredClone(prev);
      next.modeStats.supres.total += 1;
      next.modeStats.supres.totalScore += score;

      next.stats.totalQuestions += 1;
      const win = score >= 60;
      if (win) {
        next.stats.totalCorrect += 1;
        next.stats.currentStreak += 1;
        next.stats.bestStreak = Math.max(next.stats.bestStreak, next.stats.currentStreak);
      } else {
        next.stats.currentStreak = 0;
      }
      const expGain = Math.max(2, Math.round(score / 10));
      next.stats.exp += expGain;
      let needed = expForLevel(next.stats.level);
      while (next.stats.exp >= needed) {
        next.stats.exp -= needed;
        next.stats.level += 1;
        needed = expForLevel(next.stats.level);
      }
      return next;
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<SaveData['settings']>) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }));
  }, []);

  const reset = useCallback(() => {
    setData(resetSaveData());
  }, []);

  return {
    data,
    recordAnswer,
    recordEntryResult,
    recordSupResScore,
    updateSettings,
    reset,
  };
}
