import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { NAV_LINKS } from '../../lib/constants'
import { useScrollY } from '../../hooks/useScrollProgress'
import { MagneticButton } from '../ui/MagneticButton'

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
          className="mx-auto flex max-w-[1400px] items-center justify-between rounded-sm border border-transparent px-4 py-3 md:px-6"
          animate={{
            backgroundColor: scrolled ? 'rgba(250, 250, 248, 0.85)' : 'rgba(250, 250, 248, 0)',
            borderColor: scrolled ? 'rgba(0, 0, 0, 0.06)' : 'rgba(0, 0, 0, 0)',
            backdropFilter: scrolled ? 'blur(12px)' : 'blur(0px)',
          }}
          transition={{ duration: 0.4 }}
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

          <div className="hidden lg:block">
            <MagneticButton href="#experience" variant="ghost" dataCursor="OPEN">
              EXPERIENCE BONETALK
            </MagneticButton>
          </div>

          <button
            type="button"
            className="flex items-center justify-center p-2 text-cream lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
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
