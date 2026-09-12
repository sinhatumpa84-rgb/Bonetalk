import { useState, useEffect } from 'react'
import { ThemeToggle } from '../ui/ThemeToggle'

interface ExperienceNavigationProps {
  onNavigateHome: () => void
}

export function ExperienceNavigation({ onNavigateHome }: ExperienceNavigationProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'var(--nav-bg-scrolled)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--nav-border-scrolled)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
    >
      <div className="mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="label-technical hover:opacity-70 transition-opacity cursor-pointer"
          style={{ color: 'var(--color-cyan-signal)' }}
        >
          ← BoneTalk
        </button>
        <div className="flex items-center gap-4">
          <div className="label-technical" style={{ color: 'var(--color-cyan-signal)' }}>
            EXHIBITION
          </div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
