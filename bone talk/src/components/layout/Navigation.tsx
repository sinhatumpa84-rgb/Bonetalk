import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight } from 'lucide-react'

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-white/80 border-b border-zinc-200/80 backdrop-blur-md transition-all">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10"
        aria-label="Main navigation"
      >
        <a
          href="#"
          className="font-display text-xl font-bold tracking-tight text-zinc-900 flex items-center gap-2"
        >
          <span className="h-3 w-3 rounded-full bg-emerald-600 inline-block" />
          BoneTalk
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          <li>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              How It Works
            </a>
          </li>
          <li>
            <a
              href="#technology"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Technology
            </a>
          </li>
          <li>
            <a
              href="#personalize"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Personalization
            </a>
          </li>
          <li>
            <a
              href="#vision"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Vision
            </a>
          </li>
        </ul>

        <div className="hidden md:block">
          <a
            href="#technology"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-all active:scale-[0.98]"
          >
            Get Started <ArrowRight size={16} />
          </a>
        </div>

        <button
          type="button"
          className="flex items-center justify-center p-2 text-zinc-700 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-zinc-200 bg-white px-6 py-6 md:hidden"
          >
            <ul className="flex flex-col gap-4 mb-6">
              <li>
                <a
                  href="#how-it-works"
                  className="block text-lg font-medium text-zinc-800"
                  onClick={() => setMobileOpen(false)}
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#technology"
                  className="block text-lg font-medium text-zinc-800"
                  onClick={() => setMobileOpen(false)}
                >
                  Technology
                </a>
              </li>
              <li>
                <a
                  href="#personalize"
                  className="block text-lg font-medium text-zinc-800"
                  onClick={() => setMobileOpen(false)}
                >
                  Personalization
                </a>
              </li>
              <li>
                <a
                  href="#vision"
                  className="block text-lg font-medium text-zinc-800"
                  onClick={() => setMobileOpen(false)}
                >
                  Vision
                </a>
              </li>
            </ul>
            <a
              href="#technology"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 text-base font-semibold text-white shadow-sm"
              onClick={() => setMobileOpen(false)}
            >
              Get Started <ArrowRight size={18} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
