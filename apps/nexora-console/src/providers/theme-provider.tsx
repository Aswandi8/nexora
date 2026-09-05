"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "nexora-theme";

function getInitialTheme(): Theme {
  if (typeof document === "undefined") {
    return "dark";
  }

  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  root.classList.toggle("dark", theme === "dark");

  root.style.colorScheme = theme;

  window.localStorage.setItem(STORAGE_KEY, theme);
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  const setTheme = useCallback((nextTheme: Theme) => {
    applyTheme(nextTheme);
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) => {
      const nextTheme: Theme = currentTheme === "dark" ? "light" : "dark";

      applyTheme(nextTheme);

      return nextTheme;
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
