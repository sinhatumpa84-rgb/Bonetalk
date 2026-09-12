import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Sparkles, RefreshCw, ArrowRight } from 'lucide-react'
import { EMGWaveform } from '../ui/EMGWaveform'

type TeachPhase = 'idle' | 'capturing' | 'trials' | 'learned'

export function PersonalizeSection() {
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
    }, 1200)
    return () => clearTimeout(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'trials') return
    if (trial < 3) {
      const timer = setTimeout(() => setTrial((t) => t + 1), 1000)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => {
      setPhase('learned')
      const targetConf = +(95 + Math.random() * 3.5).toFixed(1)
      setConfidence(targetConf)
      setSavedCommands((prev) => {
        if (prev.some((item) => item.phrase === commandText)) return prev
        return [{ phrase: commandText, confidence: targetConf }, ...prev]
      })
    }, 600)
    return () => clearTimeout(timer)
  }, [phase, trial, commandText])

  return (
    <section id="personalize" className="bg-zinc-50 py-24 md:py-32 border-t border-zinc-200">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <span className="text-sm font-semibold tracking-wider text-emerald-700 uppercase">
              Adaptive Calibration
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 leading-tight">
              Teach BoneTalk your personal vocabulary.
            </h2>
            <p className="mt-4 text-base text-zinc-600 leading-relaxed font-normal">
              Every person has unique muscle activation signatures. Calibrate custom gestures in under 60 seconds with 3 short trial contractions.
            </p>

            <div className="mt-8 pt-6 border-t border-zinc-200">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-3">
                Active Vocabulary ({savedCommands.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {savedCommands.map((cmd) => (
                  <div
                    key={cmd.phrase}
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900"
                  >
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>{cmd.phrase}</span>
                    <span className="text-emerald-700">({cmd.confidence}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-2xl bg-white p-8 border border-zinc-200 shadow-sm">
            {phase === 'idle' && (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">
                  Gesture Calibration Suite
                </h3>
                <p className="text-sm text-zinc-600 max-w-sm mb-8 font-normal">
                  Record 3 contractions to map a custom phrase to your muscle signature.
                </p>

                <div className="flex flex-col gap-4 w-full max-w-md">
                  <button
                    type="button"
                    onClick={() => startTraining('I NEED WATER')}
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 py-3.5 px-4 text-base font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    Train &quot;I NEED WATER&quot; <ArrowRight size={18} />
                  </button>

                  <form onSubmit={handleCustomSubmit} className="flex gap-2 w-full">
                    <input
                      type="text"
                      placeholder="Enter custom phrase..."
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      className="flex-1 rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-600 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!customInput.trim()}
                      className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                    >
                      Train
                    </button>
                  </form>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {phase !== 'idle' && (
                <motion.div
                  key={phase}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-200">
                    <div>
                      <span className="text-xs text-zinc-500 font-semibold uppercase block">Target Phrase</span>
                      <span className="text-lg font-bold text-zinc-900">&quot;{commandText}&quot;</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      {phase === 'capturing' ? 'CAPTURING SIGNAL...' : phase === 'trials' ? `TRIAL 0${trial} IN PROGRESS` : 'LEARNED'}
                    </span>
                  </div>

                  <div className="rounded-xl bg-zinc-900 p-4 mb-6">
                    <EMGWaveform
                      width={550}
                      height={120}
                      amplitude={phase === 'learned' ? 0.75 : 1.1}
                      intensity={1}
                      color={phase === 'learned' ? '#10b981' : '#34d399'}
                      className="w-full"
                      showGrid={true}
                    />
                  </div>

                  {(phase === 'trials' || phase === 'learned') && (
                    <div className="space-y-2 mb-6">
                      {[1, 2, 3].map((t) => (
                        <div
                          key={t}
                          className={`flex items-center justify-between p-3 rounded-lg text-sm font-medium border ${
                            trial >= t
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                              : 'border-zinc-200 bg-zinc-50 text-zinc-400'
                          }`}
                        >
                          <span>Trial 0{t} — {t === 1 ? 'Extensor Flex' : t === 2 ? 'Flexor Hold' : 'Peak Burst'}</span>
                          {trial >= t && <span className="font-bold text-emerald-700">Calibrated ✓</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {phase === 'learned' && (
                    <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-emerald-700 block">Calibration Complete ({confidence}%)</span>
                        <span className="text-xs text-zinc-500">Neural weights stored to ESP32 flash memory</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPhase('idle')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-700 hover:text-zinc-900 bg-zinc-100 px-4 py-2 rounded-lg"
                      >
                        <RefreshCw size={14} /> Train Another
                      </button>
                    </div>
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
