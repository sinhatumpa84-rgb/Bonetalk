import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Globe, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { TechnicalGrid } from '../layout/TechnicalGrid'
import {
  TOTAL_LANGUAGES_COUNT,
  INDIAN_LANGUAGES_COUNT,
  INTERNATIONAL_LANGUAGES_COUNT,
} from '../../lib/languages'

const FEATURED_SCRIPTS = [
  { lang: 'English', script: 'English', loc: 'USA / UK' },
  { lang: 'Bengali', script: 'বাংলা', loc: 'India / BD' },
  { lang: 'Hindi', script: 'हिन्दी', loc: 'India' },
  { lang: 'Spanish', script: 'Español', loc: 'Spain / LATAM' },
  { lang: 'French', script: 'Français', loc: 'France' },
  { lang: 'German', script: 'Deutsch', loc: 'Germany' },
  { lang: 'Arabic', script: 'العربية', loc: 'Middle East' },
  { lang: 'Chinese', script: '中文', loc: 'East Asia' },
  { lang: 'Japanese', script: '日本語', loc: 'Japan' },
  { lang: 'Korean', script: '한국어', loc: 'Korea' },
]

export function WorldwideVisionSection() {
  const sectionRef = useRef<HTMLElement>(null)

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
            className="label-editorial mb-3 justify-center"
          >
            <Globe size={14} className="text-cyan-signal" />
            GLOBAL ACCESSIBILITY &amp; IMPACT
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="heading-section text-3xl sm:text-5xl md:text-6xl tracking-tight uppercase"
          >
            BUILT FOR ONE VOICE.
            <br />
            <span className="text-cyan-signal">DESIGNED FOR THE WORLD.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-5 body-editorial max-w-xl mx-auto"
          >
            Communication has no borders. BoneTalk is designed to help people communicate across languages, regions, and cultures — transforming muscle signals into meaningful words and speech wherever they are.
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
              TOTAL SUPPORTED
            </span>
            <span className="font-display text-4xl sm:text-5xl font-bold text-cream tabular-nums">
              {TOTAL_LANGUAGES_COUNT}
            </span>
            <span className="block font-mono text-xs text-cyan-signal font-semibold mt-1">
              Global Languages
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
              INDIAN REGIONAL
            </span>
            <span className="font-display text-4xl sm:text-5xl font-bold text-cream tabular-nums">
              {INDIAN_LANGUAGES_COUNT}
            </span>
            <span className="block font-mono text-xs text-medical font-semibold mt-1">
              Regional Languages
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
              INTERNATIONAL
            </span>
            <span className="font-display text-4xl sm:text-5xl font-bold text-cream tabular-nums">
              {INTERNATIONAL_LANGUAGES_COUNT}
            </span>
            <span className="block font-mono text-xs text-cyan-signal font-semibold mt-1">
              Global Languages
            </span>
          </motion.div>
        </div>

        {/* Progression Chain Indicator */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 font-mono text-[10px] sm:text-xs text-cream-muted mb-16 uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-cream font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-signal" /> LOCAL
          </span>
          <ArrowRight size={12} className="text-cyan-signal" />
          <span className="flex items-center gap-1.5 text-cream font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-signal" /> REGIONAL
          </span>
          <ArrowRight size={12} className="text-cyan-signal" />
          <span className="flex items-center gap-1.5 text-cream font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-signal" /> NATIONAL
          </span>
          <ArrowRight size={12} className="text-cyan-signal" />
          <span className="flex items-center gap-1.5 text-cyan-signal font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-signal animate-ping" /> GLOBAL
          </span>
        </div>

        {/* Lightweight SVG World Map & Signal Hub Visual */}
        <div className="surface-panel p-6 sm:p-10 relative overflow-hidden mb-16">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-6 font-mono text-[9px] text-cream-muted">
            <div className="flex items-center gap-2">
              <span className="status-dot status-dot--pulse" />
              <span className="font-semibold text-cream">WORLDWIDE BIOPOTENTIAL MAP</span>
            </div>
            <span>TRANSLATION LATENCY &lt; 15 MS</span>
          </div>

          <div className="relative aspect-[21/9] min-h-[260px] w-full surface-instrument p-4 flex items-center justify-center overflow-hidden">
            {/* SVG World Map Outline & Signal Paths */}
            <svg viewBox="0 0 1000 450" className="w-full h-full opacity-90" aria-label="BoneTalk Global Network Map">
              <defs>
                <linearGradient id="pathGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-cyan-signal)" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="var(--color-medical)" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Stylized Continents Silhouettes */}
              {/* North America */}
              <path d="M120 100 Q180 80 260 120 Q220 220 160 200 Q100 160 120 100 Z" fill="var(--surface-elevated)" stroke="var(--color-border)" strokeWidth="1" />
              {/* South America */}
              <path d="M240 230 Q300 240 280 340 Q220 380 210 290 Z" fill="var(--surface-elevated)" stroke="var(--color-border)" strokeWidth="1" />
              {/* Europe */}
              <path d="M460 90 Q540 80 560 150 Q480 180 440 130 Z" fill="var(--surface-elevated)" stroke="var(--color-border)" strokeWidth="1" />
              {/* Africa */}
              <path d="M460 180 Q560 190 540 320 Q460 330 440 240 Z" fill="var(--surface-elevated)" stroke="var(--color-border)" strokeWidth="1" />
              {/* Asia */}
              <path d="M580 90 Q820 70 840 200 Q720 260 600 220 Z" fill="var(--surface-elevated)" stroke="var(--color-border)" strokeWidth="1" />
              {/* Australia/Oceania */}
              <path d="M780 290 Q880 280 860 360 Q760 370 780 290 Z" fill="var(--surface-elevated)" stroke="var(--color-border)" strokeWidth="1" />

              {/* Signal Transmission Curved Arcs */}
              <path d="M700 160 Q550 80 480 130" stroke="url(#pathGrad1)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" className="animate-pulse" />
              <path d="M700 160 Q450 140 200 140" stroke="url(#pathGrad1)" strokeWidth="1.5" strokeDasharray="5 3" fill="none" />
              <path d="M480 130 Q350 250 250 290" stroke="url(#pathGrad1)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
              <path d="M700 160 Q780 220 820 320" stroke="url(#pathGrad1)" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />

              {/* Global City Nodes */}
              {/* New Delhi (India Hub) */}
              <g transform="translate(700, 160)">
                <circle cx="0" cy="0" r="8" fill="var(--color-cyan-signal)" opacity="0.3" className="animate-ping" />
                <circle cx="0" cy="0" r="4" fill="var(--color-cyan-signal)" />
                <text x="10" y="4" fill="var(--color-cyan-signal)" fontSize="10" fontWeight="bold" fontFamily="monospace">NEW DELHI [HUB]</text>
              </g>

              {/* London / Europe */}
              <g transform="translate(480, 130)">
                <circle cx="0" cy="0" r="4" fill="var(--color-cream)" />
                <text x="-50" y="-8" fill="var(--color-cream-muted)" fontSize="9" fontFamily="monospace">LONDON</text>
              </g>

              {/* New York / NA */}
              <g transform="translate(220, 140)">
                <circle cx="0" cy="0" r="4" fill="var(--color-cream)" />
                <text x="-60" y="4" fill="var(--color-cream-muted)" fontSize="9" fontFamily="monospace">NEW YORK</text>
              </g>

              {/* Tokyo / East Asia */}
              <g transform="translate(820, 150)">
                <circle cx="0" cy="0" r="4" fill="var(--color-cream)" />
                <text x="10" y="4" fill="var(--color-cream-muted)" fontSize="9" fontFamily="monospace">TOKYO</text>
              </g>

              {/* Sydney */}
              <g transform="translate(820, 320)">
                <circle cx="0" cy="0" r="4" fill="var(--color-cream)" />
                <text x="10" y="4" fill="var(--color-cream-muted)" fontSize="9" fontFamily="monospace">SYDNEY</text>
              </g>

              {/* Sao Paulo */}
              <g transform="translate(260, 300)">
                <circle cx="0" cy="0" r="4" fill="var(--color-cream)" />
                <text x="-70" y="14" fill="var(--color-cream-muted)" fontSize="9" fontFamily="monospace">SÃO PAULO</text>
              </g>
            </svg>
          </div>

          {/* Floating Native Script Chips Row */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 font-mono text-xs">
            {FEATURED_SCRIPTS.map((item) => (
              <div
                key={item.lang}
                className="inline-flex items-center gap-2 rounded-sm border border-border bg-graphite/80 px-3 py-1.5 text-cream"
              >
                <span className="font-bold text-cyan-signal">{item.script}</span>
                <span className="text-[10px] text-cream-muted">({item.lang})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Large Inspiring Statement Banner */}
        <div className="surface-panel p-8 sm:p-12 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-signal/10 px-3 py-1 text-cyan-signal text-[10px] font-mono mb-4 uppercase">
            <Zap size={12} /> <ShieldCheck size={12} /> DECENTRALIZED SPEECH SYNTHESIS
          </div>

          <h3 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-cream uppercase mb-4">
            ONE SIGNAL. MANY LANGUAGES. ONE HUMAN VOICE.
          </h3>

          <p className="body-editorial text-sm sm:text-base max-w-2xl mx-auto text-cream-muted">
            From local communication to global connection, BoneTalk is built to make assistive communication accessible across the world — giving every individual the power to express themselves naturally.
          </p>
        </div>
      </div>
    </section>
  )
}
