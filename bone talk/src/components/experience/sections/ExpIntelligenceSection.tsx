import { motion } from 'framer-motion'
import { ArrowRight, Cpu, Network, Sparkles, Binary } from 'lucide-react'

export function ExpIntelligenceSection() {
  const pipelineSteps = [
    {
      step: '01',
      title: 'MUSCLE',
      desc: 'Sub-vocal intention triggers microscopic laryngeal motor unit activation.',
      sub: 'Bio-electric source',
    },
    {
      step: '02',
      title: 'SIGNAL',
      desc: 'Dual circular electrode discs capture microvolt analog waveform data.',
      sub: '2,000 Hz ADC',
    },
    {
      step: '03',
      title: 'PROCESSING',
      desc: 'ESP32-S3 dual-core MCU applies digital bandpass filtering and wavelet extraction.',
      sub: 'Sub-15ms edge compute',
    },
    {
      step: '04',
      title: 'AI',
      desc: 'Neural pattern classifier decodes intention vector with 97.4% confidence score.',
      sub: 'Adaptive inference model',
    },
  ]

  return (
    <section className="relative min-h-screen w-full bg-white text-neutral-900 flex flex-col justify-center py-28 px-6 sm:px-12 md:px-20 overflow-hidden border-t border-neutral-100">
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* ── Section Label ── */}
        <div className="flex items-center gap-3 mb-6">
          <span className="h-[1.5px] w-8 bg-neutral-900" />
          <span className="font-mono text-xs tracking-[0.35em] text-neutral-500 uppercase">
            SECTION 04 / THE INTELLIGENCE
          </span>
        </div>

        {/* ── Oversized Editorial Headline ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-baseline mb-20">
          <h2 className="lg:col-span-8 font-display text-4xl sm:text-6xl md:text-7xl tracking-[-0.02em] font-light leading-[1.05] uppercase">
            NEURAL PIPELINE. <br />
            <span className="font-normal italic">EDGE COMPUTING.</span>
          </h2>
          <div className="lg:col-span-4 flex flex-col gap-4">
            <p className="font-mono text-xs tracking-[0.2em] text-neutral-500 uppercase">
              ARCHITECTURE / 03
            </p>
            <p className="font-body text-sm text-neutral-600 leading-relaxed font-light">
              No cloud latency. No external dependency. The entire machine learning inference engine operates locally on the wearable silicon at the speed of thought.
            </p>
          </div>
        </div>

        {/* ── Pipeline Progression Cards (MUSCLE → SIGNAL → PROCESSING → AI) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {pipelineSteps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="p-8 border border-neutral-200 bg-neutral-50/50 flex flex-col justify-between min-h-[260px] relative group hover:border-neutral-900 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="font-mono text-xs text-neutral-400 font-semibold tracking-widest">
                    {step.step}
                  </span>
                  {i < pipelineSteps.length - 1 && (
                    <ArrowRight size={14} className="text-neutral-300 group-hover:text-neutral-900 transition-colors" />
                  )}
                </div>

                <h3 className="font-display text-2xl font-medium tracking-wide uppercase text-neutral-900 mb-2">
                  {step.title}
                </h3>
                <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase block mb-4">
                  {step.sub}
                </span>
              </div>

              <p className="font-body text-xs text-neutral-600 leading-relaxed font-light">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ── Technical Edge Architecture Metrics ── */}
        <div className="p-8 sm:p-12 border border-neutral-200 bg-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col gap-2">
            <Cpu size={18} className="text-neutral-900 mb-1" />
            <span className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase">
              COMPUTE SILICON
            </span>
            <span className="font-display text-2xl font-medium text-neutral-900">
              ESP32-S3 DUAL
            </span>
            <span className="font-body text-xs text-neutral-500">
              240 MHz Xtensa LX7 with vector instructions
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Binary size={18} className="text-neutral-900 mb-1" />
            <span className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase">
              TOTAL INFERENCE LATENCY
            </span>
            <span className="font-display text-2xl font-medium text-neutral-900">
              &lt; 38 MILLISECONDS
            </span>
            <span className="font-body text-xs text-neutral-500">
              Faster than human acoustic reaction threshold
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Sparkles size={18} className="text-neutral-900 mb-1" />
            <span className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase">
              CLASSIFICATION ACCURACY
            </span>
            <span className="font-display text-2xl font-medium text-neutral-900">
              97.4% CONFIDENCE
            </span>
            <span className="font-body text-xs text-neutral-500">
              Continuous adaptive recalibration algorithm
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Network size={18} className="text-neutral-900 mb-1" />
            <span className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase">
              WIRELESS TELEMETRY
            </span>
            <span className="font-display text-2xl font-medium text-neutral-900">
              BLE 5.0 + WI-FI
            </span>
            <span className="font-body text-xs text-neutral-500">
              Ultra-low power encrypted synchronization
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
