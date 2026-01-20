import type { VocabularyItem } from "./list";

interface WordStats {
  correct: number;
  incorrect: number;
  total: number;
}

export interface IndexedWord extends VocabularyItem {
  index: number;
}

/**
 * Weighted random selection algorithm.
 * Words with more incorrect answers get higher scores (appear more often).
 * Words never attempted get the highest score (200).
 * Words with 100% success get lowest score (1).
 */
export function getRandomWord(
  words: IndexedWord[],
  stats: Record<number, WordStats>
): IndexedWord | null {
  if (words.length === 0) return null;

  const wordsWithScore = words.map((word) => {
    const wordStats = stats[word.index];
    const score =
      wordStats && wordStats.total > 0
        ? (wordStats.incorrect / wordStats.total) * 100 + 1
        : 200;
    return { word, score };
  });

  // Roulette wheel selection
  const totalScore = wordsWithScore.reduce((total, ws) => total + ws.score, 0);
  const randomScore = Math.random() * totalScore;
  let currentScore = 0;

  for (const wordWithScore of wordsWithScore) {
    currentScore += wordWithScore.score;
    if (currentScore >= randomScore) {
      return wordWithScore.word;
    }
  }

  return words[0];
}

/**
 * Get overall stats summary
 */
export function getOverallStats(stats: Record<number, WordStats>) {
  const entries = Object.values(stats);
  const totalAttempts = entries.reduce((sum, s) => sum + s.total, 0);
  const totalCorrect = entries.reduce((sum, s) => sum + s.correct, 0);
  const wordsPlayed = entries.length;
  const successRate =
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  return {
    totalAttempts,
    totalCorrect,
    wordsPlayed,
    successRate,
  };
}
