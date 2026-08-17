import { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { PIPELINE_STAGES } from '../../lib/constants'
import { TechnicalGrid } from '../layout/TechnicalGrid'

// ─── PipelineStage ────────────────────────────────────────────────────────────
// PERF: removed per-card useInView / IntersectionObserver.
// Previously every card had its own observer firing simultaneously during
// horizontal scroll, causing 6 simultaneous re-renders per frame.
// Now we derive visibility purely from activeIndex (already computed once).
function PipelineStage({
  stage,
  index,
  activeIndex,
}: {
  stage: (typeof PIPELINE_STAGES)[number]
  index: number
  activeIndex: number
}) {
  const isActive = index === activeIndex
  const isPast = index < activeIndex

  return (
    <motion.div
      className={`relative flex-shrink-0 snap-center px-4 md:px-6 ${
        isActive ? 'opacity-100' : isPast ? 'opacity-40' : 'opacity-25'
      }`}
      animate={{ scale: isActive ? 1 : 0.95 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className={`w-[280px] rounded-sm border p-6 transition-colors duration-500 md:w-[320px] ${
          isActive
            ? 'border-cyan-signal/30 bg-cyan-signal/[0.04]'
            : 'border-border bg-glass'
        }`}
      >
        <span className="font-mono text-[10px] tracking-[0.3em] text-cyan-signal/60">
          {stage.number}
        </span>
        <h3 className="mt-2 font-display text-2xl font-bold tracking-wide text-cream md:text-3xl">
          {stage.title}
        </h3>
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isActive ? 1 : 0,
            height: isActive ? 'auto' : 0,
          }}
          className="mt-4 overflow-hidden text-sm leading-relaxed text-cream-muted"
        >
          {stage.description}
        </motion.p>
      </div>
    </motion.div>
  )
}

// ─── PipelineSection ──────────────────────────────────────────────────────────
export function PipelineSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // ── Horizontal-scroll → activeIndex ──────────────────────────────────────
  // PERF: throttled with a rAF ticking flag so setState only fires once per
  // animation frame (instead of on every native scroll event). Also guards
  // against setting state when the value hasn't actually changed, which would
  // otherwise trigger a full re-render of all cards unnecessarily.
  const activeIndexRef = useRef(0)

  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container) return
    const itemWidth = 320
    const raw = Math.round(container.scrollLeft / itemWidth)
    const next = Math.min(raw, PIPELINE_STAGES.length - 1)
    if (next !== activeIndexRef.current) {
      activeIndexRef.current = next
      setActiveIndex(next)
    }
  }, [])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [handleScroll])

  // ── Auto-advance when section enters view ────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    let interval: ReturnType<typeof setInterval> | null = null

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !interval) {
          interval = setInterval(() => {
            setActiveIndex((prev) => {
              if (prev >= PIPELINE_STAGES.length - 1) {
                if (interval) clearInterval(interval)
                interval = null
                return prev
              }
              const next = prev + 1
              activeIndexRef.current = next
              scrollRef.current?.scrollTo({
                left: next * 320,
                behavior: 'smooth',
              })
              return next
            })
          }, 3000)
        } else if (!entry.isIntersecting && interval) {
          clearInterval(interval)
          interval = null
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(section)
    return () => {
      observer.disconnect()
      if (interval) clearInterval(interval)
    }
  }, [])

  // ── Progress dot position (% along the track) ────────────────────────────
  // PERF: using transform instead of `left` so the browser skips layout.
  // We express it as a percentage translateX so there is no layout property
  // being animated — the GPU handles it entirely.
  const dotPercent = (activeIndex / (PIPELINE_STAGES.length - 1)) * 100

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32"
      aria-label="System pipeline"
    >
      <TechnicalGrid variant="default" />

      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-4 font-mono text-[10px] tracking-[0.35em] text-cream-muted uppercase"
        >
          System Pipeline
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 font-display text-[clamp(1.5rem,4vw,3rem)] font-bold text-cream"
        >
          MUSCLE → EMG → ESP32-S3 → AI → INTENT → VOICE
        </motion.h2>
      </div>

      {/* Progress track + dot */}
      <div className="relative mx-auto mb-8 hidden h-px max-w-[1400px] overflow-visible px-10 md:block">
        <motion.div
          className="h-px w-full bg-cyan-signal/30"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          style={{ transformOrigin: 'left' }}
        />
        {/* PERF: transform: translateX(%) instead of animating `left`.
            `left` triggers layout; translateX is GPU-composited. */}
        <motion.div
          className="absolute top-0 left-0 h-1 w-1 -translate-y-0.5 rounded-full bg-cyan-signal"
          animate={{ x: `${dotPercent}cqw` }}
          style={{ x: `${dotPercent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Horizontal scrollable card track (Desktop / Tablet) */}
      <div
        ref={scrollRef}
        className="hidden md:flex snap-x snap-mandatory gap-0 overflow-x-auto pb-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="w-6 flex-shrink-0 md:w-10" />
        {PIPELINE_STAGES.map((stage, i) => (
          <PipelineStage
            key={stage.id}
            stage={stage}
            index={i}
            activeIndex={activeIndex}
          />
        ))}
        <div className="w-6 flex-shrink-0 md:w-10" />
      </div>

      {/* Mobile vertical pipeline */}
      <div className="mx-auto mt-8 max-w-md space-y-3 px-6 md:hidden">
        {PIPELINE_STAGES.map((stage) => (
          <div
            key={stage.id}
            className="rounded-sm border border-border bg-graphite-light/40 p-4 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] tracking-[0.25em] text-cyan-signal font-semibold">
                {stage.number}
              </span>
              <h3 className="font-display text-base font-bold text-cream">
                {stage.title}
              </h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-cream-muted">
              {stage.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
