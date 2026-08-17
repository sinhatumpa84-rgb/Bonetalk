import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { SplitLines } from '../ui/SplitText'
import { TechnicalGrid } from '../layout/TechnicalGrid'
import { EMGWaveform } from '../ui/EMGWaveform'

export function ScrollStorySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const armOpacity = useTransform(scrollYProgress, [0, 0.3, 0.5], [1, 0.6, 0])
  const signalOpacity = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0, 1, 1])
  const text1Opacity = useTransform(scrollYProgress, [0.1, 0.25, 0.4], [0, 1, 0])
  const text2Opacity = useTransform(scrollYProgress, [0.55, 0.7, 0.85], [0, 1, 1])

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative min-h-[200vh]"
      aria-label="Communication story"
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <TechnicalGrid variant="hidden" />

        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-12 px-6 md:grid-cols-2 md:px-10">
          {/* Human-centered scene */}
          <div className="relative flex flex-col items-center justify-center">
            <motion.div
              style={{ opacity: armOpacity }}
              className="relative w-full max-w-sm"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm border border-border bg-graphite-elevated">
                {/* Abstract human portrait - silhouette with emotion */}
                <div className="absolute inset-0 bg-gradient-to-t from-graphite via-graphite-light to-graphite-elevated" />
                <div className="absolute inset-x-0 bottom-0 h-3/4">
                  <svg
                    viewBox="0 0 300 400"
                    className="h-full w-full"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--skin-tone-base)" />
                        <stop offset="100%" stopColor="var(--skin-tone-start)" />
                      </linearGradient>
                    </defs>
                    {/* Shoulders and head silhouette */}
                    <ellipse cx="150" cy="120" rx="55" ry="65" fill="url(#skinGrad)" />
                    <path
                      d="M80 200 Q150 170 220 200 L240 400 L60 400 Z"
                      fill="url(#skinGrad)"
                    />
                    {/* Subtle facial features - contemplative */}
                    <ellipse cx="130" cy="115" rx="8" ry="3" fill="var(--skin-feature)" opacity="0.5" />
                    <ellipse cx="170" cy="115" rx="8" ry="3" fill="var(--skin-feature)" opacity="0.5" />
                    <path
                      d="M140 145 Q150 138 160 145"
                      stroke="var(--skin-feature)"
                      strokeWidth="2"
                      fill="none"
                      opacity="0.4"
                    />
                    {/* Forearm */}
                    <rect
                      x="200"
                      y="220"
                      width="40"
                      height="120"
                      rx="20"
                      fill="var(--skin-tone-base)"
                      transform="rotate(-15 220 280)"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-graphite via-transparent to-transparent" />
              </div>
            </motion.div>

            <motion.div style={{ opacity: text1Opacity }} className="mt-8 text-center md:mt-0 md:absolute md:bottom-20 md:left-0 md:text-left">
              <SplitLines
                lines={['WHEN WORDS', 'CANNOT ESCAPE.']}
                lineClassName="font-display text-[clamp(2rem,5vw,4rem)] font-bold leading-[1] tracking-[-0.02em] text-cream"
              />
              <motion.p
                style={{ opacity: text1Opacity }}
                className="mt-6 max-w-sm text-sm text-cream-muted md:text-base"
              >
                Communication should not depend on a voice.
              </motion.p>
            </motion.div>
          </div>

          {/* Signal transition */}
          <div className="relative flex flex-col items-center justify-center">
            <motion.div
              style={{ opacity: signalOpacity }}
              className="w-full"
            >
              <div className="mb-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-signal/40 to-cyan-signal" />
                <span className="font-mono text-[10px] tracking-[0.3em] text-cyan-signal uppercase">
                  EMG Signal
                </span>
              </div>

              <EMGWaveform
                width={600}
                height={140}
                intensity={1.2}
                className="w-full max-w-full"
              />

              <div className="mt-12 rounded-sm border border-border bg-glass p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-medical" />
                  <span className="font-mono text-[10px] tracking-[0.2em] text-medical uppercase">
                    Signal Active
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              style={{ opacity: text2Opacity }}
              className="mt-12 md:mt-16"
            >
              <SplitLines
                lines={['BUT MUSCLES', 'STILL SPEAK.']}
                lineClassName="font-display text-[clamp(2rem,5vw,4rem)] font-bold leading-[1] tracking-[-0.02em] text-cream"
                delay={0.2}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
