import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Zap, Radio } from 'lucide-react'
import type { ProductVariant } from '../data/productVariants'

interface ExpSignalSectionProps {
  variant: ProductVariant
}

export function ExpSignalSection({ variant }: ExpSignalSectionProps) {
  const [isSimulating, setIsSimulating] = useState(true)
  const [microvolts, setMicrovolts] = useState(142.6)

  // Real-time microvolt telemetry simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const base = isSimulating ? 380 : 45
      const jitter = (Math.random() - 0.5) * (isSimulating ? 120 : 15)
      setMicrovolts(Number((base + jitter).toFixed(1)))
    }, 150)
    return () => clearInterval(interval)
  }, [isSimulating])

  return (
    <section className="relative min-h-screen w-full bg-black text-white flex flex-col justify-center py-28 px-6 sm:px-12 md:px-20 overflow-hidden border-t border-neutral-900">
      {/* ── Background Subtle Glow ── */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 h-[450px] w-[600px] rounded-full bg-cyan-950/25 blur-[160px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* ── Section Label ── */}
        <div className="flex items-center gap-3 mb-6">
          <span className="h-[1.5px] w-8 bg-cyan-400" />
          <span className="font-mono text-xs tracking-[0.35em] text-cyan-400 uppercase">
            SECTION 03 / THE SIGNAL
          </span>
        </div>

        {/* ── Oversized Editorial Headline ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-baseline mb-16">
          <h2 className="lg:col-span-8 font-display text-4xl sm:text-6xl md:text-7xl tracking-[-0.01em] font-light leading-[1.05] uppercase text-white">
            EVERY MOVEMENT <br />
            <span className="text-cyan-400 font-normal">LEAVES A SIGNAL.</span>
          </h2>
          <div className="lg:col-span-4 flex flex-col gap-4">
            <p className="font-mono text-xs tracking-[0.2em] text-neutral-500 uppercase">
              ELECTROMYOGRAPHY / 02
            </p>
            <p className="font-body text-sm text-neutral-400 leading-relaxed font-light">
              Even in the absence of vocal cord resonance, microscopic neural motor potentials travel across laryngeal musculature. SAAKANTHA captures these sub-millivolt potentials with clinical fidelity.
            </p>
          </div>
        </div>

        {/* ── Real-Time Signal Acquisition Oscilloscope Frame ── */}
        <div className="p-6 sm:p-10 border border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl mb-16 rounded-xs">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/70 pb-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_12px_#22d3ee]" />
              <div>
                <span className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase block">
                  SURFACE EMG ARRAY TELEMETRY
                </span>
                <span className="font-mono text-xs text-white">
                  CHANNEL 01 & 02 • DIFFERENTIAL DUAL DISC
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider">
                  AMPLITUDE:
                </span>
                <span className="font-mono text-xs text-cyan-300 font-medium">
                  {microvolts} μV
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider">
                  SNR:
                </span>
                <span className="font-mono text-xs text-neutral-300">
                  {isSimulating ? '38.4 dB' : '12.1 dB'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSimulating(!isSimulating)}
                className={`px-3 py-1.5 rounded-xs font-mono text-[9px] uppercase tracking-widest transition-all cursor-pointer border ${
                  isSimulating
                    ? 'border-cyan-400/80 bg-cyan-950/50 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                    : 'border-neutral-700 bg-neutral-900 text-neutral-400'
                }`}
              >
                {isSimulating ? 'ACTIVE IMPULSE' : 'IDLE NOISE'}
              </button>
            </div>
          </div>

          {/* SVG Animated Waveform Canvas */}
          <div className="relative h-44 sm:h-56 w-full flex items-center justify-center overflow-hidden bg-black/60 border border-neutral-900 rounded-xs">
            {/* Grid Overlay */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(34,211,238,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(34,211,238,0.15) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            {/* Simulated Live EMG Waveform SVG */}
            <svg className="w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
              {/* Baseline center line */}
              <line x1="0" y1="100" x2="1000" y2="100" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />

              {/* Dynamic Wave path */}
              <motion.path
                d={
                  isSimulating
                    ? 'M 0 100 Q 50 100, 100 100 T 200 95 T 300 105 T 380 40 T 420 160 T 460 25 T 500 175 T 540 50 T 600 105 T 700 98 T 800 100 T 1000 100'
                    : 'M 0 100 Q 100 98, 200 102 T 400 99 T 600 101 T 800 99 T 1000 100'
                }
                fill="none"
                stroke={variant.ledColor || '#22d3ee'}
                strokeWidth="2.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />

              {/* Secondary Harmonic Wave */}
              <motion.path
                d={
                  isSimulating
                    ? 'M 0 100 Q 60 100, 120 100 T 220 97 T 320 103 T 390 60 T 430 140 T 470 45 T 510 155 T 550 70 T 610 103 T 720 99 T 820 100 T 1000 100'
                    : 'M 0 100 Q 120 99, 240 101 T 480 100 T 720 99 T 1000 100'
                }
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.2"
                strokeDasharray="2 2"
              />
            </svg>

            {/* Sweep Scanline */}
            <motion.div
              className="absolute top-0 bottom-0 w-[2px] bg-cyan-300 shadow-[0_0_15px_#22d3ee]"
              animate={{ left: ['0%', '100%'] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
            />
          </div>
        </div>

        {/* ── 3 Signal Engineering Pillars ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border border-neutral-900 bg-neutral-950/40">
            <Activity size={18} className="text-cyan-400 mb-4" />
            <span className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase block mb-1">
              SAMPLING RATE
            </span>
            <span className="font-display text-2xl font-light text-white block mb-2">
              2,000 HZ ANALOG
            </span>
            <p className="font-body text-xs text-neutral-500 leading-relaxed">
              Sub-millisecond resolution captures instantaneous micro-contractile bursts before signal decay.
            </p>
          </div>

          <div className="p-6 border border-neutral-900 bg-neutral-950/40">
            <Zap size={18} className="text-cyan-400 mb-4" />
            <span className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase block mb-1">
              VOLTAGE SENSITIVITY
            </span>
            <span className="font-display text-2xl font-light text-white block mb-2">
              ± 0.5 MICROVOLTS
            </span>
            <p className="font-body text-xs text-neutral-500 leading-relaxed">
              Ultra-low noise instrumentation amplifiers extract pure biological signal from environmental noise.
            </p>
          </div>

          <div className="p-6 border border-neutral-900 bg-neutral-950/40">
            <Radio size={18} className="text-cyan-400 mb-4" />
            <span className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase block mb-1">
              DISC ARRAY CONTACT
            </span>
            <span className="font-display text-2xl font-light text-white block mb-2">
              DUAL DIFFERENTIAL
            </span>
            <p className="font-body text-xs text-neutral-500 leading-relaxed">
              Twin gold-plated circular terminals establish stable, motion-artifact-resistant electrical contact.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
