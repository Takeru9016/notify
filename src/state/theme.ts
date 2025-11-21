import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark" | "system";
export type ColorScheme = "coral" | "rose" | "plum" | "lavender";

interface ThemeState {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  setMode: (mode: ThemeMode) => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "system",
      colorScheme: "plum", // default

      setMode: (mode: ThemeMode) => {
        console.log("🎨 [ThemeStore] Setting theme mode:", mode);
        set({ mode });
      },

      setColorScheme: (colorScheme: ColorScheme) => {
        console.log("🎨 [ThemeStore] Setting color scheme:", colorScheme);
        set({ colorScheme });
      },
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
