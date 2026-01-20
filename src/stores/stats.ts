import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WordStats {
  correct: number;
  incorrect: number;
  total: number;
}

interface StatsState {
  stats: Record<string, WordStats>;
  addCorrectAnswer: (wordId: string) => void;
  addWrongAnswer: (wordId: string) => void;
  resetStats: () => void;
  getStats: (wordId: string) => WordStats;
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      stats: {},
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
        set({ stats: {} });
      },
      getStats: (wordId: string) => {
        return (
          get().stats[wordId] || { correct: 0, incorrect: 0, total: 0 }
        );
      },
    }),
    {
      name: "spanish-words-stats",
    }
  )
);
