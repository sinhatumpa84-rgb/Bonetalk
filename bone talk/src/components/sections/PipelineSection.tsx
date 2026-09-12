import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TechnicalGrid } from '../layout/TechnicalGrid'
import { useLanguage } from '../../context/LanguageContext'

/* ── SVG Illustration Components ── */

function IntentIcon({ active }: { active: boolean }) {
  const stroke = active ? 'var(--color-cyan-signal)' : 'var(--color-cream-muted)'
  const fill = active ? 'var(--accent-glow)' : 'var(--surface-elevated)'
  return (
    <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden="true">
      <ellipse cx="34" cy="38" rx="18" ry="22" fill={fill} stroke={stroke} strokeWidth="1.2" />
      <path d="M34 16 Q52 16 52 38 Q52 54 40 60 L40 66 L28 66 L28 60 Q16 54 16 38 Q16 16 34 16Z"
        fill={fill} stroke={stroke} strokeWidth="1.2" />
      <path d="M28 30 Q34 24 40 30 Q46 36 40 42 Q34 48 28 42 Q22 36 28 30Z"
        fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.6" />
      <path d="M32 26 Q38 22 42 28" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.5" />
      <path d="M26 34 Q30 38 26 42" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.5" />
      <circle cx="58" cy="22" r="3" fill="none" stroke={stroke} strokeWidth="0.8" strokeDasharray="2 1.5" />
      <circle cx="64" cy="16" r="2" fill="none" stroke={stroke} strokeWidth="0.8" strokeDasharray="2 1.5" />
      <circle cx="68" cy="12" r="1.2" fill={stroke} opacity="0.4" />
    </svg>
  )
}

