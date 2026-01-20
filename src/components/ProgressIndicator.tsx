import { useMemo } from "react";
import type { IndexedWord } from "@/lib/words";

interface WordStats {
  correct: number;
  incorrect: number;
  total: number;
}

type WordCategory = "knew" | "didntKnow" | "notPracticed";

interface ProgressIndicatorProps {
  words: IndexedWord[];
  stats: Record<number, WordStats>;
  currentWordIndex: number | null;
}

export function ProgressIndicator({
  words,
  stats,
  currentWordIndex,
}: ProgressIndicatorProps) {
  const { knew, didntKnow, notPracticed, currentCategory } = useMemo(() => {
    let knew = 0;
    let didntKnow = 0;
    let notPracticed = 0;
    let currentCategory: WordCategory = "notPracticed";

    words.forEach((word) => {
      const wordStats = stats[word.index];
      const isCurrentWord = word.index === currentWordIndex;

      if (!wordStats || wordStats.total === 0) {
        if (isCurrentWord) currentCategory = "notPracticed";
        notPracticed++;
      } else if (wordStats.correct > wordStats.incorrect) {
        if (isCurrentWord) currentCategory = "knew";
        knew++;
      } else {
        if (isCurrentWord) currentCategory = "didntKnow";
        didntKnow++;
      }
    });

    return { knew, didntKnow, notPracticed, currentCategory };
  }, [words, stats, currentWordIndex]);

  const total = words.length;
  if (total === 0) return null;

  // Calculate raw percentages
  const rawKnewPercent = (knew / total) * 100;
  const rawDidntKnowPercent = (didntKnow / total) * 100;
  const rawNotPracticedPercent = (notPracticed / total) * 100;

  // Apply minimum width (3%) for visibility, then normalize to 100%
  const minWidth = 3;
  const knewMin = knew > 0 ? Math.max(rawKnewPercent, minWidth) : 0;
  const didntKnowMin = didntKnow > 0 ? Math.max(rawDidntKnowPercent, minWidth) : 0;
  const notPracticedMin = notPracticed > 0 ? Math.max(rawNotPracticedPercent, minWidth) : 0;

  // Normalize to 100%
  const totalMin = knewMin + didntKnowMin + notPracticedMin;
  const scale = totalMin > 0 ? 100 / totalMin : 1;
  const knewPercent = knewMin * scale;
  const didntKnowPercent = didntKnowMin * scale;
  const notPracticedPercent = notPracticedMin * scale;

  // Calculate indicator position - center of the current word's category
  const indicatorPercent =
    currentCategory === "knew"
      ? knewPercent / 2
      : currentCategory === "didntKnow"
        ? knewPercent + didntKnowPercent / 2
        : knewPercent + didntKnowPercent + notPracticedPercent / 2;

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="relative pt-4">
        {/* Triangle indicator */}
        <div
          className="absolute -top-0 w-0 h-0 -translate-x-1/2 transition-all duration-300 text-gray-400"
          style={{
            left: `${indicatorPercent}%`,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "8px solid currentColor",
          }}
        />

        {/* Progress bar */}
        <div className="flex h-3 rounded-full overflow-hidden bg-muted border border-border">
          {knewPercent > 0 && (
            <div
              className="bg-emerald-500 transition-all duration-300"
              style={{ width: `${knewPercent}%` }}
            />
          )}
          {didntKnowPercent > 0 && (
            <div
              className="bg-amber-500 transition-all duration-300"
              style={{ width: `${didntKnowPercent}%` }}
            />
          )}
          {notPracticedPercent > 0 && (
            <div
              className="bg-gray-300 dark:bg-gray-600 transition-all duration-300"
              style={{ width: `${notPracticedPercent}%` }}
            />
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{knew} knew</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span>{didntKnow} learning</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
          <span>{notPracticed} new</span>
        </div>
      </div>
    </div>
  );
}
