import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Globe, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { TechnicalGrid } from '../layout/TechnicalGrid'
import { MultilingualSignalHub } from '../ui/MultilingualSignalHub'
import {
  TOTAL_LANGUAGES_COUNT,
  INDIAN_LANGUAGES_COUNT,
  INTERNATIONAL_LANGUAGES_COUNT,
} from '../../lib/languages'
import { useLanguage } from '../../context/LanguageContext'

export function WorldwideVisionSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { t } = useLanguage()

  return (
    <section
      ref={sectionRef}
      id="worldwide"
      className="relative section-padding border-b border-border overflow-hidden"
      aria-label="BoneTalk Worldwide Vision"
    >
      <TechnicalGrid variant="default" />

      <div className="section-container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="label-editorial mb-3 justify-center font-semibold"
          >
            <Globe size={14} className="text-cyan-signal" />
            {t.worldwide.eyebrow}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="heading-section text-3xl sm:text-5xl md:text-6xl tracking-tight uppercase font-bold"
          >
            {t.worldwide.titleLine1}
            <br />
            <span className="text-cyan-signal">{t.worldwide.titleLine2}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-5 body-editorial max-w-xl mx-auto text-cream-muted"
          >
            {t.worldwide.description}
          </motion.p>
        </div>

        {/* Global Statistics & Progression Bus */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-16 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="surface-panel p-6 text-center border-t-2 border-t-cyan-signal"
          >
            <span className="block font-mono text-[9px] text-cream-muted uppercase tracking-widest mb-1">
              {t.worldwide.totalSupported}
            </span>
            <span className="font-display text-4xl sm:text-5xl font-bold text-cream tabular-nums">
              {TOTAL_LANGUAGES_COUNT}
            </span>
            <span className="block font-mono text-xs text-cyan-signal font-semibold mt-1">
              {t.worldwide.totalLanguages}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="surface-panel p-6 text-center border-t-2 border-t-medical"
          >
            <span className="block font-mono text-[9px] text-cream-muted uppercase tracking-widest mb-1">
              {t.worldwide.indianRegionalStat}
            </span>
            <span className="font-display text-4xl sm:text-5xl font-bold text-cream tabular-nums">
              {INDIAN_LANGUAGES_COUNT}
            </span>
            <span className="block font-mono text-xs text-medical font-semibold mt-1">
              {t.worldwide.indianRegional}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="surface-panel p-6 text-center border-t-2 border-t-cyan-signal"
          >
            <span className="block font-mono text-[9px] text-cream-muted uppercase tracking-widest mb-1">
              {t.worldwide.internationalStat}
            </span>
            <span className="font-display text-4xl sm:text-5xl font-bold text-cream tabular-nums">
              {INTERNATIONAL_LANGUAGES_COUNT}
            </span>
            <span className="block font-mono text-xs text-cyan-signal font-semibold mt-1">
              {t.worldwide.international}
            </span>
          </motion.div>
        </div>

        {/* Progression Chain Indicator */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 font-mono text-[10px] sm:text-xs text-cream-muted mb-16 uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-cream font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-signal" /> {t.worldwide.pLocal}
          </span>
          <ArrowRight size={12} className="text-cyan-signal" />
          <span className="flex items-center gap-1.5 text-cream font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-signal" /> {t.worldwide.pRegional}
          </span>
          <ArrowRight size={12} className="text-cyan-signal" />
          <span className="flex items-center gap-1.5 text-cream font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-signal" /> {t.worldwide.pNational}
          </span>
          <ArrowRight size={12} className="text-cyan-signal" />
          <span className="flex items-center gap-1.5 text-cyan-signal font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-signal animate-ping" /> {t.worldwide.pGlobal}
          </span>
        </div>

        {/* Multilingual Biopotential Telemetry Hub Visual */}
        <MultilingualSignalHub />

        {/* Statement Banner */}
        <div className="surface-panel p-8 sm:p-12 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-signal/10 px-3 py-1 text-cyan-signal text-[10px] font-mono mb-4 uppercase font-bold">
            <Zap size={12} /> <ShieldCheck size={12} /> {t.worldwide.decentralizedTag}
          </div>

          <h3 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-cream uppercase mb-4">
            {t.worldwide.statementTitle}
          </h3>

          <p className="body-editorial text-sm sm:text-base max-w-2xl mx-auto text-cream-muted">
            {t.worldwide.statementBody}
          </p>
        </div>
      </div>
    </section>
  )
}
