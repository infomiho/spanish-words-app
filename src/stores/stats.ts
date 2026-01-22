import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WordStats {
  correct: number;
  incorrect: number;
  total: number;
}

interface StatsState {
  stats: Record<string, WordStats>;
  migrated: boolean;
  addCorrectAnswer: (wordId: string) => void;
  addWrongAnswer: (wordId: string) => void;
  resetStats: () => void;
  getStats: (wordId: string) => WordStats;
}

/**
 * Migrate old stats (keys without `:`) to new format (keys with `:es-en` suffix)
 */
function migrateStats(
  oldStats: Record<string, WordStats>
): Record<string, WordStats> {
  const newStats: Record<string, WordStats> = {};

  for (const [key, value] of Object.entries(oldStats)) {
    if (key.includes(":")) {
      // Already migrated
      newStats[key] = value;
    } else {
      // Old format - migrate to es-en (user was practicing in default direction)
      newStats[`${key}:es-en`] = value;
    }
  }

  return newStats;
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      stats: {},
      migrated: false,
      addCorrectAnswer: (wordId: string) => {
        set((state) => {
          const current = state.stats[wordId] || {
            correct: 0,
            incorrect: 0,
            total: 0,
          };
          return {
            stats: {
              ...state.stats,
              [wordId]: {
                correct: current.correct + 1,
                incorrect: current.incorrect,
                total: current.total + 1,
              },
            },
          };
        });
      },
      addWrongAnswer: (wordId: string) => {
        set((state) => {
          const current = state.stats[wordId] || {
            correct: 0,
            incorrect: 0,
            total: 0,
          };
          return {
            stats: {
              ...state.stats,
              [wordId]: {
                correct: current.correct,
                incorrect: current.incorrect + 1,
                total: current.total + 1,
              },
            },
          };
        });
      },
      resetStats: () => {
        set({ stats: {}, migrated: true });
      },
      getStats: (wordId: string) => {
        return (
          get().stats[wordId] || { correct: 0, incorrect: 0, total: 0 }
        );
      },
    }),
    {
      name: "spanish-words-stats",
      onRehydrateStorage: () => (state) => {
        // Run migration after rehydration if not already migrated
        if (state && !state.migrated) {
          const migratedStats = migrateStats(state.stats);
          state.stats = migratedStats;
          state.migrated = true;
        }
      },
    }
  )
);
