import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { NAV_LINKS, cn } from '../../lib/constants'
import { useScrollY } from '../../hooks/useScrollProgress'
import { MagneticButton } from '../ui/MagneticButton'
import { ThemeToggle } from '../ui/ThemeToggle'

export function Navigation() {
  const scrollY = useScrollY()
  const scrolled = scrollY > 40
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <motion.header
        className="fixed top-0 right-0 left-0 z-50 px-6 md:px-10"
        animate={{
          paddingTop: scrolled ? 12 : 20,
          paddingBottom: scrolled ? 12 : 20,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.nav
          className={cn(
            'mx-auto flex max-w-[1400px] items-center justify-between rounded-sm border px-4 py-3 transition-[background-color,border-color,backdrop-filter] duration-300 md:px-6',
            scrolled
              ? 'border-[color:var(--nav-border-scrolled)] bg-[color:var(--nav-bg-scrolled)] backdrop-blur-md'
              : 'border-transparent bg-transparent'
          )}
          aria-label="Main navigation"
        >
          <a
            href="#"
            className="font-display text-sm font-semibold tracking-[0.35em] text-cream md:text-base"
          >
            BONETALK
          </a>

          <ul className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
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
            <ThemeToggle />
            <MagneticButton href="#experience" variant="ghost">
              EXPERIENCE BONETALK
            </MagneticButton>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="flex items-center justify-center p-2 text-cream"
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col bg-graphite/95 pt-24 backdrop-blur-md lg:hidden"
          >
            <ul className="flex flex-col gap-6 px-8">
              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <a
                    href={link.href}
                    className="font-display text-2xl text-cream"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="mt-10 px-8">
              <MagneticButton
                href="#experience"
                variant="primary"
                onClick={() => setMobileOpen(false)}
              >
                EXPERIENCE BONETALK →
              </MagneticButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
