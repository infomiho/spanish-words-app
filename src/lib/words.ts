import type { VocabularyItem } from "./list";
import { words } from "./list";
import { UNLOCK_THRESHOLD } from "./lessons";

export interface WordStats {
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
  stats: Record<string, WordStats>
): IndexedWord | null {
  if (words.length === 0) return null;

  const wordsWithScore = words.map((word) => {
    const wordStats = stats[word.english];
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
export function getOverallStats(stats: Record<string, WordStats>) {
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

/**
 * Get all words for a specific lesson
 */
export function getWordsForLesson(lessonId: number): IndexedWord[] {
  return words
    .map((w, i) => ({ ...w, index: i }))
    .filter((w) => w.lesson === lessonId);
}

/**
 * Get progress for a specific lesson
 */
export function getLessonProgress(
  lessonId: number,
  stats: Record<string, WordStats>
): { learned: number; learning: number; new: number; percent: number } {
  const lessonWords = getWordsForLesson(lessonId);
  let learned = 0;
  let learning = 0;
  let newWords = 0;

  for (const word of lessonWords) {
    const s = stats[word.english];
    if (!s || s.total === 0) {
      newWords++;
    } else if (s.correct > s.incorrect) {
      learned++;
    } else {
      learning++;
    }
  }

  const percent =
    lessonWords.length > 0
      ? Math.round((learned / lessonWords.length) * 100)
      : 0;
  return { learned, learning, new: newWords, percent };
}

/**
 * Check if a lesson is unlocked based on previous lesson progress
 */
export function isLessonUnlocked(
  lessonId: number,
  stats: Record<string, WordStats>
): boolean {
  if (lessonId === 1) return true;
  const prevProgress = getLessonProgress(lessonId - 1, stats);
  return prevProgress.percent >= UNLOCK_THRESHOLD * 100;
}
