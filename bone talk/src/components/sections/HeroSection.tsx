import { Suspense, lazy, useRef, useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowRight, Cpu, Activity, Zap, Radio, Volume2 } from 'lucide-react'
import { SplitLines } from '../ui/SplitText'
import { MagneticButton } from '../ui/MagneticButton'
import { TechnicalGrid } from '../layout/TechnicalGrid'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import { useLowPerformance, useIsMobile } from '../../hooks/useMediaQuery'
import { EMGWaveform } from '../ui/EMGWaveform'
import { HeroErrorBoundary } from '../three/HeroErrorBoundary'

const HeroScene = lazy(() =>
  import('../three/HeroScene').then((m) => ({ default: m.HeroScene }))
)

function HeroFallback() {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-transparent">
      {/* Seamless High-Quality 2D Neck-Worn Device Composition */}
      <div className="relative aspect-square w-full max-w-[420px] p-4">
        {/* Soft Radial Ambient Cyan Glow */}
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

          {/* Background Tech Circle */}
          <circle cx="200" cy="200" r="170" fill="url(#neckGlow)" stroke="var(--grid-line)" strokeWidth="1" />
          <circle cx="200" cy="200" r="130" fill="none" stroke="var(--signal-ring)" strokeDasharray="3 3" />

          {/* Human Neck & Clavicle Silhouette */}
          <path
            d="M130 90 Q200 70 270 90 L280 240 Q200 270 120 240 Z"
            fill="var(--surface-elevated)"
            stroke="var(--stroke-muted)"
            strokeWidth="1"
          />
          {/* Shoulder Slope */}
          <path
            d="M80 340 Q130 240 180 240 L220 240 Q270 240 320 340 Z"
            fill="var(--surface-base)"
          />

          {/* BoneTalk Ergonomic Neck Collar Band */}
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

          {/* Central ESP32-S3 Processing Pod (Rests on front of neck) */}
          <g transform="translate(145, 205)">
            <rect x="0" y="0" width="110" height="50" rx="8" fill="var(--surface-elevated)" stroke="var(--color-cyan-signal)" strokeWidth="1.5" />
            <rect x="8" y="8" width="94" height="34" rx="4" fill="var(--surface-base)" />
            {/* Status Micro LED */}
            <circle cx="55" cy="25" r="10" fill="none" stroke="var(--color-cyan-signal)" strokeWidth="2" />
            <circle cx="55" cy="25" r="4" fill="var(--color-cyan-signal)" className="animate-pulse" />
            {/* Surface Gold Electrodes */}
            <circle cx="24" cy="25" r="6" fill="#D97706" />
            <circle cx="86" cy="25" r="6" fill="#D97706" />
          </g>

          {/* EMG Waveform Signal Arc */}
          <path
            d="M120 160 Q 200 130 280 160"
            fill="none"
            stroke="var(--color-cyan-signal)"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
        </svg>

        {/* EMG Waveform HUD Overlay */}
        <div className="absolute bottom-4 left-1/2 w-full max-w-[280px] -translate-x-1/2 rounded-sm border border-border/80 bg-graphite-light/70 p-3 backdrop-blur-md">
          <div className="mb-1.5 flex items-center justify-between font-mono text-[9px]">
            <span className="text-cyan-signal font-semibold">EMG NECK TELEMETRY</span>
            <span className="text-cream-muted/70">1000 Hz</span>
          </div>
          <EMGWaveform width={250} height={50} intensity={0.9} className="w-full opacity-90" showGrid={false} />
        </div>
      </div>
    </div>
  )
}

