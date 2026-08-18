import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, Settings, CheckCircle2, Play, AlertCircle, RefreshCw } from 'lucide-react'
import { speechService } from '../../lib/speechService'
import { useLanguage } from '../../context/LanguageContext'

export interface VoiceOutputPanelProps {
  command: string
  confidence: number
  onReTrainRequested?: () => void
  className?: string
}

export function VoiceOutputPanel({
  command,
  confidence,
  onReTrainRequested,
  className = '',
}: VoiceOutputPanelProps) {
  const { currentLanguage, translateCommand } = useLanguage()
  const [speechState, setSpeechState] = useState<'idle' | 'speaking' | 'completed' | 'unsupported'>('idle')
  const [showSettings, setShowSettings] = useState(false)
  
  // Voice Settings State
  const [rate, setRate] = useState(1.0)
  const [pitch, setPitch] = useState(1.0)
  const [volume, setVolume] = useState(1.0)
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('')
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])

  const isSupported = speechService.isSupported()
  const localizedText = translateCommand(command)

  useEffect(() => {
    if (!isSupported) {
      setSpeechState('unsupported')
      return
    }

    const loadVoices = () => {
      const voices = speechService.getVoices()
      setAvailableVoices(voices)
      if (voices.length > 0) {
        setSelectedVoiceName((prev) => {
          if (prev) return prev
          // Match voice language if available
          const langMatch = voices.find((v) => v.lang.startsWith(currentLanguage.code))
          const defaultVoice = langMatch || voices.find((v) => v.lang.startsWith('en')) || voices[0]
          return defaultVoice ? defaultVoice.name : ''
        })
      }
    }

    loadVoices()
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [isSupported, currentLanguage])

  const handlePlayVoice = (overrideText?: string) => {
    if (!isSupported) {
      setSpeechState('unsupported')
      return
    }

    const textToSpeak = overrideText || localizedText
    if (!textToSpeak) return

    setSpeechState('speaking')

    const chosenVoice = availableVoices.find((v) => v.name === selectedVoiceName) || null

    const success = speechService.speak(textToSpeak, {
      voice: chosenVoice,
      rate,
      pitch,
      volume,
      onStart: () => setSpeechState('speaking'),
      onEnd: () => {
        setSpeechState('completed')
      },
      onError: () => {
        setSpeechState('idle')
      },
    })

    if (!success) {
      setSpeechState('unsupported')
    }
  }

  return (
    <div className={`rounded-sm border border-border bg-graphite-light/70 p-5 backdrop-blur-sm sm:p-6 ${className}`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-border pb-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-signal animate-pulse" />
          <span className="font-mono text-[10px] tracking-[0.25em] text-cyan-signal uppercase font-semibold">
            VOICE OUTPUT ENGINE ({currentLanguage.nativeName})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isSupported && (
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-1.5 rounded-sm border px-2.5 py-1 font-mono text-[10px] transition-colors cursor-pointer ${
                showSettings
                  ? 'border-cyan-signal text-cyan-signal bg-cyan-signal/[0.1]'
                  : 'border-border text-cream-muted hover:text-cream'
              }`}
              title="Voice Engine Settings"
            >
              <Settings size={12} />
              <span>VOICE CONFIG</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Command & Confidence Readout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-center mb-6">
        <div className="rounded-sm border border-border bg-graphite p-3.5">
          <span className="block font-mono text-[9px] tracking-[0.2em] text-cream-muted uppercase mb-1">
            TRAINED COMMAND ({currentLanguage.name})
          </span>
          <span className="font-mono text-base font-bold text-cream uppercase tracking-wide">
            &quot;{localizedText}&quot; <span className="text-xs text-cream-muted font-normal">[{command}]</span>
          </span>
        </div>

        <div className="rounded-sm border border-border bg-graphite p-3.5 flex items-center justify-between">
          <div>
            <span className="block font-mono text-[9px] tracking-[0.2em] text-cream-muted uppercase mb-1">
              AI CONFIDENCE
            </span>
            <span className="font-mono text-base font-bold text-cyan-signal tabular-nums">
              {confidence > 0 ? `${confidence.toFixed(1)}%` : 'CALIBRATED'}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-medical font-medium">
            <CheckCircle2 size={13} /> READY
          </span>
        </div>
      </div>

      {/* Voice Settings Panel (Compact Dropdown) */}
      <AnimatePresence>
        {showSettings && isSupported && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6 border-b border-border pb-5"
          >
            <div className="rounded-sm border border-border/80 bg-graphite p-4 space-y-4">
              <span className="block font-mono text-[10px] tracking-[0.2em] text-cyan-signal uppercase font-bold">
                SPEECH PARAMETERS ({currentLanguage.name})
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Voice Selection */}
                <div>
                  <label className="block font-mono text-[9px] text-cream-muted uppercase mb-1">
                    SYNTHESIS VOICE
                  </label>
                  <select
                    value={selectedVoiceName}
                    onChange={(e) => setSelectedVoiceName(e.target.value)}
                    className="w-full rounded-sm border border-border bg-graphite-light px-2.5 py-1.5 font-mono text-xs text-cream focus:border-cyan-signal focus:outline-none"
                  >
                    {availableVoices.length === 0 ? (
                      <option value="">Default System Voice</option>
                    ) : (
                      availableVoices.map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name} ({v.lang})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Speed / Rate */}
                <div>
                  <div className="flex justify-between font-mono text-[9px] text-cream-muted uppercase mb-1">
                    <span>SPEED RATE</span>
                    <span className="text-cream">{rate.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="w-full accent-cyan-signal cursor-pointer"
                  />
                </div>

                {/* Pitch */}
                <div>
                  <div className="flex justify-between font-mono text-[9px] text-cream-muted uppercase mb-1">
                    <span>PITCH</span>
                    <span className="text-cream">{pitch.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full accent-cyan-signal cursor-pointer"
                  />
                </div>

                {/* Volume */}
                <div>
                  <div className="flex justify-between font-mono text-[9px] text-cream-muted uppercase mb-1">
                    <span>VOLUME</span>
                    <span className="text-cream">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full accent-cyan-signal cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handlePlayVoice(localizedText)}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-cyan-signal/40 bg-cyan-signal/[0.1] px-3 py-1 font-mono text-[10px] text-cyan-signal hover:bg-cyan-signal/[0.2] transition-colors cursor-pointer"
                >
                  <Play size={11} /> TEST VOICE CONFIG
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interactive Play Voice Area */}
      <div className="flex flex-col items-center justify-center p-6 rounded-sm border border-border bg-graphite text-center relative overflow-hidden">
        
        {/* Animated Speech Equalizer Waveform */}
        <div className="h-10 flex items-center justify-center gap-1 mb-4">
          {[12, 24, 38, 54, 42, 28, 16, 32, 48, 22].map((height, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full bg-cyan-signal"
              animate={{
                height: speechState === 'speaking'
                  ? [`${height * 0.3}px`, `${height}px`, `${height * 0.4}px`]
                  : '6px',
                opacity: speechState === 'speaking' ? [0.5, 1, 0.6] : 0.25,
              }}
              transition={{
                duration: speechState === 'speaking' ? 0.35 + (i % 3) * 0.1 : 0.2,
                repeat: speechState === 'speaking' ? Infinity : 0,
                repeatType: 'reverse',
              }}
            />
          ))}
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          disabled={speechState === 'unsupported'}
          onClick={() => handlePlayVoice()}
          className={`relative group inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-sm font-mono text-sm font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer min-h-[48px] w-full max-w-sm ${
            speechState === 'speaking'
              ? 'border-cyan-signal bg-cyan-signal/20 text-cream shadow-[0_0_20px_rgba(0,168,137,0.3)] animate-pulse'
              : speechState === 'unsupported'
              ? 'border-border bg-graphite-light text-cream-muted cursor-not-allowed opacity-60'
              : 'border-cyan-signal/60 bg-cyan-signal/10 hover:bg-cyan-signal/20 text-cream hover:border-cyan-signal shadow-sm'
          }`}
          aria-label={`Play voice audio for ${localizedText}`}
        >
          {speechState === 'speaking' ? (
            <>
              <Volume2 size={18} className="text-cyan-signal animate-bounce" />
              <span>SPEAKING...</span>
            </>
          ) : speechState === 'unsupported' ? (
            <>
              <VolumeX size={18} />
              <span>VOICE OUTPUT UNAVAILABLE</span>
            </>
          ) : (
            <>
              <Volume2 size={18} className="text-cyan-signal group-hover:scale-110 transition-transform" />
              <span>PLAY VOICE &quot;{localizedText}&quot;</span>
            </>
          )}
        </button>

        {/* Dynamic Status Feedback Message */}
        <div className="mt-4 font-mono text-xs">
          {speechState === 'speaking' && (
            <span className="text-cyan-signal animate-pulse flex items-center justify-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-signal" />
              SYNTHESIZING SPEECH AUDIO ({currentLanguage.name})
            </span>
          )}

          {speechState === 'completed' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-medical font-medium flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 size={14} />
              <span>✓ COMMAND SPOKEN — &quot;{localizedText}&quot;</span>
            </motion.div>
          )}

          {speechState === 'idle' && (
            <span className="text-cream-muted">
              SPEECH READY — Click to synthesize vocal audio ({currentLanguage.nativeName})
            </span>
          )}

          {speechState === 'unsupported' && (
            <span className="text-amber-500/90 flex items-center justify-center gap-1.5">
              <AlertCircle size={14} />
              Speech synthesis is not supported in this browser.
            </span>
          )}
        </div>

        {onReTrainRequested && (
          <button
            type="button"
            onClick={onReTrainRequested}
            className="mt-6 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] text-cream-muted uppercase hover:text-cyan-signal transition-colors cursor-pointer"
          >
            <RefreshCw size={11} /> TRAIN ANOTHER COMMAND
          </button>
        )}

      </div>
    </div>
  )
}