function CaptureIcon({ active }: { active: boolean }) {
  const stroke = active ? 'var(--color-cyan-signal)' : 'var(--color-cream-muted)'
  const fill = active ? 'var(--accent-glow)' : 'var(--surface-elevated)'
  return (
    <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden="true">
      <ellipse cx="40" cy="36" rx="16" ry="18" fill={fill} stroke={stroke} strokeWidth="1.2" />
      <path d="M30 30 Q36 24 42 30" fill="none" stroke={stroke} strokeWidth="0.7" opacity="0.5" />
      <path d="M34 26 Q40 22 46 28" fill="none" stroke={stroke} strokeWidth="0.7" opacity="0.5" />
      <path d="M58 28 Q62 36 58 44" fill="none" stroke={stroke} strokeWidth="1" opacity="0.7" />
      <path d="M63 24 Q68 36 63 48" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.5" />
      <path d="M68 20 Q74 36 68 52" fill="none" stroke={stroke} strokeWidth="0.6" opacity="0.3" />
      <path d="M14 62 L22 62 L26 54 L30 68 L34 56 L38 64 L42 58 L46 66 L50 60 L54 64 L58 62 L66 62"
        fill="none" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function ProcessIcon({ active }: { active: boolean }) {
  const stroke = active ? 'var(--color-cyan-signal)' : 'var(--color-cream-muted)'
  const fill = active ? 'var(--accent-glow)' : 'var(--surface-elevated)'
  return (
    <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden="true">
      <line x1="8" y1="28" x2="24" y2="28" stroke={stroke} strokeWidth="0.8" opacity="0.5" />
      <line x1="8" y1="40" x2="24" y2="40" stroke={stroke} strokeWidth="0.8" opacity="0.5" />
      <line x1="8" y1="52" x2="24" y2="52" stroke={stroke} strokeWidth="0.8" opacity="0.5" />
      <circle cx="40" cy="40" r="14" fill={fill} stroke={stroke} strokeWidth="1.2" />
      <path d="M34 36 L40 30 L46 36" fill="none" stroke={stroke} strokeWidth="1" />
      <path d="M46 44 L40 50 L34 44" fill="none" stroke={stroke} strokeWidth="1" />
      <line x1="40" y1="30" x2="40" y2="50" stroke={stroke} strokeWidth="0.6" opacity="0.4" />
      <line x1="24" y1="28" x2="30" y2="36" stroke={stroke} strokeWidth="0.8" />
      <line x1="24" y1="40" x2="28" y2="40" stroke={stroke} strokeWidth="0.8" />
      <line x1="24" y1="52" x2="30" y2="44" stroke={stroke} strokeWidth="0.8" />
      <line x1="54" y1="40" x2="72" y2="40" stroke={stroke} strokeWidth="1" />
      <path d="M68 36 L74 40 L68 44" fill="none" stroke={stroke} strokeWidth="1" />
      <circle cx="12" cy="28" r="1.5" fill={stroke} opacity="0.4" />
      <circle cx="12" cy="40" r="1.5" fill={stroke} opacity="0.4" />
      <circle cx="12" cy="52" r="1.5" fill={stroke} opacity="0.4" />
    </svg>
  )
}

function UnderstandIcon({ active }: { active: boolean }) {
  const stroke = active ? 'var(--color-cyan-signal)' : 'var(--color-cream-muted)'
  const fill = active ? 'var(--accent-glow)' : 'var(--surface-elevated)'
  return (
    <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden="true">
      <ellipse cx="40" cy="38" rx="20" ry="22" fill={fill} stroke={stroke} strokeWidth="1.2" />
      <circle cx="32" cy="30" r="3" fill="none" stroke={stroke} strokeWidth="0.8" />
      <circle cx="48" cy="30" r="3" fill="none" stroke={stroke} strokeWidth="0.8" />
      <circle cx="40" cy="40" r="3.5" fill={stroke} opacity="0.3" stroke={stroke} strokeWidth="0.8" />
      <circle cx="32" cy="48" r="3" fill="none" stroke={stroke} strokeWidth="0.8" />
      <circle cx="48" cy="48" r="3" fill="none" stroke={stroke} strokeWidth="0.8" />
      <line x1="35" y1="30" x2="37" y2="38" stroke={stroke} strokeWidth="0.6" opacity="0.5" />
      <line x1="45" y1="30" x2="43" y2="38" stroke={stroke} strokeWidth="0.6" opacity="0.5" />
      <line x1="35" y1="48" x2="37" y2="42" stroke={stroke} strokeWidth="0.6" opacity="0.5" />
      <line x1="45" y1="48" x2="43" y2="42" stroke={stroke} strokeWidth="0.6" opacity="0.5" />
      <line x1="35" y1="30" x2="45" y2="48" stroke={stroke} strokeWidth="0.4" opacity="0.3" />
      <line x1="45" y1="30" x2="35" y2="48" stroke={stroke} strokeWidth="0.4" opacity="0.3" />
      <circle cx="40" cy="14" r="4" fill="none" stroke={stroke} strokeWidth="0.8" />
      <line x1="40" y1="18" x2="40" y2="16" stroke={stroke} strokeWidth="0.6" />
      <line x1="38" y1="20" x2="42" y2="20" stroke={stroke} strokeWidth="0.5" />
      <line x1="52" y1="12" x2="54" y2="10" stroke={stroke} strokeWidth="0.6" opacity="0.5" />
      <line x1="56" y1="14" x2="58" y2="12" stroke={stroke} strokeWidth="0.6" opacity="0.5" />
    </svg>
  )
}

function LanguageIcon({ active }: { active: boolean }) {
  const stroke = active ? 'var(--color-cyan-signal)' : 'var(--color-cream-muted)'
  const fill = active ? 'var(--accent-glow)' : 'var(--surface-elevated)'
  return (
    <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden="true">
      <path d="M14 18 L66 18 Q70 18 70 22 L70 50 Q70 54 66 54 L44 54 L36 64 L36 54 L14 54 Q10 54 10 50 L10 22 Q10 18 14 18Z"
        fill={fill} stroke={stroke} strokeWidth="1.2" />
      <line x1="20" y1="28" x2="52" y2="28" stroke={stroke} strokeWidth="1" opacity="0.5" />
      <line x1="20" y1="36" x2="60" y2="36" stroke={stroke} strokeWidth="1" opacity="0.5" />
      <line x1="20" y1="44" x2="44" y2="44" stroke={stroke} strokeWidth="1" opacity="0.5" />
      <rect x="46" y="42" width="1.5" height="6" fill={stroke} opacity="0.6" />
    </svg>
  )
}

function SpeechIcon({ active }: { active: boolean }) {
  const stroke = active ? 'var(--color-cyan-signal)' : 'var(--color-cream-muted)'
  return (
    <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden="true">
      {[16, 22, 28, 34, 40, 46, 52, 58, 64].map((x, i) => {
        const heights = [12, 22, 16, 30, 36, 28, 18, 24, 10]
        const h = heights[i]
        return (
          <rect
            key={x}
            x={x}
            y={40 - h / 2}
            width="3"
            height={h}
            rx="1.5"
            fill={stroke}
            opacity={active ? 0.7 : 0.35}
          >
            {active && (
              <animate
                attributeName="height"
                values={`${h};${h * 0.5};${h};${h * 1.3};${h}`}
                dur={`${1.2 + i * 0.12}s`}
                repeatCount="indefinite"
              />
            )}
            {active && (
              <animate
                attributeName="y"
                values={`${40 - h / 2};${40 - h * 0.25};${40 - h / 2};${40 - h * 0.65};${40 - h / 2}`}
                dur={`${1.2 + i * 0.12}s`}
                repeatCount="indefinite"
              />
            )}
          </rect>
        )
      })}
    </svg>
  )
}

const STEP_ICONS = [IntentIcon, CaptureIcon, ProcessIcon, UnderstandIcon, LanguageIcon, SpeechIcon]

export function PipelineSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeIndex, setActiveIndex] = useState(5)
  const [hasEntered, setHasEntered] = useState(false)
  const { t } = useLanguage()

  const journeySteps = [
    { id: 'think', number: '01', title: t.pipeline.steps.s1Title, description: t.pipeline.steps.s1Desc, status: t.pipeline.steps.s1Status },
    { id: 'capture', number: '02', title: t.pipeline.steps.s2Title, description: t.pipeline.steps.s2Desc, status: t.pipeline.steps.s2Status },
    { id: 'process', number: '03', title: t.pipeline.steps.s3Title, description: t.pipeline.steps.s3Desc, status: t.pipeline.steps.s3Status },
    { id: 'understand', number: '04', title: t.pipeline.steps.s4Title, description: t.pipeline.steps.s4Desc, status: t.pipeline.steps.s4Status },
    { id: 'language', number: '05', title: t.pipeline.steps.s5Title, description: t.pipeline.steps.s5Desc, status: t.pipeline.steps.s5Status },
    { id: 'voice', number: '06', title: t.pipeline.steps.s6Title, description: t.pipeline.steps.s6Desc, status: t.pipeline.steps.s6Status },
  ]

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    let interval: ReturnType<typeof setInterval> | null = null

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!hasEntered) setHasEntered(true)
          if (!interval) {
            interval = setInterval(() => {
              setActiveIndex((prev) => (prev + 1) % journeySteps.length)
            }, 3600)
          }
        } else if (interval) {
          clearInterval(interval)
          interval = null
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(section)
    return () => {
      observer.disconnect()
      if (interval) clearInterval(interval)
    }
  }, [hasEntered, journeySteps.length])

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative section-padding border-b border-border overflow-hidden"
      aria-label="How BoneTalk translates your intention into voice"
    >
      <TechnicalGrid variant="default" />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12 md:mb-16"
        >
          <span className="label-editorial mb-3 justify-center">
            {t.pipeline.eyebrow}
          </span>
          <h2 className="heading-section">
            {t.pipeline.title}
          </h2>
          <p className="mt-4 body-editorial max-w-lg mx-auto">
            {t.pipeline.description}
          </p>
        </motion.div>

        {/* DESKTOP: Horizontal 6-column card flow */}
        <div className="hidden lg:block">
          <div className="relative max-w-5xl mx-auto mb-6">
            <div className="absolute top-1/2 left-[8%] right-[8%] h-px bg-border -translate-y-1/2" />
            <div
              className="absolute top-1/2 left-[8%] h-[2px] bg-cyan-signal/60 -translate-y-1/2 transition-all duration-700 ease-out rounded-full"
              style={{
                width: `${(activeIndex / (journeySteps.length - 1)) * 84}%`,
              }}
            />
            <div className="flex justify-between px-[8%]">
              {journeySteps.map((_, idx) => {
                const isActive = idx === activeIndex
                const isPast = idx <= activeIndex
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className="relative z-10 flex items-center justify-center w-3 h-3 cursor-pointer bg-transparent border-0 p-0"
                    aria-label={`Step ${idx + 1}`}
                  >
                    <span
                      className={`
                        block rounded-full transition-all duration-300
                        ${isActive
                          ? 'h-3 w-3 bg-cyan-signal shadow-[0_0_8px_rgba(0,168,137,0.4)]'
                          : isPast
                            ? 'h-2 w-2 bg-cyan-signal/70'
                            : 'h-1.5 w-1.5 bg-border-strong'
                        }
                      `}
                    />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-6 gap-3 max-w-5xl mx-auto">
            {journeySteps.map((step, idx) => {
              const isActive = idx === activeIndex
              const isPast = idx < activeIndex
              const IconComp = STEP_ICONS[idx]

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.07, duration: 0.4 }}
                  onClick={() => setActiveIndex(idx)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`
                    group relative rounded-lg border p-4 xl:p-5
                    flex flex-col items-center text-center
                    cursor-pointer surface-panel
                    transition-all duration-300 ease-out
                    ${isActive
                      ? 'border-cyan-signal/40 bg-cyan-signal/[0.04] shadow-[0_2px_20px_rgba(0,168,137,0.08)]'
                      : 'border-border bg-graphite-light/60 hover:border-border-strong hover:bg-graphite-light'
                    }
                  `}
                >
                  <span className={`
                    self-start font-mono text-[11px] font-bold tracking-wider mb-3
                    transition-colors duration-300
                    ${isActive ? 'text-cyan-signal' : 'text-cream-muted/50'}
                  `}>
                    {step.number}
                  </span>

                  <div className={`
                    w-16 h-16 xl:w-20 xl:h-20 mb-4
                    transition-transform duration-300
                    ${isActive ? 'scale-105' : 'group-hover:scale-[1.03]'}
                  `}>
                    <IconComp active={isActive || isPast} />
                  </div>

                  <h3 className={`
                    font-display text-[13px] xl:text-sm font-bold leading-tight tracking-[-0.01em] mb-2
                    transition-colors duration-300
                    ${isActive ? 'text-cream' : 'text-cream/85'}
                  `}>
                    {step.title}
                  </h3>

                  <p className={`
                    text-[11px] xl:text-xs leading-[1.55] flex-1
                    transition-colors duration-300
                    ${isActive ? 'text-cream-muted' : 'text-cream-muted/65'}
                  `}>
                    {step.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-border/60 w-full">
                    <span className={`
                      inline-flex items-center justify-center gap-1.5
                      rounded-full px-3 py-1.5 w-full
                      font-mono text-[10px] font-medium tracking-wider
                      transition-all duration-300
                      ${isActive
                        ? 'bg-cyan-signal text-graphite font-bold'
                        : isPast
                          ? 'bg-transparent border border-cyan-signal/30 text-cyan-signal/80'
                          : 'bg-transparent border border-border text-cream-muted/50'
                      }
                    `}>
                      {step.status}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* MOBILE / TABLET: Vertical journey */}
        <div className="lg:hidden relative max-w-md mx-auto">
          <div className="absolute top-0 bottom-0 left-[18px] w-px bg-border" />
          <div
            className="absolute top-0 left-[18px] w-[2px] bg-cyan-signal/60 transition-all duration-700 ease-out rounded-full"
            style={{
              height: `${(activeIndex / (journeySteps.length - 1)) * 100}%`,
            }}
          />

          <div className="space-y-4">
            {journeySteps.map((step, idx) => {
              const isActive = idx === activeIndex
              const isPast = idx < activeIndex
              const IconComp = STEP_ICONS[idx]

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ delay: idx * 0.06, duration: 0.4 }}
                  onClick={() => setActiveIndex(idx)}
                  className={`
                    relative pl-11 pr-4 py-5 rounded-lg border surface-panel
                    cursor-pointer
                    transition-all duration-300
                    ${isActive
                      ? 'border-cyan-signal/40 bg-cyan-signal/[0.04]'
                      : isPast
                        ? 'border-border bg-graphite-light/50'
                        : 'border-border/50 bg-graphite-light/30'
                    }
                  `}
                >
                  <span
                    className={`
                      absolute left-[12px] top-6 rounded-full z-10
                      transition-all duration-300
                      ${isActive
                        ? 'h-3 w-3 bg-cyan-signal shadow-[0_0_8px_rgba(0,168,137,0.35)]'
                        : isPast
                          ? 'h-2.5 w-2.5 bg-cyan-signal/70'
                          : 'h-2 w-2 bg-border-strong'
                      }
                    `}
                  />

                  <div className="flex items-start gap-4">
                    <div className={`
                      flex-shrink-0 w-12 h-12
                      transition-transform duration-300
                      ${isActive ? 'scale-105' : ''}
                    `}>
                      <IconComp active={isActive || isPast} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className={`
                        font-mono text-[9px] font-semibold tracking-wider
                        ${isActive ? 'text-cyan-signal' : 'text-cream-muted/40'}
                      `}>
                        STEP {step.number}
                      </span>

                      <h3 className={`
                        font-display text-sm font-bold leading-snug mt-0.5
                        transition-colors duration-300
                        ${isActive ? 'text-cream' : 'text-cream/80'}
                      `}>
                        {step.title}
                      </h3>

                      <p className={`
                        mt-1 text-[12px] leading-[1.6]
                        transition-colors duration-300
                        ${isActive ? 'text-cream-muted' : 'text-cream-muted/60'}
                      `}>
                        {step.description}
                      </p>

                      <span className={`
                        inline-flex items-center mt-2.5
                        rounded-full px-3 py-1
                        font-mono text-[9px] font-medium tracking-wider
                        transition-all duration-300
                        ${isActive
                          ? 'bg-cyan-signal text-graphite font-bold'
                          : isPast
                            ? 'border border-cyan-signal/30 text-cyan-signal/70'
                            : 'border border-border text-cream-muted/40'
                        }
                      `}>
                        {step.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
