import type { VocabularyItem } from "./list";
import { words } from "./list";
import { UNLOCK_THRESHOLD, lessons, type Direction } from "./lessons";

export type { Direction } from "./lessons";

export interface WordStats {
  correct: number;
  incorrect: number;
  total: number;
}

export interface IndexedWord extends VocabularyItem {
  index: number;
}

export interface LearnableItem {
  word: IndexedWord;
  direction: Direction;
}

/**
 * Get stat key for a word in a specific direction
 */
export function getStatKey(english: string, direction: Direction): string {
  return `${english}:${direction}`;
}

/**
 * Weighted random selection algorithm.
 * Words with more incorrect answers get higher scores (appear more often).
 * Words never attempted get the highest score (200).
 * Words with 100% success get lowest score (1).
 */
export function getRandomWord(
  items: LearnableItem[],
  stats: Record<string, WordStats>
): LearnableItem | null {
  if (items.length === 0) return null;

  const itemsWithScore = items.map((item) => {
    const statKey = getStatKey(item.word.english, item.direction);
    const wordStats = stats[statKey];
    const score =
      wordStats && wordStats.total > 0
        ? (wordStats.incorrect / wordStats.total) * 100 + 1
        : 200;
    return { item, score };
  });

  // Roulette wheel selection
  const totalScore = itemsWithScore.reduce((total, is) => total + is.score, 0);
  const randomScore = Math.random() * totalScore;
  let currentScore = 0;

  for (const itemWithScore of itemsWithScore) {
    currentScore += itemWithScore.score;
    if (currentScore >= randomScore) {
      return itemWithScore.item;
    }
  }

  return items[0];
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
 * Get all words for a specific vocabulary lesson (1-9)
 */
export function getWordsForLesson(vocabLessonId: number): IndexedWord[] {
  return words
    .map((w, i) => ({ ...w, index: i }))
    .filter((w) => w.lesson === vocabLessonId);
}

/**
 * Get learnable items for a specific lesson (1-18)
 */
export function getLearnableItemsForLesson(lessonId: number): LearnableItem[] {
  const lesson = lessons.find((l) => l.id === lessonId);
  if (!lesson) return [];

  const lessonWords = getWordsForLesson(lesson.vocabLesson);
  return lessonWords.map((word) => ({
    word,
    direction: lesson.direction,
  }));
}

/**
 * Get all learnable items from unlocked lessons for practice mode
 * Only includes items that have been practiced before (have stats)
 */
export function getAllUnlockedItems(
  stats: Record<string, WordStats>
): LearnableItem[] {
  const items: LearnableItem[] = [];

  for (const lesson of lessons) {
    if (isLessonUnlocked(lesson.id, stats)) {
      const lessonItems = getLearnableItemsForLesson(lesson.id);
      // Only include items that have been practiced (have stats with total > 0)
      const practicedItems = lessonItems.filter((item) => {
        const statKey = getStatKey(item.word.english, item.direction);
        const s = stats[statKey];
        return s && s.total > 0;
      });
      items.push(...practicedItems);
    }
  }

  return items;
}

/**
 * Get progress for a specific lesson (1-18)
 */
export function getLessonProgress(
  lessonId: number,
  stats: Record<string, WordStats>
): { learned: number; learning: number; new: number; percent: number } {
  const lesson = lessons.find((l) => l.id === lessonId);
  if (!lesson) {
    return { learned: 0, learning: 0, new: 0, percent: 0 };
  }

  const lessonWords = getWordsForLesson(lesson.vocabLesson);
  let learned = 0;
  let learning = 0;
  let newWords = 0;

  for (const word of lessonWords) {
    const statKey = getStatKey(word.english, lesson.direction);
    const s = stats[statKey];
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
 * - Lessons 1 and 10 are always unlocked
 * - Lessons 2-9: requires 80% of previous ES→EN lesson
 * - Lesson 10: requires 80% of Lesson 9
 * - Lessons 11-18: requires 80% of previous EN→ES lesson
 */
export function isLessonUnlocked(
  lessonId: number,
  stats: Record<string, WordStats>
): boolean {
  // Lesson 1 is always unlocked
  if (lessonId === 1) return true;

  // Lesson 10 (first EN→ES) is unlocked when Lesson 9 is 80% complete
  if (lessonId === 10) {
    const prevProgress = getLessonProgress(9, stats);
    return prevProgress.percent >= UNLOCK_THRESHOLD * 100;
  }

  // Lessons 2-9 and 11-18: requires 80% of previous lesson
  const prevProgress = getLessonProgress(lessonId - 1, stats);
  return prevProgress.percent >= UNLOCK_THRESHOLD * 100;
}
