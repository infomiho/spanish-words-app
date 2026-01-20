import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WordStats {
  correct: number;
  incorrect: number;
  total: number;
}

interface StatsState {
  stats: Record<number, WordStats>;
  addCorrectAnswer: (wordIndex: number) => void;
  addWrongAnswer: (wordIndex: number) => void;
  resetStats: () => void;
  getStats: (wordIndex: number) => WordStats;
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      stats: {},
      addCorrectAnswer: (wordIndex: number) => {
        set((state) => {
          const current = state.stats[wordIndex] || {
            correct: 0,
            incorrect: 0,
            total: 0,
          };
          return {
            stats: {
              ...state.stats,
              [wordIndex]: {
                correct: current.correct + 1,
                incorrect: current.incorrect,
                total: current.total + 1,
              },
            },
          };
        });
      },
      addWrongAnswer: (wordIndex: number) => {
        set((state) => {
          const current = state.stats[wordIndex] || {
            correct: 0,
            incorrect: 0,
            total: 0,
          };
          return {
            stats: {
              ...state.stats,
              [wordIndex]: {
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
      getStats: (wordIndex: number) => {
        return (
          get().stats[wordIndex] || { correct: 0, incorrect: 0, total: 0 }
        );
      },
    }),
    {
      name: "spanish-words-stats",
    }
  )
);
