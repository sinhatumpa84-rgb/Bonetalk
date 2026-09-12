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
        className="fixed top-0 right-0 left-0 z-50 px-4 md:px-10"
        animate={{
          paddingTop: scrolled ? 10 : 16,
          paddingBottom: scrolled ? 10 : 16,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.nav
          className={cn(
            'mx-auto flex max-w-[1400px] items-center justify-between rounded-sm border px-3.5 py-2.5 transition-[background-color,border-color,backdrop-filter] duration-300 md:px-6 md:py-3',
            scrolled
              ? 'border-[color:var(--nav-border-scrolled)] bg-[color:var(--nav-bg-scrolled)] backdrop-blur-md'
              : 'border-transparent bg-transparent'
          )}
          aria-label="Main navigation"
        >
          <a
            href="#"
            className="group flex items-center transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
            aria-label="BoneTalk Homepage"
          >
            <SaakanthaLogo iconSize={32} />
          </a>

          <ul className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-body text-xs tracking-wide text-cream-muted transition-colors duration-200 hover:text-cream"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSelector />
            <ThemeToggle />
            <MagneticButton href="/experience" variant="ghost">
              {t.nav.experience}
            </MagneticButton>
            <a
              href="/model-control"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] tracking-wider uppercase px-2.5 py-1.5 rounded-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors duration-200 inline-flex items-center gap-1"
              title="Open Separate BoneTalk Model & Hardware Control Console"
            >
              <span>MODEL CONTROL</span>
              <span className="text-[10px] opacity-70">↗</span>
            </a>
          </div>

          <div className="flex items-center gap-1.5 lg:hidden">
            <LanguageSelector />
            <ThemeToggle />
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center p-1.5 text-cream min-h-[36px] min-w-[36px]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </motion.nav>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 flex flex-col bg-graphite/98 pt-24 px-6 backdrop-blur-lg overflow-y-auto lg:hidden"
          >
            <ul className="flex flex-col gap-4">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <a
                    href={link.href}
                    className="block py-2 font-display text-xl sm:text-2xl text-cream tracking-wide hover:text-cyan-signal transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="mt-8 pb-12 flex flex-col gap-3">

              <MagneticButton
                href="/experience"
                variant="secondary"
                className="w-full min-h-[48px] justify-center"
                onClick={() => setMobileOpen(false)}
              >
                {t.nav.experience} →
              </MagneticButton>
              <a
                href="/model-control"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] flex items-center justify-center font-mono text-xs tracking-wider uppercase px-3 py-2 rounded-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-center"
                onClick={() => setMobileOpen(false)}
              >
                MODEL CONTROL ↗
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
