import { useState } from 'react'
import { Volume2, ArrowRight } from 'lucide-react'

const PHRASES = [
  { text: '"YES."', raw: 'YES' },
  { text: '"NO."', raw: 'NO' },
  { text: '"HELP."', raw: 'HELP' },
  { text: '"I NEED WATER."', raw: 'I NEED WATER' },
]

export function VisionSection() {
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
    <section id="vision" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-semibold tracking-wider text-emerald-700 uppercase">
            Human Dignity & Purpose
          </span>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 leading-tight">
            A voice is more than sound.
          </h2>
          <p className="mt-4 text-lg text-zinc-600 leading-relaxed font-normal">
            It is the fundamental human right to communicate intent, needs, and emotion without barriers.
          </p>
        </div>

        {/* Phrases Interactive Playback Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-20">
          {PHRASES.map((item) => (
            <button
              key={item.raw}
              type="button"
              onClick={() => playVoice(item.raw)}
              className={`flex items-center justify-between p-6 rounded-2xl border text-left transition-all ${
                activeAudio === item.raw
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-md ring-2 ring-emerald-600'
                  : 'border-zinc-200 bg-zinc-50 hover:bg-white hover:border-zinc-300 text-zinc-800'
              }`}
            >
              <span className="font-bold text-xl">{item.text}</span>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                activeAudio === item.raw ? 'bg-emerald-600 text-white' : 'bg-zinc-200 text-zinc-600'
              }`}>
                <Volume2 size={18} className={activeAudio === item.raw ? 'animate-bounce' : ''} />
              </div>
            </button>
          ))}
        </div>

        {/* Final CTA Box */}
        <div className="rounded-3xl bg-zinc-900 p-10 md:p-16 text-center text-white shadow-2xl max-w-5xl mx-auto relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Ready to explore BoneTalk?
            </h3>
            <p className="text-zinc-300 text-lg mb-8 font-normal">
              Join us in advancing accessible neurotechnology for non-verbal communication.
            </p>
            <a
              href="#technology"
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-8 py-4 text-lg font-semibold text-white transition-all shadow-lg hover:shadow-emerald-900/30"
            >
              Get Started <ArrowRight size={20} />
            </a>
          </div>
        </div>

        {/* Clean Minimal Footer */}
        <footer className="mt-24 pt-8 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500 font-medium">
          <div className="flex items-center gap-3">
            <span className="font-bold text-zinc-900 text-base">BoneTalk</span>
            <span className="text-xs bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded-full border border-zinc-200">
              v2.4 Prototype
            </span>
          </div>
          <p className="text-xs text-center sm:text-left">
            Assistive Neurotechnology Project • EMG Sensing & ESP32-S3 TinyML
          </p>
          <p className="text-xs">
            © 2026 BoneTalk Contributors. All rights reserved.
          </p>
        </footer>
      </div>
    </section>
  )
}
