import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WordCategory } from "@/lib/list";

type Direction = "es-en" | "en-es";

interface SettingsState {
  direction: Direction;
  selectedCategories: WordCategory[];
  introDismissed: boolean;
  setDirection: (direction: Direction) => void;
  toggleCategory: (category: WordCategory) => void;
  setAllCategories: (categories: WordCategory[]) => void;
  dismissIntro: () => void;
}

export const ALL_CATEGORIES: WordCategory[] = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "preposition",
  "conjunction",
  "determiner",
  "article",
  "number",
  "phrase",
];

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      direction: "es-en",
      selectedCategories: ALL_CATEGORIES,
      introDismissed: false,
      setDirection: (direction) => set({ direction }),
      toggleCategory: (category) =>
        set((state) => {
          const isSelected = state.selectedCategories.includes(category);
          if (isSelected) {
            // Don't allow removing all categories
            if (state.selectedCategories.length === 1) {
              return state;
            }
            return {
              selectedCategories: state.selectedCategories.filter(
                (c) => c !== category
              ),
            };
          } else {
            return {
              selectedCategories: [...state.selectedCategories, category],
            };
          }
        }),
      setAllCategories: (categories) =>
        set({ selectedCategories: categories }),
      dismissIntro: () => set({ introDismissed: true }),
    }),
    {
      name: "spanish-words-settings",
    }
  )
);
