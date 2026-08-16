import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Sparkles, RefreshCw } from 'lucide-react'
import { EMGWaveform } from '../ui/EMGWaveform'
import { MagneticButton } from '../ui/MagneticButton'
import { TechnicalGrid } from '../layout/TechnicalGrid'

type TeachPhase = 'idle' | 'input' | 'capturing' | 'trials' | 'learned'

export function TeachSection() {
  const [phase, setPhase] = useState<TeachPhase>('idle')
  const [commandText, setCommandText] = useState('I NEED WATER')
  const [customInput, setCustomInput] = useState('')
  const [trial, setTrial] = useState(0)
  const [confidence, setConfidence] = useState(0)
  const [savedCommands, setSavedCommands] = useState<{ phrase: string; confidence: number }[]>([
    { phrase: 'I NEED WATER', confidence: 96.2 },
    { phrase: 'TURN ON LIGHTS', confidence: 94.8 },
  ])

  const startTraining = (phraseToTrain?: string) => {
    if (phraseToTrain) setCommandText(phraseToTrain)
    setPhase('capturing')
    setTrial(0)
    setConfidence(0)
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (customInput.trim()) {
      startTraining(customInput.trim().toUpperCase())
      setCustomInput('')
    }
  }

  useEffect(() => {
    if (phase !== 'capturing') return

    const timer = setTimeout(() => {
      setPhase('trials')
      setTrial(1)
    }, 1500)

    return () => clearTimeout(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'trials') return

    if (trial < 3) {
      const timer = setTimeout(() => setTrial((t) => t + 1), 1200)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => {
      setPhase('learned')
      let c = 0
      const targetConf = +(95 + Math.random() * 3.5).toFixed(1)
      const interval = setInterval(() => {
        c += (targetConf - c) * 0.15
        setConfidence(c)
        if (Math.abs(targetConf - c) < 0.2) {
          setConfidence(targetConf)
          clearInterval(interval)
          setSavedCommands((prev) => {
            if (prev.some((item) => item.phrase === commandText)) return prev
            return [{ phrase: commandText, confidence: targetConf }, ...prev]
          })
        }
      }, 35)
    }, 800)

    return () => clearTimeout(timer)
  }, [phase, trial, commandText])

  return (
    <section
      className="relative py-24 md:py-36"
      aria-label="Teach BoneTalk interaction"
    >
      <TechnicalGrid variant="default" />

      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
          <div>
            <span className="font-mono text-[10px] tracking-[0.35em] text-cyan-signal uppercase">
              Adaptive Neural Personalization
            </span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-2 font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1] tracking-[-0.02em] text-cream"
            >
              TEACH IT
              <br />
              YOUR LANGUAGE.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-6 max-w-md text-sm leading-relaxed text-cream-muted md:text-base"
            >
              Every user has a distinct neuromuscular signature. BoneTalk calibrates
              its machine learning pipeline to your specific muscle gestures in under 60 seconds.
            </motion.p>

            {/* Saved Trained Phrases List */}
            <div className="mt-10 border-t border-border pt-6">
              <span className="mb-4 block font-mono text-[10px] tracking-[0.25em] text-cream-muted uppercase">
                Active Trained Vocabulary ({savedCommands.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {savedCommands.map((cmd) => (
                  <div
                    key={cmd.phrase}
                    className="inline-flex items-center gap-2 rounded-sm border border-cyan-signal/30 bg-cyan-signal/[0.06] px-3 py-1.5 font-mono text-xs text-cream"
                  >
                    <CheckCircle2 size={12} className="text-medical" />
                    <span>{cmd.phrase}</span>
                    <span className="text-[10px] text-cyan-signal">{cmd.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-border bg-graphite-light/60 p-6 backdrop-blur-sm md:p-8">
            {phase === 'idle' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-6 text-center"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-signal/30 bg-cyan-signal/[0.08] text-cyan-signal">
                  <Sparkles size={20} />
                </div>
                
                <h3 className="font-display text-lg font-bold text-cream">
                  Gesture Calibration Suite
                </h3>
                <p className="mt-1 max-w-xs text-xs text-cream-muted">
                  Teach BoneTalk a custom phrase by recording 3 muscle contraction trials.
                </p>

                <div className="mt-8 flex flex-col gap-4 w-full max-w-sm">
                  <MagneticButton variant="primary" onClick={() => startTraining('I NEED WATER')}>
                    TRAIN &quot;I NEED WATER&quot;
                  </MagneticButton>

                  <form onSubmit={handleCustomSubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ENTER CUSTOM PHRASE..."
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      className="flex-1 rounded-sm border border-border bg-graphite px-3 py-2 font-mono text-xs text-cream placeholder-cream-muted/50 focus:border-cyan-signal focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!customInput.trim()}
                      className="rounded-sm border border-cyan-signal/40 bg-cyan-signal/[0.1] px-4 font-mono text-xs text-cyan-signal transition-colors hover:bg-cyan-signal/[0.2] disabled:opacity-40"
                    >
                      TRAIN
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {phase !== 'idle' && (
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                    <div>
                      <span className="font-mono text-[9px] tracking-[0.2em] text-cream-muted uppercase block">
                        Target Command
                      </span>
                      <span className="font-mono text-sm font-bold text-cream uppercase">
                        &quot;{commandText}&quot;
                      </span>
                    </div>
                    {phase === 'capturing' && (
                      <span className="animate-pulse font-mono text-[10px] text-cyan-signal uppercase">
                        CAPTURING SIGNAL...
                      </span>
                    )}
                    {phase === 'trials' && (
                      <span className="font-mono text-[10px] text-cyan-signal uppercase">
                        TRIAL 0{trial} IN PROGRESS
                      </span>
                    )}
                  </div>

                  <p className="mb-3 font-mono text-xs tracking-[0.15em] text-cream uppercase">
                    Perform Muscle Contraction
                  </p>

                  <div className="overflow-hidden rounded-sm border border-border bg-graphite p-4">
                    <EMGWaveform
                      width={500}
                      height={110}
                      amplitude={phase === 'learned' ? 0.75 : 1.1}
                      frequency={phase === 'learned' ? 2.8 : 3.5}
                      burst={phase === 'learned' ? 0.6 : 0.9}
                      intensity={1}
                      color={phase === 'learned' ? '#4ade80' : '#22d3ee'}
                      className="w-full"
                      showGrid={true}
                    />
                  </div>

                  {(phase === 'trials' || phase === 'learned') && (
                    <div className="mt-6 space-y-2.5">
                      {[1, 2, 3].map((t) => (
                        <div
                          key={t}
                          className={`flex items-center justify-between rounded-sm border px-4 py-2 font-mono text-xs transition-all ${
                            trial >= t
                              ? 'border-medical/40 bg-medical/[0.06] text-cream'
                              : 'border-border/60 bg-graphite/40 text-cream-muted/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                trial >= t ? 'bg-medical' : 'bg-border'
                              }`}
                            />
                            <span>TRIAL 0{t} — {t === 1 ? 'Extensor Flex' : t === 2 ? 'Flexor Hold' : 'Peak Burst'}</span>
                          </div>
                          {trial >= t && (
                            <span className="text-medical font-bold">CALIBRATED ✓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {phase === 'learned' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 border-t border-border pt-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-xs tracking-[0.15em] font-bold text-medical">
                            PATTERN LEARNED ✓
                          </span>
                          <span className="block font-mono text-[10px] text-cream-muted">
                            Model weights updated on ESP32-S3 flash
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-[9px] tracking-[0.2em] text-cream-muted uppercase block">
                            AI Confidence
                          </span>
                          <p className="font-display text-3xl font-bold text-cream tabular-nums">
                            {confidence.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setPhase('idle')}
                        className="mt-6 flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-cyan-signal uppercase transition-colors hover:text-cream"
                      >
                        <RefreshCw size={12} /> Train Another Command →
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

