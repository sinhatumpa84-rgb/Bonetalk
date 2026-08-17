import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'bonetalk-theme'

/**
 * Read the initial theme synchronously.
 * Priority: localStorage → 'light' (never prefers-color-scheme).
 * The inline script in index.html already sets data-theme on <html>
 * before React hydrates, so there is no flash.
 */
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(STORAGE_KEY)
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
    const root = document.documentElement
    // Apply transition attribute for smooth color transitions
    root.setAttribute('data-theme-transition', '')
    root.setAttribute('data-theme', next)
    window.localStorage.setItem(STORAGE_KEY, next)
    setThemeState(next)

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
    // If index.html script set 'dark' and our state says 'light' (or vice
    // versa), reconcile by trusting localStorage (already read in getInitialTheme)
    root.setAttribute('data-theme', theme)
    if (!attr) {
      window.localStorage.setItem(STORAGE_KEY, theme)
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
