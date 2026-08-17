import { useState } from 'react'
import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import { SplitLines } from '../ui/SplitText'

const PHRASES = [
  { text: '"YES."', raw: 'YES' },
  { text: '"NO."', raw: 'NO' },
  { text: '"HELP."', raw: 'HELP' },
  { text: '"I NEED WATER."', raw: 'I NEED WATER' },
]

export function HumanConnectionSection() {
  const [activeAudio, setActiveAudio] = useState<string | null>(null)

  const playVoice = (phrase: string) => {
    setActiveAudio(phrase)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(phrase)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.onend = () => setActiveAudio(null)
      utterance.onerror = () => setActiveAudio(null)
      window.speechSynthesis.speak(utterance)
    } else {
      setTimeout(() => setActiveAudio(null), 1000)
    }
  }

  return (
    <section
      id="vision"
      className="relative flex min-h-screen flex-col justify-center py-32 md:py-48"
      aria-label="Human connection"
    >
      <div className="mx-auto max-w-[1400px] px-6 text-center md:px-10">
        <span className="font-mono text-[10px] tracking-[0.35em] text-cyan-signal uppercase">
          Human Purpose & Dignity
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
          It&apos;s the innate human ability to communicate:
        </motion.p>

        <div className="flex flex-col items-center gap-6 md:gap-8">
          {PHRASES.map((item, i) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-5%' }}
              transition={{
                delay: 0.6 + i * 0.15,
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative flex items-center justify-center gap-4 cursor-pointer"
              onClick={() => playVoice(item.raw)}
            >
              <p className="font-display text-[clamp(1.75rem,4vw,3.25rem)] font-medium tracking-wide text-cream/90 transition-colors group-hover:text-cyan-signal">
                {item.text}
              </p>
              <button
                type="button"
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
                  activeAudio === item.raw
                    ? 'border-medical bg-medical/20 text-medical scale-110'
                    : 'border-border bg-glass text-cream-muted/50 group-hover:border-cyan-signal/40 group-hover:text-cyan-signal'
                }`}
                aria-label={`Hear synthesized voice for ${item.raw}`}
              >
                <Volume2 size={16} className={activeAudio === item.raw ? 'animate-pulse' : ''} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

