import { motion } from 'framer-motion'
import { ArrowRight, Activity, Cpu, Brain, Volume2, UserCheck } from 'lucide-react'
import { SplitLines } from '../ui/SplitText'
import { MagneticButton } from '../ui/MagneticButton'
import { TechnicalGrid } from '../layout/TechnicalGrid'

const ECOSYSTEM_NODES = [
  { name: 'USER', icon: UserCheck, detail: 'Muscle Movement' },
  { name: 'EMG', icon: Activity, detail: 'Surface Telemetry' },
  { name: 'ESP32-S3', icon: Cpu, detail: 'Embedded DSP' },
  { name: 'AI', icon: Brain, detail: 'Pattern Classifier' },
  { name: 'VOICE', icon: Volume2, detail: 'Speech Synthesis' },
]

export function FinalRevealSection() {
  return (
    <section
      id="experience"
      className="relative flex min-h-screen flex-col justify-center py-24 md:py-32"
      aria-label="BoneTalk product reveal"
    >
      <TechnicalGrid variant="hardware" />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[1fr_auto]">
          <div>
            {/* Ecosystem flow */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-14 flex flex-wrap items-center gap-3 font-mono text-[10px] tracking-[0.2em] text-cream-muted md:gap-4 md:text-xs"
            >
              {ECOSYSTEM_NODES.map((node, i) => {
                const NodeIcon = node.icon
                return (
                  <div key={node.name} className="flex items-center gap-3 md:gap-4">
                    <div className="inline-flex items-center gap-2 rounded-sm border border-cyan-signal/20 bg-cyan-signal/[0.05] px-3 py-1.5 text-cyan-signal">
                      <NodeIcon size={12} />
                      <span className="font-semibold">{node.name}</span>
                    </div>
                    {i < ECOSYSTEM_NODES.length - 1 && (
                      <span className="text-border">→</span>
                    )}
                  </div>
                )
              })}
            </motion.div>

            <SplitLines
              lines={['WHEN THE VOICE', 'IS SILENT,']}
              lineClassName="font-display text-[clamp(2.25rem,5.5vw,4.5rem)] font-bold leading-[0.95] tracking-[-0.02em] text-cream"
            />
            <SplitLines
              lines={['COMMUNICATION', "DOESN'T HAVE TO BE."]}
              className="mt-3"
              lineClassName="font-display text-[clamp(2.25rem,5.5vw,4.5rem)] font-bold leading-[0.95] tracking-[-0.02em] text-cyan-signal/90"
              delay={0.25}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="mt-16 border-l-2 border-cyan-signal pl-6"
            >
              <h3 className="font-display text-4xl font-extrabold tracking-[0.25em] text-cream md:text-6xl">
                BONETALK
              </h3>
              <p className="mt-3 font-mono text-xs tracking-[0.35em] text-cyan-signal uppercase font-medium">
                AI-Powered Assistive Communication System
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <MagneticButton href="#technology" variant="primary">
                EXPERIENCE BONETALK <ArrowRight size={14} />
              </MagneticButton>
              <MagneticButton href="#hardware" variant="secondary">
                INSPECT HARDWARE
              </MagneticButton>
            </motion.div>
          </div>

          {/* Visual accent badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative hidden aspect-square w-72 lg:block xl:w-96"
          >
            <div className="absolute inset-0 rounded-full border border-border" />
            <div className="absolute inset-6 rounded-full border border-cyan-signal/20" />
            <div className="absolute inset-12 rounded-full border border-medical/15" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-sm border border-cyan-signal/40 bg-cyan-signal/[0.08] text-cyan-signal">
                  <Activity size={24} className="animate-pulse" />
                </div>
                <span className="font-mono text-[10px] tracking-[0.3em] text-cream font-semibold uppercase block">
                  BoneTalk Core Active
                </span>
                <span className="font-mono text-[9px] text-medical uppercase block mt-1">
                  100% Signal Fidelity
                </span>
              </div>
            </div>
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute top-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-signal shadow-[0_0_10px_var(--color-cyan-signal)]" />
            </motion.div>
          </motion.div>
        </div>

        <footer className="mt-32 flex flex-col items-start justify-between gap-6 border-t border-border pt-10 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <span className="font-display text-base font-bold tracking-[0.35em] text-cream">
              BONETALK
            </span>
            <span className="rounded-full border border-medical/40 bg-medical/10 px-2 py-0.5 font-mono text-[9px] text-medical">
              v2.4 ONLINE
            </span>
          </div>

          <p className="text-xs text-cream-muted/70 max-w-md">
            EMG Sensing + ESP32-S3 + TinyML Neural Inference. Assistive neurotechnology restoring expression.
          </p>

          <span className="font-mono text-[10px] text-cream-muted/50">
            © 2026 BoneTalk Systems Inc.
          </span>
        </footer>
      </div>
    </section>
  )
}

