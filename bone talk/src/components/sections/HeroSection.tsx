import { Suspense, lazy, useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowRight, Cpu, Activity, Zap, Radio, Volume2 } from 'lucide-react'
import { SplitLines } from '../ui/SplitText'
import { MagneticButton } from '../ui/MagneticButton'
import { TechnicalGrid } from '../layout/TechnicalGrid'

import { useScrollProgress } from '../../hooks/useScrollProgress'
import { useReducedMotion, useIsMobile } from '../../hooks/useMediaQuery'
import { EMGWaveform } from '../ui/EMGWaveform'
import { HeroErrorBoundary } from '../three/HeroErrorBoundary'
import { useLanguage } from '../../context/LanguageContext'
import { SCROLL_EXIT, SCROLL_EXIT_MOBILE } from '../../lib/motion'

const HeroScene = lazy(() =>
  import('../three/HeroScene').then((m) => ({ default: m.HeroScene }))
)

function HeroFallback() {
  const { t } = useLanguage()
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-transparent">
      <div className="relative aspect-square w-full max-w-[420px] p-4">
        <div className="absolute inset-0 rounded-full bg-cyan-signal/10 blur-3xl" />

        <svg viewBox="0 0 400 400" className="h-full w-full" aria-label="BoneTalk Neck Wearable Diagram">
          <defs>
            <radialGradient id="neckGlow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="var(--color-cyan-signal)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--color-graphite)" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="collarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--skin-tone-start)" />
              <stop offset="100%" stopColor="var(--skin-tone-end)" />
            </linearGradient>
          </defs>

          <circle cx="200" cy="200" r="170" fill="url(#neckGlow)" stroke="var(--grid-line)" strokeWidth="1" />
          <circle cx="200" cy="200" r="130" fill="none" stroke="var(--signal-ring)" strokeDasharray="3 3" />

          <path
            d="M130 90 Q200 70 270 90 L280 240 Q200 270 120 240 Z"
            fill="var(--surface-elevated)"
            stroke="var(--stroke-muted)"
            strokeWidth="1"
          />
          <path
            d="M80 340 Q130 240 180 240 L220 240 Q270 240 320 340 Z"
            fill="var(--surface-base)"
          />

          <path
            d="M110 180 C 110 240, 290 240, 290 180"
            fill="none"
            stroke="url(#collarGrad)"
            strokeWidth="24"
            strokeLinecap="round"
          />
          <path
            d="M110 180 C 110 240, 290 240, 290 180"
            fill="none"
            stroke="var(--color-cyan-signal)"
            strokeWidth="1.5"
            strokeOpacity="0.4"
            strokeDasharray="6 4"
          />

          <g transform="translate(145, 205)">
            <rect x="0" y="0" width="110" height="50" rx="8" fill="var(--surface-elevated)" stroke="var(--color-cyan-signal)" strokeWidth="1.5" />
            <rect x="8" y="8" width="94" height="34" rx="4" fill="var(--surface-base)" />
            <circle cx="55" cy="25" r="10" fill="none" stroke="var(--color-cyan-signal)" strokeWidth="2" />
            <circle cx="55" cy="25" r="4" fill="var(--color-cyan-signal)" className="animate-pulse" />
            <circle cx="24" cy="25" r="6" fill="#D97706" />
            <circle cx="86" cy="25" r="6" fill="#D97706" />
          </g>

          <path
            d="M120 160 Q 200 130 280 160"
            fill="none"
            stroke="var(--color-cyan-signal)"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
        </svg>

        <div className="absolute bottom-4 left-1/2 w-full max-w-[280px] -translate-x-1/2 rounded-sm border border-border/80 bg-graphite-light/70 p-3 backdrop-blur-md">
          <div className="mb-1.5 flex items-center justify-between font-mono text-[9px]">
            <span className="text-cyan-signal font-semibold">{t.hero.annotations.emgLabel} NECK TELEMETRY</span>
            <span className="text-cream-muted/70">1000 Hz</span>
          </div>
          <EMGWaveform width={250} height={50} intensity={0.9} className="w-full opacity-90" showGrid={false} />
        </div>
      </div>
    </div>
  )
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const progress = useScrollProgress(sectionRef)
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const intensity = 0.5 + progress * 0.5
  const { t } = useLanguage()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const exit = isMobile ? SCROLL_EXIT_MOBILE : SCROLL_EXIT
  const textY = useTransform(scrollYProgress, [0, 1], [...exit.textY].reverse() as [number, number])
  const deviceScale = useTransform(scrollYProgress, [0, 1], [...exit.deviceScale].reverse() as [number, number])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.65, 1], [1, 0.75, exit.heroOpacity[0]])


  const [initSequence, setInitSequence] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setInitSequence((prev) => (prev < 3 ? prev + 1 : prev))
    }, 450)
    return () => clearInterval(timer)
  }, [])

  const technicalAnnotations = [
    {
      id: 'emg',
      label: t.hero.annotations.emgLabel,
      sub: t.hero.annotations.emgSub,
      icon: Activity,
      className: 'top-3 left-1 sm:top-6 sm:left-2 md:top-10 md:-left-6',
    },
    {
      id: 'ai',
      label: t.hero.annotations.aiLabel,
      sub: t.hero.annotations.aiSub,
      icon: Radio,
      className: 'top-4 right-1 sm:top-8 sm:right-2 md:top-16 md:-right-6',
    },
    {
      id: 'signal',
      label: t.hero.annotations.signalLabel,
      sub: t.hero.annotations.signalSub,
      icon: Zap,
      className: 'bottom-16 left-1 sm:bottom-20 sm:left-2 md:bottom-28 md:-left-8',
    },
    {
      id: 'voice',
      label: t.hero.annotations.voiceLabel,
      sub: t.hero.annotations.voiceSub,
      icon: Volume2,
      className: 'bottom-14 right-1 sm:bottom-18 sm:right-2 md:bottom-24 md:-right-8',
    },
    {
      id: 'esp32',
      label: t.hero.annotations.esp32Label,
      sub: t.hero.annotations.esp32Sub,
      icon: Cpu,
      className: 'bottom-2 left-1/2 -translate-x-1/2 md:translate-x-0 md:bottom-6 md:left-16',
    },
  ]

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden pb-16 md:pb-24"
    >
      <TechnicalGrid variant="default" />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-graphite" />

      <div className="relative mx-auto grid w-full max-w-[1400px] flex-1 grid-cols-1 items-center gap-8 px-4 pt-24 sm:px-6 md:grid-cols-2 md:gap-12 md:px-10 md:pt-36">
        <motion.div
          className="relative z-10"
          style={reducedMotion ? undefined : { y: textY, opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4 sm:mb-6 flex items-center gap-3"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-signal animate-ping" />
            <span className="font-mono text-[10px] tracking-[0.35em] text-cyan-signal uppercase md:text-xs font-semibold">
              {t.hero.eyebrow}
            </span>
          </motion.div>

          <SplitLines
            lines={[t.hero.line1, t.hero.line2]}
            className="mb-6 md:mb-8"
            lineClassName="font-display text-[clamp(2.25rem,9.5vw,6.5rem)] font-bold leading-[0.95] tracking-[-0.02em] text-cream"
            delay={0.25}
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mb-6 max-w-md text-sm leading-relaxed text-cream-muted sm:mb-8 md:mb-10 md:text-base"
          >
            {t.hero.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
          >
            <MagneticButton href="#technology" variant="primary" className="w-full sm:w-auto min-h-[44px] justify-center">
              {t.hero.getStarted} <ArrowRight size={14} />
            </MagneticButton>
            <MagneticButton href="#technology" variant="primary" className="w-full sm:w-auto min-h-[44px] justify-center">
              {t.hero.exploreSystem} <ArrowRight size={14} />
            </MagneticButton>
            <MagneticButton href="#how-it-works" variant="secondary" className="hidden md:inline-flex w-full sm:w-auto min-h-[44px] justify-center">
              {t.hero.seeHowItWorks} <ArrowDown size={14} />
            </MagneticButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-8 hidden md:flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border/80 pt-6 font-mono text-[10px] text-cream-muted/70 md:mt-12"
          >
            <div>
              {t.hero.formFactorLabel} <span className="text-cream font-medium">{t.hero.formFactorVal}</span>
            </div>
            <div>
              {t.hero.processorLabel} <span className="text-cyan-signal font-medium">ESP32-S3</span>
            </div>
            <div>
              {t.hero.latencyLabel} <span className="text-medical font-medium">&lt; 12.4 ms</span>
            </div>
            <div>
              {t.hero.commsLabel} <span className="text-cyan-signal font-medium">MQTT Protocol</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative flex flex-col items-center justify-center w-full"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={reducedMotion ? undefined : { scale: deviceScale, opacity: heroOpacity }}
        >
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-700"
            style={{
              background: `radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--color-cyan-signal) ${Math.round((0.08 + progress * 0.08) * 100)}%, transparent) 0%, transparent 68%)`,
            }}
          />

          <div className="relative w-[88vw] max-w-[420px] h-[clamp(300px,75vw,460px)] md:w-full md:max-w-[560px] md:h-[72vh] mx-auto flex items-center justify-center device-viewport-shadow">
            {!reducedMotion ? (
              <HeroErrorBoundary fallback={<HeroFallback />}>
                <Suspense fallback={<HeroFallback />}>
                  <HeroScene
                    scrollProgress={progress}
                    intensity={intensity}
                    className="h-full w-full"
                    isMobile={isMobile}
                  />
                </Suspense>
              </HeroErrorBoundary>
            ) : (
              <HeroFallback />
            )}

            {technicalAnnotations.map((note, i) => {
              const NoteIcon = note.icon
              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.12 }}
                  className={`absolute z-20 ${note.className}`}
                >
                  <div className="group flex items-center gap-1.5 sm:gap-2 md:gap-2.5 rounded-sm border border-border/80 bg-graphite-light/85 px-1.5 py-1 sm:px-2 sm:py-1.5 md:px-3 md:py-1.5 backdrop-blur-md transition-all duration-300 hover:border-cyan-signal/50 max-w-[110px] sm:max-w-[130px] md:max-w-none shadow-sm">
                    <div className="flex h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 items-center justify-center rounded-sm border border-cyan-signal/30 bg-cyan-signal/[0.08] text-cyan-signal">
                      <NoteIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block font-mono text-[7px] sm:text-[8px] md:text-[9px] font-bold tracking-[0.12em] md:tracking-[0.2em] text-cream uppercase leading-tight truncate">
                        {note.label}
                      </span>
                      <span className="block font-mono text-[6px] sm:text-[7px] md:text-[8px] text-cream-muted/70 leading-tight truncate">
                        {note.sub}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}

            {initSequence < 3 && (
              <div className="absolute top-2 left-2 z-30 hidden md:block font-mono text-[9px] text-cyan-signal/80 bg-graphite/80 px-3 py-2 rounded border border-cyan-signal/30 backdrop-blur-sm max-w-[calc(100%-1rem)]">
                <div>BONETALK SIGNAL ENGINE INITIALIZING...</div>
                <div className="text-cream-muted text-[8px] mt-1 truncate">
                  EMG SENSOR ARRAY ...... {initSequence >= 1 ? 'READY ✓' : 'CALIBRATING'}
                </div>
                <div className="text-cream-muted text-[8px] truncate">
                  TINYML INFERENCE CORE .. {initSequence >= 2 ? 'READY ✓' : 'CALIBRATING'}
                </div>
              </div>
            )}
          </div>

          <div className="w-[calc(100%-24px)] max-w-[420px] mx-auto mt-4 rounded-sm border border-border/80 bg-graphite-light/70 p-3 backdrop-blur-md md:hidden">
            <div className="mb-2 flex items-center justify-between font-mono text-[9px]">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-signal animate-pulse" />
                <span className="font-semibold text-cyan-signal uppercase tracking-wider">
                  {t.hero.annotations.emgLabel} TELEMETRY
                </span>
              </div>
              <span className="text-cream-muted/70">1000 Hz</span>
            </div>
            <div className="relative overflow-hidden rounded-sm border border-border/60 bg-graphite p-1.5">
              <EMGWaveform
                height={50}
                intensity={0.9}
                className="w-full opacity-90"
                showGrid={true}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
