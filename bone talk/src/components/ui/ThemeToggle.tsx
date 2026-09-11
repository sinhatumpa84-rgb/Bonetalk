import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { cn } from '../../lib/constants'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-sm border border-border p-2 text-cream-muted transition-colors duration-200 hover:border-cyan-signal/30 hover:text-cream',
        showLabel && 'px-2.5 py-1.5 font-mono text-[10px] tracking-wide',
        className
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
    >
      {isDark ? (
        <>
          <Sun size={14} strokeWidth={1.75} aria-hidden="true" />
          {showLabel && <span>Light</span>}
        </>
      ) : (
        <>
          <Moon size={14} strokeWidth={1.75} aria-hidden="true" />
          {showLabel && <span>Dark</span>}
        </>
      )}
    </button>
  )
}
