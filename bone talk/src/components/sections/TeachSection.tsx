import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Sparkles, Volume2 } from 'lucide-react'
import { EMGWaveform } from '../ui/EMGWaveform'
import { MagneticButton } from '../ui/MagneticButton'
import { TechnicalGrid } from '../layout/TechnicalGrid'
import { VoiceOutputPanel } from '../ui/VoiceOutputPanel'
import { useLanguage } from '../../context/LanguageContext'

type TeachPhase = 'idle' | 'input' | 'capturing' | 'trials' | 'learned'

export function TeachSection() {
  const { currentLanguage, translateCommand, t } = useLanguage()
  const [phase, setPhase] = useState<TeachPhase>('idle')
  const [commandText, setCommandText] = useState('I NEED WATER')
  const [customInput, setCustomInput] = useState('')
  const [trial, setTrial] = useState(0)
  const [confidence, setConfidence] = useState(96.2)
  const [savedCommands, setSavedCommands] = useState<{ phrase: string; confidence: number }[]>([
    { phrase: 'I NEED WATER', confidence: 96.2 },
    { phrase: 'TURN ON LIGHTS', confidence: 94.8 },
  ])

  const [selectedCommand, setSelectedCommand] = useState<{ phrase: string; confidence: number }>({
    phrase: 'I NEED WATER',
    confidence: 96.2,
  })

  const startTraining = (phraseToTrain?: string) => {
    if (phraseToTrain) {
      const sanitized = phraseToTrain.trim().slice(0, 50)
      if (sanitized) setCommandText(sanitized)
    }
    setPhase('capturing')
    setTrial(0)
    setConfidence(0)
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const sanitized = Array.from(customInput)
      .filter((c) => {
        const code = c.charCodeAt(0)
        return code >= 32 && code !== 127
      })
      .join('')
      .trim()
      .slice(0, 50)

    if (sanitized) {
      startTraining(sanitized.toUpperCase())
      setCustomInput('')
    }
  }

  const handleSelectVocabularyItem = (cmd: { phrase: string; confidence: number }) => {
    setSelectedCommand(cmd)
    if (phase === 'learned') {
      setCommandText(cmd.phrase)
      setConfidence(cmd.confidence)
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
          const newCmd = { phrase: commandText, confidence: targetConf }
          setSelectedCommand(newCmd)
          setSavedCommands((prev) => {
            if (prev.some((item) => item.phrase === commandText)) return prev
            return [newCmd, ...prev]
          })
        }
      }, 35)
    }, 800)

    return () => clearTimeout(timer)
  }, [phase, trial, commandText])

  return (
    <section
      id="teach"
      className="relative py-24 md:py-36 border-b border-border"
      aria-label="Teach SAAKANTHA interaction and voice output"
    >
      <TechnicalGrid variant="default" />

      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
          {/* Left Column */}
          <div>
            <span className="font-mono text-[10px] tracking-[0.35em] text-cyan-signal uppercase font-semibold">
              {t.teach.eyebrow}
            </span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-2 font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1] tracking-[-0.02em] text-cream"
            >
              {t.teach.titleLine1}
              <br />
              {t.teach.titleLine2}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-6 max-w-md text-sm leading-relaxed text-cream-muted md:text-base"
            >
              {t.teach.description}
            </motion.p>

            <div className="mt-10 border-t border-border pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="block font-mono text-[10px] tracking-[0.25em] text-cream-muted uppercase font-semibold">
                  {t.teach.activeVocab} ({savedCommands.length})
                </span>
                <span className="font-mono text-[9px] text-cyan-signal">
                  {t.teach.clickToPlay}
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {savedCommands.map((cmd) => {
                  const isSelected = selectedCommand.phrase === cmd.phrase
                  const translatedCmd = translateCommand(cmd.phrase)
                  return (
                    <button
                      key={cmd.phrase}
                      type="button"
                      onClick={() => handleSelectVocabularyItem(cmd)}
                      className={`inline-flex items-center gap-2 rounded-sm border px-3 py-2 font-mono text-xs transition-all cursor-pointer surface-panel ${
                        isSelected
                          ? 'border-cyan-signal bg-cyan-signal/[0.12] text-cream shadow-sm scale-102 font-bold'
                          : 'border-cyan-signal/30 bg-cyan-signal/[0.04] text-cream-muted hover:border-cyan-signal/60 hover:text-cream'
                      }`}
                    >
                      <CheckCircle2 size={13} className={isSelected ? 'text-cyan-signal' : 'text-medical'} />
                      <span>{translatedCmd}</span>
                      <span className="text-[10px] text-cyan-signal">{cmd.confidence}%</span>
                      <Volume2 size={12} className={isSelected ? 'text-cyan-signal animate-pulse' : 'opacity-40'} />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="rounded-sm border border-border bg-graphite-light/60 p-4 backdrop-blur-sm sm:p-6 md:p-8 surface-panel">
              {phase === 'idle' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center py-4 text-center sm:py-6"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-signal/30 bg-cyan-signal/[0.08] text-cyan-signal sm:mb-6">
                    <Sparkles size={20} />
                  </div>

                  <h3 className="font-display text-base font-bold text-cream sm:text-lg">
                    {t.teach.calibrationTitle}
                  </h3>
                  <p className="mt-1 max-w-xs text-xs text-cream-muted">
                    {t.teach.calibrationDesc}
                  </p>

                  <div className="mt-6 flex flex-col gap-3 w-full max-w-sm sm:mt-8 sm:gap-4">
                    <MagneticButton variant="primary" onClick={() => startTraining('HI')} className="w-full min-h-[44px] justify-center">
                      {t.teach.trainHi}
                    </MagneticButton>

                    <MagneticButton variant="secondary" onClick={() => startTraining('I NEED WATER')} className="w-full min-h-[44px] justify-center">
                      {t.teach.trainWater}
                    </MagneticButton>

                    <form onSubmit={handleCustomSubmit} className="flex flex-col gap-2 sm:flex-row">
                      <input
                        type="text"
                        maxLength={50}
                        placeholder={t.teach.enterCustom}
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value.slice(0, 50))}
                        className="flex-1 rounded-sm border border-border bg-graphite px-3 py-2.5 font-mono text-xs text-cream placeholder-cream-muted/50 focus:border-cyan-signal focus:outline-none min-h-[44px]"
                      />
                      <button
                        type="submit"
                        disabled={!customInput.trim()}
                        className="rounded-sm border border-cyan-signal/40 bg-cyan-signal/[0.1] px-4 py-2 font-mono text-xs text-cyan-signal transition-colors hover:bg-cyan-signal/[0.2] disabled:opacity-40 min-h-[44px] flex items-center justify-center font-bold cursor-pointer"
                      >
                        {t.teach.trainBtn}
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
                    <div className="mb-4 flex items-center justify-between border-b border-border pb-3 sm:mb-6 sm:pb-4">
                      <div>
                        <span className="font-mono text-[8px] sm:text-[9px] tracking-[0.2em] text-cream-muted uppercase block">
                          {t.teach.targetCmd} ({currentLanguage.name})
                        </span>
                        <span className="font-mono text-xs sm:text-sm font-bold text-cream uppercase">
                          &quot;{translateCommand(commandText)}&quot;
                        </span>
                      </div>
                      {phase === 'capturing' && (
                        <span className="animate-pulse font-mono text-[9px] sm:text-[10px] text-cyan-signal uppercase font-semibold">
                          {t.teach.capturing}
                        </span>
                      )}
                      {phase === 'trials' && (
                        <span className="font-mono text-[9px] sm:text-[10px] text-cyan-signal uppercase font-semibold">
                          TRIAL 0{trial} {t.teach.trialProgress}
                        </span>
                      )}
                      {phase === 'learned' && (
                        <span className="font-mono text-[9px] sm:text-[10px] text-medical uppercase font-bold flex items-center gap-1">
                          <CheckCircle2 size={13} /> {t.teach.learnedStatus}
                        </span>
                      )}
                    </div>

                    {phase !== 'learned' && (
                      <>
                        <p className="mb-2 sm:mb-3 font-mono text-[11px] sm:text-xs tracking-[0.15em] text-cream uppercase">
                          {t.teach.performContraction}
                        </p>

                        <div className="overflow-hidden rounded-sm border border-border bg-graphite p-2 sm:p-4 surface-instrument">
                          <EMGWaveform
                            height={110}
                            amplitude={1.1}
                            frequency={3.5}
                            burst={0.9}
                            intensity={1}
                            color="var(--color-cyan-signal)"
                            className="w-full"
                            showGrid={true}
                          />
                        </div>
                      </>
                    )}

                    {(phase === 'trials' || phase === 'learned') && phase !== 'learned' && (
                      <div className="mt-6 space-y-2.5">
                        {[1, 2, 3].map((tIdx) => (
                          <div
                            key={tIdx}
                            className={`flex items-center justify-between rounded-sm border px-4 py-2 font-mono text-xs transition-all ${
                              trial >= tIdx
                                ? 'border-medical/40 bg-medical/[0.06] text-cream'
                                : 'border-border/60 bg-graphite/40 text-cream-muted/40'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  trial >= tIdx ? 'bg-medical' : 'bg-border'
                                }`}
                              />
                              <span>TRIAL 0{tIdx} — {tIdx === 1 ? t.teach.t1Name : tIdx === 2 ? t.teach.t2Name : t.teach.t3Name}</span>
                            </div>
                            {trial >= tIdx && (
                              <span className="text-medical font-bold">{t.teach.calibratedCheck}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {phase === 'learned' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <VoiceOutputPanel
                          command={commandText}
                          confidence={confidence}
                          onReTrainRequested={() => setPhase('idle')}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {phase === 'idle' && (
              <VoiceOutputPanel
                command={selectedCommand.phrase}
                confidence={selectedCommand.confidence}
                onReTrainRequested={() => setPhase('idle')}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
