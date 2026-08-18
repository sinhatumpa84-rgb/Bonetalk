import { useState } from 'react'
import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import { SplitLines } from '../ui/SplitText'
import { useLanguage } from '../../context/LanguageContext'
import { speechService } from '../../lib/speechService'

const PHRASES = ['YES', 'NO', 'HELP', 'I NEED WATER']

export function HumanConnectionSection() {
  const [activeAudio, setActiveAudio] = useState<string | null>(null)
  const { currentLanguage, translateCommand } = useLanguage()

  const playVoice = (rawPhrase: string) => {
    const textToSpeak = translateCommand(rawPhrase)
    setActiveAudio(rawPhrase)

    const voices = speechService.getVoices()
    const chosenVoice = voices.find((v) => v.lang.startsWith(currentLanguage.code)) || null

    speechService.speak(textToSpeak, {
      voice: chosenVoice,
      rate: 0.9,
      pitch: 1.0,
      onStart: () => setActiveAudio(rawPhrase),
      onEnd: () => setActiveAudio(null),
      onError: () => setActiveAudio(null),
    })
  }

  return (
    <section
      id="vision"
      className="relative flex min-h-screen flex-col justify-center py-32 md:py-48 border-b border-border"
      aria-label="Human connection"
    >
      <div className="mx-auto max-w-[1400px] px-6 text-center md:px-10">
        <span className="font-mono text-[10px] tracking-[0.35em] text-cyan-signal uppercase">
          Human Purpose &amp; Dignity
        </span>

        <SplitLines
          lines={['A VOICE', 'IS MORE THAN SOUND.']}
          className="mt-4 mb-16"
          lineClassName="font-display text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[1] tracking-[-0.02em] text-cream"
        />

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-12 text-sm text-cream-muted md:text-base font-mono tracking-wide"
        >
          It&apos;s the innate human ability to communicate ({currentLanguage.nativeName}):
        </motion.p>

        <div className="flex flex-col items-center gap-6 md:gap-8">
          {PHRASES.map((rawCmd, i) => {
            const translatedText = translateCommand(rawCmd)
            const isPlaying = activeAudio === rawCmd

            return (
              <motion.div
                key={rawCmd}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-5%' }}
                transition={{
                  delay: 0.6 + i * 0.15,
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative flex items-center justify-center gap-4 cursor-pointer"
                onClick={() => playVoice(rawCmd)}
              >
                <p className="font-display text-[clamp(1.75rem,4vw,3.25rem)] font-medium tracking-wide text-cream/90 transition-colors group-hover:text-cyan-signal">
                  &quot;{translatedText}.&quot;
                </p>
                <button
                  type="button"
                  className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
                    isPlaying
                      ? 'border-medical bg-medical/20 text-medical scale-110'
                      : 'border-border bg-glass text-cream-muted/50 group-hover:border-cyan-signal/40 group-hover:text-cyan-signal'
                  }`}
                  aria-label={`Hear synthesized voice for ${translatedText}`}
                >
                  <Volume2 size={16} className={isPlaying ? 'animate-pulse' : ''} />
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
