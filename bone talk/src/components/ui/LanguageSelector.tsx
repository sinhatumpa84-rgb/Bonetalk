import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Search, Check, ChevronDown } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { SUPPORTED_LANGUAGES } from '../../lib/languages'

export function LanguageSelector() {
  const { currentLanguage, setLanguageByCode } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter languages based on search query
  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const indianLanguages = filteredLanguages.filter((l) => l.region === 'india')
  const intlLanguages = filteredLanguages.filter((l) => l.region === 'international')

  return (
    <div ref={containerRef} className="relative z-50">
      {/* Header Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-sm border border-border bg-graphite-light/80 px-2.5 py-1.5 font-mono text-xs text-cream hover:border-cyan-signal/50 hover:text-cyan-signal transition-all cursor-pointer min-h-[36px]"
        aria-label="Select website language"
        aria-expanded={isOpen}
      >
        <Globe size={14} className="text-cyan-signal flex-shrink-0" />
        <span className="font-semibold">{currentLanguage.nativeName}</span>
        <span className="text-[10px] text-cream-muted hidden sm:inline-block">({currentLanguage.name})</span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 w-72 max-h-96 overflow-hidden rounded-sm border border-border bg-graphite/95 p-3 shadow-2xl backdrop-blur-xl border-t-2 border-t-cyan-signal"
          >
            {/* Search Field */}
            <div className="relative mb-3">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-cream-muted" />
              <input
                type="text"
                placeholder="Search language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-sm border border-border bg-graphite-light/70 pl-8 pr-3 py-1.5 font-mono text-xs text-cream placeholder-cream-muted/50 focus:border-cyan-signal focus:outline-none"
                autoFocus
              />
            </div>

            {/* Scrollable Language List */}
            <div className="max-h-72 overflow-y-auto pr-1 space-y-3 font-mono text-xs">
              {/* Indian Languages Section */}
              {indianLanguages.length > 0 && (
                <div>
                  <div className="sticky top-0 bg-graphite/95 py-1 mb-1 border-b border-border/60 text-[9px] font-bold text-cyan-signal uppercase tracking-wider">
                    INDIAN ({indianLanguages.length})
                  </div>
                  <div className="space-y-0.5">
                    {indianLanguages.map((lang) => {
                      const isSelected = currentLanguage.code === lang.code
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            setLanguageByCode(lang.code)
                            setIsOpen(false)
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm transition-colors text-left cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-signal/15 text-cyan-signal font-bold'
                              : 'hover:bg-graphite-light text-cream/90 hover:text-cream'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{lang.name}</span>
                            <span className="text-cream-muted text-[11px]">— {lang.nativeName}</span>
                          </div>
                          {isSelected && <Check size={13} className="text-cyan-signal" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* International Languages Section */}
              {intlLanguages.length > 0 && (
                <div>
                  <div className="sticky top-0 bg-graphite/95 py-1 mb-1 border-b border-border/60 text-[9px] font-bold text-cyan-signal uppercase tracking-wider">
                    INTERNATIONAL ({intlLanguages.length})
                  </div>
                  <div className="space-y-0.5">
                    {intlLanguages.map((lang) => {
                      const isSelected = currentLanguage.code === lang.code
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            setLanguageByCode(lang.code)
                            setIsOpen(false)
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm transition-colors text-left cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-signal/15 text-cyan-signal font-bold'
                              : 'hover:bg-graphite-light text-cream/90 hover:text-cream'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{lang.name}</span>
                            <span className="text-cream-muted text-[11px]">— {lang.nativeName}</span>
                          </div>
                          {isSelected && <Check size={13} className="text-cyan-signal" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {filteredLanguages.length === 0 && (
                <div className="py-6 text-center text-cream-muted text-xs">
                  No matching languages found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
