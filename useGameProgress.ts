import { useMemo, useState } from 'react';
import CandleChart from '../components/CandleChart';
import ResultPanel from '../components/ResultPanel';
import ScreenHeader from '../components/ScreenHeader';
import { generatePatternQuestion, getPatternChoices, PATTERN_INFO } from '../data/patternData';
import type { useGameProgress } from '../hooks/useGameProgress';
import type { CandlePatternKey } from '../types';

interface PatternQuizProps {
  progress: ReturnType<typeof useGameProgress>;
  onBack: () => void;
}

export default function PatternQuiz({ progress, onBack }: PatternQuizProps) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * 1000));
  const [answer, setAnswer] = useState<CandlePatternKey | null>(null);
  const [showResult, setShowResult] = useState(false);

  const question = useMemo(() => generatePatternQuestion(index), [index]);
  const choices = useMemo(() => getPatternChoices(question.answer), [question]);

  function handleAnswer(choice: CandlePatternKey) {
    setAnswer(choice);
    setShowResult(true);
    progress.recordAnswer('pattern', choice === question.answer, 8);
  }

  function nextQuestion() {
    setIndex((prev) => prev + 1 + Math.floor(Math.random() * 5));
    setAnswer(null);
    setShowResult(false);
  }

  const correct = answer === question.answer;
  const info = PATTERN_INFO[question.answer];

  return (
    <div className="flex min-h-full flex-col bg-[var(--color-bg)] pb-24">
      <ScreenHeader title="ローソク足パターン問題" onBack={onBack} />

      <div className="px-4 pt-4">
        <div className="mb-2 text-center text-sm font-medium text-gray-300">
          この最後のローソク足は何のパターン？
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
          <CandleChart candles={question.candles} height={260} />
        </div>

        {!showResult && (
          <div className="mt-4 grid grid-cols-1 gap-3">
            {choices.map((choice) => (
              <button
                key={choice}
                onClick={() => handleAnswer(choice)}
                className="w-full rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] py-4 px-4 text-left text-base font-bold text-gray-200 active:scale-[0.98] active:border-[var(--color-accent)]"
              >
                {PATTERN_INFO[choice].label}
              </button>
            ))}
          </div>
        )}
      </div>

      <ResultPanel
        visible={showResult}
        correct={correct}
        title={`正解は「${info.label}」`}
        description={info.description}
        expGain={correct ? 8 : 2}
        onNext={nextQuestion}
      />
    </div>
  );
}
