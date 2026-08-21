import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, MessageSquare, Volume2 } from 'lucide-react'

export function ExpLanguageSection() {
  const [activeWord, setActiveWord] = useState<'YES' | 'NO' | 'HELP' | 'WATER'>('YES')

  const intentPhrases: Record<
    'YES' | 'NO' | 'HELP' | 'WATER',
    { phrase: string; emgSignature: string; context: string }
  > = {
    YES: {
      phrase: '“Yes, I understand and agree.”',
      emgSignature: 'Single sharp 420μV laryngeal burst • 0.3s duration',
      context: 'Affirmative confirmation / Social response',
    },
    NO: {
      phrase: '“No, that is not what I need.”',
      emgSignature: 'Double rhythmic 380μV bi-phase wave • 0.5s duration',
      context: 'Negative selection / Boundary intent',
    },
    HELP: {
      phrase: '“Please come here, I need assistance.”',
      emgSignature: 'High-frequency 650μV sustained motor activation • 0.8s',
      context: 'High-priority alert / Caregiver communication',
    },
    WATER: {
      phrase: '“Could I please have a glass of water?”',
      emgSignature: 'Sinuous multi-stage 490μV swallow potential • 0.6s',
      context: 'Daily autonomy / Essential physiological request',
    },
  }

  return (
    <section className="relative min-h-screen w-full bg-black text-white flex flex-col justify-center py-28 px-6 sm:px-12 md:px-20 overflow-hidden border-t border-neutral-900">
      {/* Background glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 h-[400px] w-[500px] rounded-full bg-cyan-950/20 blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* ── Section Label ── */}
        <div className="flex items-center gap-3 mb-6">
          <span className="h-[1.5px] w-8 bg-cyan-400" />
          <span className="font-mono text-xs tracking-[0.35em] text-cyan-400 uppercase">
            SECTION 05 / THE LANGUAGE
          </span>
        </div>

        {/* ── Oversized Editorial Headline ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-baseline mb-16">
          <h2 className="lg:col-span-8 font-display text-4xl sm:text-6xl md:text-7xl tracking-[-0.01em] font-light leading-[1.05] uppercase text-white">
            SIGNAL BECOMES <br />
            <span className="text-cyan-400 font-normal">LANGUAGE.</span>
          </h2>
          <div className="lg:col-span-4 flex flex-col gap-4">
            <p className="font-mono text-xs tracking-[0.2em] text-neutral-500 uppercase">
              SEMANTICS / 04
            </p>
            <p className="font-body text-sm text-neutral-400 leading-relaxed font-light">
              From discrete binary intent to rich conversational syntax. The AI model translates subtle muscle memory contractions into fully articulated human voice.
            </p>
          </div>
        </div>

        {/* ── Interactive Intent Decoding Console ── */}
        <div className="p-8 sm:p-12 border border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl rounded-xs mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/70 pb-6 mb-8">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-400" />
              <span className="font-mono text-xs tracking-widest text-neutral-400 uppercase">
                INTERACTIVE INTENTION MATRIX
              </span>
            </div>
            <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
              SELECT MUSCLE PATTERN TO DECODE
            </span>
          </div>

          {/* 4 Muscle Intent Trigger Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {(['YES', 'NO', 'HELP', 'WATER'] as const).map((word) => {
              const isSelected = activeWord === word
              return (
                <button
                  key={word}
                  type="button"
                  onClick={() => setActiveWord(word)}
                  className={`p-4 sm:p-6 border transition-all text-center cursor-pointer ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                      : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700 hover:text-white'
                  }`}
                >
                  <span className="font-display text-2xl sm:text-3xl tracking-widest font-light block mb-1">
                    {word}
                  </span>
                  <span className="font-mono text-[9px] tracking-widest text-neutral-500 uppercase">
                    PATTERN {word === 'YES' ? '01' : word === 'NO' ? '02' : word === 'HELP' ? '03' : '04'}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Decoded Natural Language Projection Screen */}
          <div className="p-8 border border-neutral-800 bg-black/60 rounded-xs flex flex-col items-center justify-center min-h-[160px] text-center relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeWord}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="flex items-center gap-2 text-cyan-400">
                  <Volume2 size={16} className="animate-pulse" />
                  <span className="font-mono text-[10px] tracking-widest uppercase">
                    SYNTHESIZED VOCAL OUTPUT
                  </span>
                </div>

                <p className="font-display text-2xl sm:text-4xl text-white tracking-wide font-light max-w-2xl">
                  {intentPhrases[activeWord].phrase}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-6 mt-3 font-mono text-[10px] text-neutral-500">
                  <span>SIGNATURE: {intentPhrases[activeWord].emgSignature}</span>
                  <span>•</span>
                  <span>CONTEXT: {intentPhrases[activeWord].context}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Subtitle Callout ── */}
        <div className="flex items-center gap-3 text-neutral-500 font-mono text-xs tracking-widest uppercase">
          <MessageSquare size={14} className="text-cyan-400" />
          <span>CONTINUOUS VOCABULARY EXPANSION VIA ADAPTIVE ON-DEVICE LEARNING</span>
        </div>
      </div>
    </section>
  )
}
