import { motion } from 'framer-motion'
import { VolumeX, Volume2, Mic, Music } from 'lucide-react'

export function ExpVoiceSection() {
  const bars = Array.from({ length: 48 }, (_, i) => i)

  return (
    <section className="relative min-h-screen w-full bg-white text-neutral-900 flex flex-col justify-center py-28 px-6 sm:px-12 md:px-20 overflow-hidden border-t border-neutral-100">
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* ── Section Label ── */}
        <div className="flex items-center gap-3 mb-6">
          <span className="h-[1.5px] w-8 bg-neutral-900" />
          <span className="font-mono text-xs tracking-[0.35em] text-neutral-500 uppercase">
            SECTION 06 / THE VOICE
          </span>
        </div>

        {/* ── Oversized Editorial Headline ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-baseline mb-20">
          <h2 className="lg:col-span-8 font-display text-4xl sm:text-6xl md:text-7xl tracking-[-0.02em] font-light leading-[1.05] uppercase">
            FROM INTENTION <br />
            <span className="font-normal italic">TO EXPRESSION.</span>
          </h2>
          <div className="lg:col-span-4 flex flex-col gap-4">
            <p className="font-mono text-xs tracking-[0.2em] text-neutral-500 uppercase">
              ACOUSTICS / 05
            </p>
            <p className="font-body text-sm text-neutral-600 leading-relaxed font-light">
              Restoring more than just communication — restoring personal cadence, emotional inflection, and identity. A voice uniquely tuned to the wearer.
            </p>
          </div>
        </div>

        {/* ── Harmonic Acoustic Spectrum Wave Visualization ── */}
        <div className="p-8 sm:p-12 border border-neutral-200 bg-neutral-50/60 rounded-xs mb-20">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-6 mb-8">
            <div className="flex items-center gap-3">
              <Volume2 size={18} className="text-neutral-900" />
              <span className="font-mono text-xs tracking-widest text-neutral-500 uppercase">
                HARMONIC FREQUENCY SPECTRUM (100 HZ – 8,000 HZ)
              </span>
            </div>
            <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
              NEURAL TTS SYNTHESIS
            </span>
          </div>

          {/* Dynamic Audio Bars Array */}
          <div className="h-44 sm:h-56 flex items-end justify-between gap-1 sm:gap-2 px-4 py-6 bg-white border border-neutral-200 rounded-xs overflow-hidden">
            {bars.map((b) => {
              const delay = (b % 12) * 0.08
              const heightMultiplier = Math.sin((b / bars.length) * Math.PI) * 85 + 15
              return (
                <motion.div
                  key={b}
                  className="flex-1 bg-neutral-900 rounded-full"
                  animate={{
                    height: [
                      `${Math.max(10, heightMultiplier * 0.3)}%`,
                      `${Math.min(95, heightMultiplier * 1.1)}%`,
                      `${Math.max(15, heightMultiplier * 0.6)}%`,
                    ],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.4 + (b % 5) * 0.2,
                    delay,
                    ease: 'easeInOut',
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* ── 3 Voice Restoration Features ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 border border-neutral-200 bg-white flex flex-col justify-between">
            <div>
              <Mic size={20} className="text-neutral-900 mb-6" />
              <span className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase block mb-1">
                ACOUSTIC SYNTHESIS
              </span>
              <h3 className="font-display text-xl font-medium uppercase text-neutral-900 mb-2">
                PERSONALIZED TIMBRE
              </h3>
            </div>
            <p className="font-body text-xs text-neutral-600 leading-relaxed font-light mt-4">
              Calibrated to mirror your natural pitch range, resonance characteristics, and vocal personality.
            </p>
          </div>

          <div className="p-8 border border-neutral-200 bg-white flex flex-col justify-between">
            <div>
              <Music size={20} className="text-neutral-900 mb-6" />
              <span className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase block mb-1">
                EMOTIONAL INFLECTION
              </span>
              <h3 className="font-display text-xl font-medium uppercase text-neutral-900 mb-2">
                PROSODIC INTENT
              </h3>
            </div>
            <p className="font-body text-xs text-neutral-600 leading-relaxed font-light mt-4">
              Differentiates between urgent declarations, calm acknowledgments, and questions through muscle dynamics.
            </p>
          </div>

          <div className="p-8 border border-neutral-200 bg-white flex flex-col justify-between">
            <div>
              <VolumeX size={20} className="text-neutral-900 mb-6" />
              <span className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase block mb-1">
                SILENT OPERATION
              </span>
              <h3 className="font-display text-xl font-medium uppercase text-neutral-900 mb-2">
                TOTAL PRIVACY
              </h3>
            </div>
            <p className="font-body text-xs text-neutral-600 leading-relaxed font-light mt-4">
              Speak in noisy rooms or in complete quiet without emitting audible sound until desired.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
