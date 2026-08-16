import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AI_PIPELINE } from '../../lib/constants'
import { TechnicalGrid } from '../layout/TechnicalGrid'
import { SplitLines } from '../ui/SplitText'

function SignalParticleFlow({ active }: { active: boolean }) {
  if (!active) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-cyan-signal shadow-[0_0_8px_#22d3ee] animate-pulse"
          style={{
            top: `${20 + i * 22}%`,
            animationDuration: `${1.8 + i * 0.4}s`,
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  )
}

export function AISection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="ai"
      className="relative py-24 md:py-40"
      aria-label="AI processing pipeline"
    >
      <TechnicalGrid variant="default" />

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-16 px-6 md:grid-cols-2 md:px-10">
        <div>
          <SplitLines
            lines={['FROM SIGNAL', 'TO INTENT.']}
            lineClassName="font-display text-[clamp(2rem,5vw,4rem)] font-bold leading-[1] tracking-[-0.02em] text-cream"
          />
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 max-w-md text-sm leading-relaxed text-cream-muted md:text-base"
          >
            Real signal processing — filtering noise, extracting features, matching
            patterns, and classifying intent. No black boxes. No generic brains.
          </motion.p>
        </div>

        <div className="relative">
          <div className="relative rounded-sm border border-border bg-graphite-light/50 p-8 backdrop-blur-sm md:p-10">
            <SignalParticleFlow active={inView} />

            <div className="relative space-y-0">
              {AI_PIPELINE.map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  <div
                    className={`flex items-center gap-4 py-3 ${
                      i === AI_PIPELINE.length - 1
                        ? 'text-medical'
                        : 'text-cream'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-sm border font-mono text-[10px] ${
                        inView && i <= 3
                          ? 'border-cyan-signal/40 bg-cyan-signal/[0.06] text-cyan-signal'
                          : i === AI_PIPELINE.length - 1
                            ? 'border-medical/40 bg-medical/[0.06] text-medical'
                            : 'border-border text-cream-muted'
                      }`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <span className="font-mono text-sm tracking-[0.2em] uppercase">
                      {step}
                    </span>
                  </div>

                  {i < AI_PIPELINE.length - 1 && (
                    <div className="ml-4 flex items-center py-1">
                      <motion.div
                        className="h-6 w-px bg-gradient-to-b from-cyan-signal/40 to-transparent"
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 + 0.2 }}
                        style={{ originY: 0 }}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Processing visualization bars */}
            <div className="mt-8 flex items-end gap-1 border-t border-border pt-6">
              {Array.from({ length: 24 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-cyan-signal/30"
                  initial={{ height: 4 }}
                  animate={
                    inView
                      ? {
                          height: [
                            4 + Math.random() * 20,
                            4 + Math.random() * 30,
                            4 + Math.random() * 15,
                          ],
                        }
                      : { height: 4 }
                  }
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    delay: i * 0.05,
                  }}
                  style={{ maxHeight: 32 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
