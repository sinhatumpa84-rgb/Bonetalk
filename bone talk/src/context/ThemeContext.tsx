import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'saakantha-theme'
const LEGACY_STORAGE_KEY = 'bonetalk-theme'

/** Safe localStorage reader with exception handling */
function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key)
    }
  } catch {
    // Storage access may be blocked in strict private browsing or if storage quota is exceeded
  }
  return null
}

/** Safe localStorage writer with exception handling */
function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value)
    }
  } catch {
    // Gracefully ignore storage quota / permission errors
  }
}

/**
 * Read the initial theme synchronously.
 * Priority: localStorage → 'light' (never prefers-color-scheme).
 * The inline script in index.html already sets data-theme on <html>
 * before React hydrates, so there is no flash.
 */
function getInitialTheme(): Theme {
  const stored = safeGetItem(STORAGE_KEY) || safeGetItem(LEGACY_STORAGE_KEY)
  if (stored === 'dark') return 'dark'
  return 'light'
}

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  const setTheme = useCallback((next: Theme) => {
    const validTheme: Theme = next === 'dark' ? 'dark' : 'light'
    const root = document.documentElement
    // Apply transition attribute for smooth color transitions
    root.setAttribute('data-theme-transition', '')
    root.setAttribute('data-theme', validTheme)
    safeSetItem(STORAGE_KEY, validTheme)
    setThemeState(validTheme)

    window.setTimeout(() => {
      root.removeAttribute('data-theme-transition')
    }, 320)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [theme, setTheme])

  // Sync data-theme attribute on mount (no-flash: index.html script already
  // set it, this just keeps React state in sync)
  useLayoutEffect(() => {
    const root = document.documentElement
    const attr = root.getAttribute('data-theme')
    root.setAttribute('data-theme', theme)
    if (!attr) {
      safeSetItem(STORAGE_KEY, theme)
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}
