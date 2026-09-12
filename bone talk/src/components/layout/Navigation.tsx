import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { cn } from '../../lib/constants'
import { useScrollY } from '../../hooks/useScrollProgress'
import { MagneticButton } from '../ui/MagneticButton'
import { ThemeToggle } from '../ui/ThemeToggle'
import { LanguageSelector } from '../ui/LanguageSelector'
import { useLanguage } from '../../context/LanguageContext'
import { SaakanthaLogo } from '../ui/SaakanthaLogo'

export function Navigation() {
  const scrollY = useScrollY()
  const scrolled = scrollY > 40
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useLanguage()

  const navLinks = [
    { label: t.nav.technology, href: '#technology' },
    { label: t.nav.howItWorks, href: '#how-it-works' },
    { label: t.nav.ai, href: '#ai' },
    { label: t.nav.hardware, href: '#hardware' },
    { label: t.nav.worldwide, href: '#worldwide' },
    { label: t.nav.vision, href: '#vision' },
  ]

  // Close mobile navigation on Escape key
  useEffect(() => {
    if (!mobileOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen])

  return (
    <>
      <motion.header
        className="fixed top-0 right-0 left-0 z-50 px-4 sm:px-6 lg:px-10"
        animate={{
          paddingTop: scrolled ? 8 : 16,
          paddingBottom: scrolled ? 8 : 16,
        }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.nav
          className={cn(
            'mx-auto flex max-w-[1440px] items-center justify-between rounded-sm border px-4 py-2.5 transition-[background-color,border-color,backdrop-filter] duration-300 md:px-6 md:py-2.5',
            scrolled
              ? 'border-[color:var(--nav-border-scrolled)] bg-[color:var(--nav-bg-scrolled)] shadow-[var(--shadow-level-1)] backdrop-blur-md'
              : 'border-transparent bg-transparent'
          )}
          aria-label="Main navigation"
        >
          {/* ── LEFT: Logo ── */}
          <div className="flex-shrink-0 flex items-center">
            <a
              href="#"
              className="group flex items-center transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
              aria-label="BoneTalk Homepage"
            >
              <SaakanthaLogo iconSize={30} />
            </a>
          </div>

          {/* ── CENTER: Primary Nav Links (Desktop xl+) ── */}
          <ul className="hidden items-center gap-6 xl:gap-8 xl:flex mx-auto">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-body text-xs tracking-wide text-cream-muted transition-colors duration-200 hover:text-cream whitespace-nowrap"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* ── RIGHT: Controls & CTAs (Desktop xl+) ── */}
          <div className="hidden items-center gap-3 xl:flex flex-shrink-0">
            <LanguageSelector />
            <ThemeToggle />
            <MagneticButton
              href="/experience"
              variant="ghost"
              className="whitespace-nowrap font-mono text-xs tracking-wider uppercase px-3 py-1.5 min-h-[34px]"
            >
              {t.nav.experience}
            </MagneticButton>
            <a
              href="/model-control"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] tracking-wider uppercase px-2.5 py-1.5 rounded-sm border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all duration-200 inline-flex items-center gap-1.5 whitespace-nowrap min-h-[34px]"
              title="Open Separate BoneTalk Model & Hardware Control Console"
            >
              <span>MODEL CONTROL</span>
              <span className="text-[10px] opacity-70">↗</span>
            </a>
          </div>

          {/* ── TABLET / MOBILE Controls (< 1280px / xl) ── */}
          <div className="flex items-center gap-2 xl:hidden">
            <LanguageSelector />
            <ThemeToggle />
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center p-1.5 text-cream rounded-sm border border-border bg-graphite-light/70 hover:border-cyan-signal/40 transition-colors min-h-[36px] min-w-[36px] cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </motion.nav>
      </motion.header>

      {/* ── SLIDE-OVER MOBILE NAVIGATION SIDEBAR ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm flex flex-col bg-graphite/98 border-l border-border p-6 shadow-2xl backdrop-blur-xl overflow-y-auto xl:hidden"
            >
              {/* Header: Logo + Close */}
              <div className="flex items-center justify-between pb-5 border-b border-border">
                <SaakanthaLogo iconSize={28} />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-cream-muted hover:text-cream rounded-sm border border-border bg-graphite-light/60 cursor-pointer"
                  aria-label="Close mobile menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="py-5 border-b border-border">
                <span className="block font-mono text-[10px] tracking-[0.2em] text-cream-muted/60 uppercase mb-3">
                  Navigation
                </span>
                <ul className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="block py-2 text-base font-body text-cream hover:text-cyan-signal transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Preferences */}
              <div className="py-5 border-b border-border flex items-center justify-between">
                <span className="font-mono text-xs text-cream-muted uppercase tracking-wider">
                  Preferences
                </span>
                <div className="flex items-center gap-2">
                  <LanguageSelector />
                  <ThemeToggle />
                </div>
              </div>

              {/* Action CTAs */}
              <div className="pt-6 flex flex-col gap-3 mt-auto">
                <MagneticButton
                  href="/experience"
                  variant="secondary"
                  className="w-full min-h-[44px] justify-center text-xs font-mono uppercase tracking-wider font-semibold"
                  onClick={() => setMobileOpen(false)}
                >
                  {t.nav.experience} →
                </MagneticButton>
                <a
                  href="/model-control"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] flex items-center justify-center font-mono text-xs tracking-wider uppercase px-3 py-2 rounded-sm border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  MODEL CONTROL ↗
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