// Technical Callouts Annotations with Thin Connecting Lines
const TECHNICAL_ANNOTATIONS = [
  {
    id: 'emg',
    label: 'EMG SENSOR',
    sub: 'Biopotential Electrodes',
    icon: Activity,
    pos: 'top-10 left-0 md:-left-6',
    line: 'M90,30 L160,110',
  },
  {
    id: 'signal',
    label: 'MUSCLE SIGNAL',
    sub: 'Neck Muscle Activity',
    icon: Zap,
    pos: 'bottom-28 left-0 md:-left-8',
    line: 'M100,10 L160,-40',
  },
  {
    id: 'esp32',
    label: 'ESP32-S3 POD',
    sub: '240MHz TinyML DSP',
    icon: Cpu,
    pos: 'bottom-6 left-12 md:left-16',
    line: 'M70,-10 L70,-60',
  },
  {
    id: 'ai',
    label: 'AI RECOGNITION',
    sub: 'Gesture Classification',
    icon: Radio,
    pos: 'top-16 right-0 md:-right-6',
    line: 'M-10,30 L-80,100',
  },
  {
    id: 'voice',
    label: 'VOICE OUTPUT',
    sub: 'Real-Time Speech Engine',
    icon: Volume2,
    pos: 'bottom-24 right-0 md:-right-8',
    line: 'M-10,-10 L-70,-50',
  },
]

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const progress = useScrollProgress(sectionRef)
  const lowPerf = useLowPerformance()
  const isMobile = useIsMobile()
  const prefersReduced = useReducedMotion()
  const intensity = 0.5 + progress * 0.5

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [initSequence, setInitSequence] = useState(0)

  // Initialization Sequence simulation for telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      setInitSequence((prev) => (prev < 3 ? prev + 1 : prev))
    }, 450)
    return () => clearInterval(timer)
  }, [])

  // Parallax tracking with low-frequency throttle
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || prefersReduced) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setMousePos({ x, y })
  }

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden pb-16 md:pb-24"
    >
      <TechnicalGrid variant="default" />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-graphite" />

      <div className="relative mx-auto grid w-full max-w-[1400px] flex-1 grid-cols-1 items-center gap-8 px-6 pt-28 md:grid-cols-2 md:gap-12 md:px-10 md:pt-36">
        {/* Left Side: Typography & CTAs */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 flex items-center gap-3"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-signal animate-ping" />
            <span className="font-mono text-[10px] tracking-[0.35em] text-cyan-signal uppercase md:text-xs font-semibold">
              NECK-WORN ASSISTIVE NEUROTECHNOLOGY / 2026
            </span>
          </motion.div>

          <SplitLines
            lines={['THE BODY', 'HAS A VOICE.']}
            className="mb-8"
            lineClassName="font-display text-[clamp(2.75rem,8vw,6.5rem)] font-bold leading-[0.95] tracking-[-0.02em] text-cream"
            delay={0.25}
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mb-10 max-w-md text-sm leading-relaxed text-cream-muted md:text-base"
          >
            BoneTalk is a neck-worn assistive device that transforms muscle activity into meaningful
            speech using surface EMG sensing, embedded DSP, and TinyML AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <MagneticButton href="#technology" variant="primary">
              GET STARTED <ArrowRight size={14} />
            </MagneticButton>
            <MagneticButton href="#technology" variant="primary">
              EXPLORE THE SYSTEM <ArrowRight size={14} />
            </MagneticButton>
            <MagneticButton href="#how-it-works" variant="secondary">
              SEE HOW IT WORKS <ArrowDown size={14} />
            </MagneticButton>
          </motion.div>

          {/* Telemetry Status Line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-12 flex flex-wrap items-center gap-6 border-t border-border/80 pt-6 font-mono text-[10px] text-cream-muted/70"
          >
            <div>
              FORM FACTOR: <span className="text-cream font-medium">NECK WEARABLE</span>
            </div>
            <div>
              PROCESSOR: <span className="text-cyan-signal font-medium">ESP32-S3</span>
            </div>
            <div>
              LATENCY: <span className="text-medical font-medium">&lt; 12.4 ms</span>
            </div>
            <div>
              COMMS: <span className="text-cyan-signal font-medium">MQTT Protocol</span>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Seamless Immersive Visual (NO WHITE BOX) */}
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
          className="relative h-[55vh] min-h-[340px] md:h-[72vh] flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          data-cursor="EXPLORE"
          data-cursor-label="EXPLORE"
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-700"
            style={{
              background: `radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--color-cyan-signal) ${Math.round((0.08 + progress * 0.08) * 100)}%, transparent) 0%, transparent 68%)`,
            }}
          />

          {/* Seamless Floating 3D / Fallback Container */}
          <div className="relative h-full w-full max-w-[560px]">
            {!lowPerf && !isMobile ? (
              <HeroErrorBoundary fallback={<HeroFallback />}>
                <Suspense fallback={<HeroFallback />}>
                  <HeroScene
                    scrollProgress={progress}
                    intensity={intensity}
                    mouseX={mousePos.x}
                    mouseY={mousePos.y}
                    className="h-full w-full"
                  />
                </Suspense>
              </HeroErrorBoundary>
            ) : (
              <HeroFallback />
            )}

            {/* Technical Engineering Floating Annotations */}
            {!isMobile &&
              TECHNICAL_ANNOTATIONS.map((note, i) => {
                const NoteIcon = note.icon
                return (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + i * 0.12 }}
                    className={`absolute z-20 hidden md:block ${note.pos}`}
                  >
                    <div className="group flex items-center gap-2.5 rounded-sm border border-border/80 bg-graphite-light/70 px-3 py-1.5 backdrop-blur-md transition-all duration-300 hover:border-cyan-signal/50">
                      <div className="flex h-5 w-5 items-center justify-center rounded-sm border border-cyan-signal/30 bg-cyan-signal/[0.08] text-cyan-signal">
                        <NoteIcon size={11} />
                      </div>
                      <div>
                        <span className="block font-mono text-[9px] font-bold tracking-[0.2em] text-cream uppercase">
                          {note.label}
                        </span>
                        <span className="block font-mono text-[8px] text-cream-muted/70">
                          {note.sub}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}

            {/* Initialization HUD Overlay */}
            {initSequence < 3 && (
              <div className="absolute top-4 left-4 z-30 font-mono text-[9px] text-cyan-signal/80 bg-graphite/80 px-3 py-2 rounded border border-cyan-signal/30 backdrop-blur-sm">
                <div>BONETALK SIGNAL ENGINE INITIALIZING...</div>
                <div className="text-cream-muted text-[8px] mt-1">
                  EMG SENSOR ARRAY ...... {initSequence >= 1 ? 'READY ✓' : 'CALIBRATING'}
                </div>
                <div className="text-cream-muted text-[8px]">
                  TINYML INFERENCE CORE .. {initSequence >= 2 ? 'READY ✓' : 'CALIBRATING'}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
