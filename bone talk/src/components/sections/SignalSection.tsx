import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import {
  SIGNAL_COMMANDS,
  SIGNAL_PATTERNS,
  type SignalCommand,
} from '../../lib/constants'
import { EMGWaveform } from '../ui/EMGWaveform'
import { TechnicalGrid } from '../layout/TechnicalGrid'
import { useLanguage } from '../../context/LanguageContext'
import { speechService } from '../../lib/speechService'

export function SignalSection() {
  const [selected, setSelected] = useState<SignalCommand | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [confidence, setConfidence] = useState(0)
  const [detected, setDetected] = useState(false)
  const { currentLanguage, translateCommand, t } = useLanguage()

  const speakPhrase = useCallback((rawCmd: SignalCommand) => {
    const textToSpeak = translateCommand(rawCmd)
    const voices = speechService.getVoices()
    const chosenVoice = voices.find((v) => v.lang.startsWith(currentLanguage.code)) || null

    speechService.speak(textToSpeak, {
      voice: chosenVoice,
      rate: 0.95,
      pitch: 1.0,
    })
  }, [currentLanguage.code, translateCommand])

  const handleSelect = (cmd: SignalCommand) => {
    setSelected(cmd)
    setAnalyzing(true)
    setDetected(false)
    setConfidence(0)
  }

  useEffect(() => {
    if (!analyzing || !selected) return

    const target = SIGNAL_PATTERNS[selected].confidence
    let current = 0
    const interval = setInterval(() => {
      current += (target - current) * 0.18
      setConfidence(current)
      if (Math.abs(target - current) < 0.5) {
        setConfidence(target)
        setAnalyzing(false)
        setDetected(true)
        speakPhrase(selected)
        clearInterval(interval)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [analyzing, selected, speakPhrase])

  return (
    <section
      id="technology"
      className="relative flex min-h-screen flex-col justify-center py-24 md:py-32 border-b border-border"
      aria-label="Interactive signal reading"
    >
      <TechnicalGrid variant="default" />

      <div className="relative mx-auto w-full max-w-[1400px] px-6 md:px-10">
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="font-mono text-[10px] tracking-[0.35em] text-cyan-signal uppercase">
              {t.signal.eyebrow}
            </span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="mt-2 font-display text-[clamp(2rem,5vw,4rem)] font-bold tracking-[-0.02em] text-cream"
            >
              {t.signal.title}
            </motion.h2>
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-cream-muted md:text-sm">
            {t.signal.description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px] md:gap-8">
          <div className="rounded-sm border border-border bg-graphite-light/50 p-4 backdrop-blur-sm sm:p-6 md:p-8 surface-panel">
            <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-signal" />
                <span className="font-mono text-[10px] tracking-[0.25em] text-cream-muted uppercase font-semibold">
                  {t.signal.oscilloscopeTitle}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 font-mono text-[9px] sm:gap-4 sm:text-[10px]">
                <span className="text-cream-muted/70">FS: <span className="text-cream">1000 Hz</span></span>
                <span className="text-cream-muted/70">BAND: <span className="text-cream">20-450 Hz</span></span>
                <span className="text-cyan-signal font-semibold">
                  {selected ? `PATTERN: ${translateCommand(selected)}` : 'AWAITING INPUT'}
                </span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-sm border border-border bg-graphite p-2 sm:p-4 surface-instrument">
              <EMGWaveform
                height={160}
                command={selected}
                intensity={selected ? 1.3 : 0.7}
                className="w-full"
                showGrid={true}
              />

              <div className="pointer-events-none absolute top-2 left-3 font-mono text-[8px] sm:text-[9px] text-cream-muted/60">
                100 μV / div
              </div>
              <div className="pointer-events-none absolute bottom-2 right-3 font-mono text-[8px] sm:text-[9px] text-cream-muted/60">
                TIME: 50ms / div
              </div>
            </div>

            <AnimatePresence mode="wait">
              {(analyzing || detected) && selected && (
                <motion.div
                  key={selected}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 space-y-4 font-mono text-xs md:mt-8"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                    <span className="tracking-[0.2em] text-cream-muted uppercase text-[10px] sm:text-xs">
                      {t.signal.signalDetected}
                    </span>
                    <div className="flex flex-1 items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                        <motion.div
                          className="h-full bg-gradient-to-r from-cyan-signal to-medical"
                          initial={{ width: 0 }}
                          animate={{ width: `${confidence}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <span className="text-cyan-signal tabular-nums font-semibold text-xs sm:text-sm">
                        {confidence.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {detected && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-4 sm:gap-4"
                    >
                      <div>
                        <span className="block text-[8px] sm:text-[9px] tracking-[0.2em] text-cream-muted uppercase">
                          {t.signal.patternMatch}
                        </span>
                        <span className="font-display text-lg sm:text-xl font-bold text-cream tabular-nums">
                          {SIGNAL_PATTERNS[selected].confidence}%
                        </span>
                      </div>
                      <div>
                        <span className="block text-[8px] sm:text-[9px] tracking-[0.2em] text-cream-muted uppercase">
                          {t.signal.intentOutput}
                        </span>
                        <span className="font-display text-lg sm:text-xl font-bold text-medical">
                          {translateCommand(selected)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[8px] sm:text-[9px] tracking-[0.2em] text-cream-muted uppercase">
                          {t.signal.latency}
                        </span>
                        <span className="font-display text-lg sm:text-xl font-bold text-cyan-signal">
                          12.4 ms
                        </span>
                      </div>
                      <div className="col-span-2 flex items-end sm:col-span-1">
                        <button
                          type="button"
                          onClick={() => speakPhrase(selected)}
                          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-sm border border-cyan-signal/30 bg-cyan-signal/[0.08] px-3 py-2 font-mono text-[10px] text-cyan-signal transition-colors hover:bg-cyan-signal/[0.18] min-h-[38px] cursor-pointer font-bold"
                          title="Replay Voice Speech Synthesis"
                        >
                          <Volume2 size={12} /> {t.signal.playVoiceBtn}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col justify-between gap-3 rounded-sm border border-border bg-graphite-light/30 p-4 backdrop-blur-sm sm:p-6 surface-panel">
            <div>
              <span className="mb-3 block font-mono text-[10px] tracking-[0.25em] text-cream-muted uppercase sm:mb-4">
                {t.signal.selectCommand}
              </span>
              <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                {SIGNAL_COMMANDS.map((cmd) => (
                  <button
                    key={cmd}
                    type="button"
                    onClick={() => handleSelect(cmd)}
                    className={`group flex items-center justify-between border p-3.5 text-left transition-all duration-200 sm:px-5 sm:py-4 min-h-[50px] cursor-pointer ${
                      selected === cmd
                        ? 'border-cyan-signal/60 bg-cyan-signal/[0.08] shadow-[0_0_15px_var(--accent-glow)]'
                        : 'border-border bg-glass hover:border-cream/30 hover:bg-cream/[0.03]'
                    }`}
                    aria-pressed={selected === cmd}
                    aria-label={`Simulate ${cmd} muscle signal`}
                  >
                    <div className="min-w-0 pr-2">
                      <span className="block font-mono text-sm tracking-[0.2em] font-semibold text-cream">
                        {translateCommand(cmd)} <span className="text-[10px] font-normal text-cream-muted">({cmd})</span>
                      </span>
                      <span className="block font-mono text-[8px] sm:text-[9px] text-cream-muted/70 truncate">
                        {cmd === 'YES' && 'Single Flex (Extensor)'}
                        {cmd === 'NO' && 'Double Twitch (Flexor)'}
                        {cmd === 'HELP' && 'Sustained Isometric Hold'}
                        {cmd === 'WATER' && 'Sequential Dual Burst'}
                      </span>
                    </div>
                    <span
                      className={`h-2 w-2 flex-shrink-0 rounded-full transition-all ${
                        selected === cmd ? 'bg-cyan-signal shadow-[0_0_8px_var(--color-cyan-signal)]' : 'bg-border group-hover:bg-cream/40'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-3 font-mono text-[9px] sm:text-[10px] text-cream-muted/60 sm:pt-4">
              ⚡ Real-time neural inference powered by ESP32-S3 TinyML engine.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
