import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  introDismissed: boolean;
  dismissIntro: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      introDismissed: false,
      dismissIntro: () => set({ introDismissed: true }),
    }),
    {
      name: "spanish-words-settings",
    }
  )
);
