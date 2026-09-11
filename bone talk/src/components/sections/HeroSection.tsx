import { Suspense, lazy, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Cpu } from 'lucide-react'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import { useLowPerformance, useIsMobile } from '../../hooks/useMediaQuery'
import { HeroErrorBoundary } from '../three/HeroErrorBoundary'

const HeroScene = lazy(() =>
  import('../three/HeroScene').then((m) => ({ default: m.HeroScene }))
)

function HeroFallback() {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-zinc-50 rounded-2xl border border-zinc-200 p-8">
      <div className="text-center">
        <Cpu className="mx-auto h-12 w-12 text-emerald-600 animate-pulse mb-3" />
        <p className="font-medium text-zinc-700">Loading 3D Hardware Telemetry...</p>
      </div>
    </div>
  )
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const progress = useScrollProgress(sectionRef)
  const lowPerf = useLowPerformance()
  const isMobile = useIsMobile()
  const intensity = 0.5 + progress * 0.5

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setMousePos({ x, y })
  }

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex min-h-[90vh] flex-col justify-center bg-white pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-12 lg:gap-16 md:px-10">
        {/* Left Side: Typography & Primary Action (6 columns) */}
        <div className="flex flex-col items-start justify-center lg:col-span-6 z-10 lg:pr-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 border border-emerald-200/80"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-800 tracking-wide">
              Assistive Neurotechnology
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl leading-[1.18] mb-6 max-w-lg break-words"
          >
            Turning muscle signals into communication.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-lg text-base sm:text-lg text-zinc-600 leading-relaxed mb-8 font-normal"
          >
            BoneTalk is a lightweight neck-worn wearable that captures surface EMG muscle activity and translates micro-contractions into real-time spoken words.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
          >
            <a
              href="#technology"
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-emerald-600 px-7 py-3.5 text-base sm:text-lg font-semibold text-white shadow-md hover:bg-emerald-700 transition-all active:scale-[0.98]"
            >
              Get Started <ArrowRight size={20} />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-100 px-6 py-3.5 text-base font-semibold text-zinc-700 hover:bg-zinc-200 transition-colors"
            >
              How It Works
            </a>
          </motion.div>

          {/* Key Specs Pill Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center gap-6 border-t border-zinc-200 pt-6 text-sm text-zinc-600 font-medium"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>ESP32-S3 TinyML</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
              <span>&lt; 12.4ms Latency</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
              <span>MQTT Telemetry</span>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Protected 3D Model Stage (Shifted right, 6 columns) */}
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
          className="relative h-[420px] sm:h-[480px] lg:h-[520px] w-full flex items-center justify-center rounded-3xl bg-gradient-to-b from-zinc-50 to-zinc-100/60 p-4 border border-zinc-200/80 shadow-sm lg:col-span-6 lg:translate-x-4"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative h-full w-full max-w-[480px]">
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
          </div>
        </motion.div>
      </div>
    </section>
  )
}
