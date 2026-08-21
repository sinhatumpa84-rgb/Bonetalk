import { motion } from 'framer-motion'
import { Feather, ShieldCheck, Waves, Cpu } from 'lucide-react'
import type { ProductVariant } from '../data/productVariants'

interface ExpFormSectionProps {
  variant: ProductVariant
}

export function ExpFormSection({ variant }: ExpFormSectionProps) {
  const specs = [
    {
      icon: Feather,
      title: 'FEATHERWEIGHT PROFILE',
      metric: '36.4 GRAMS',
      detail: 'Ultra-low inertia chassis designed for continuous, imperceptible all-day contact along the cervical spine.',
    },
    {
      icon: Waves,
      title: 'ANATOMICAL CONTOUR',
      metric: 'ELLIPTICAL ARC',
      detail: 'Adaptive flex-geometry follows the natural curvature of the laryngeal muscle group without compressive pressure.',
    },
    {
      icon: ShieldCheck,
      title: 'BIO-COMPATIBLE MATRIX',
      metric: 'HYPOALLERGENIC',
      detail: 'Medical-grade contact silver and soft-touch elastane eliminate skin friction and thermal buildup.',
    },
    {
      icon: Cpu,
      title: 'INTEGRATED DUAL-HUB',
      metric: 'SUB-MICRON CNC',
      detail: 'Precision-milled chamfered housing shielding analog front-end telemetry from electromagnetic interference.',
    },
  ]

  return (
    <section className="relative min-h-screen w-full bg-white text-neutral-900 flex flex-col justify-center py-28 px-6 sm:px-12 md:px-20 overflow-hidden border-t border-neutral-100">
      {/* ── Background Subtle Editorial Watermark ── */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2 select-none pointer-events-none opacity-[0.03]">
        <span className="font-display text-[22vw] font-bold tracking-tighter text-black leading-none">
          FORM
        </span>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* ── Section Label ── */}
        <div className="flex items-center gap-3 mb-6">
          <span className="h-[1.5px] w-8 bg-neutral-900" />
          <span className="font-mono text-xs tracking-[0.35em] text-neutral-500 uppercase">
            SECTION 02 / THE FORM
          </span>
        </div>

        {/* ── Oversized Editorial Headline ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-baseline mb-20">
          <h2 className="lg:col-span-8 font-display text-4xl sm:text-6xl md:text-7xl tracking-[-0.02em] font-light leading-[1.05] uppercase">
            BUILT AROUND <br />
            <span className="font-normal italic">THE HUMAN BODY.</span>
          </h2>
          <div className="lg:col-span-4 flex flex-col gap-4">
            <p className="font-mono text-xs tracking-[0.2em] text-neutral-500 uppercase">
              PHILOSOPHY / 01
            </p>
            <p className="font-body text-sm text-neutral-600 leading-relaxed font-light">
              Every curve, chamfer, and textile weave is engineered to eliminate the boundary between hardware and wearer. Technology that does not feel like technology.
            </p>
          </div>
        </div>

        {/* ── Material Story Derived from Selected Variant ── */}
        <div className="p-8 sm:p-12 mb-20 rounded-xs border border-neutral-200 bg-neutral-50/70">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-6 mb-8">
            <div>
              <span className="font-mono text-[10px] tracking-[0.3em] text-neutral-400 uppercase">
                ACTIVE MATERIAL ARCHITECTURE
              </span>
              <h3 className="font-display text-2xl font-medium tracking-wide uppercase text-neutral-900 mt-1">
                {variant.name} — {variant.finish}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="h-4 w-4 rounded-full border border-neutral-300 shadow-xs"
                style={{ backgroundColor: variant.podColor }}
              />
              <span
                className="h-4 w-8 rounded-xs border border-neutral-300 shadow-xs"
                style={{ backgroundColor: variant.bandColor }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[11px] tracking-widest text-neutral-500 uppercase">
                01 / SURFACE FINISH
              </span>
              <p className="font-body text-xs sm:text-sm text-neutral-800 leading-relaxed">
                {variant.materialStory.surface}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[11px] tracking-widest text-neutral-500 uppercase">
                02 / BIO-CONTACT INTERFACE
              </span>
              <p className="font-body text-xs sm:text-sm text-neutral-800 leading-relaxed">
                {variant.materialStory.contact}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[11px] tracking-widest text-neutral-500 uppercase">
                03 / STRUCTURAL TEXTILE
              </span>
              <p className="font-body text-xs sm:text-sm text-neutral-800 leading-relaxed">
                {variant.materialStory.structure}
              </p>
            </div>
          </div>
        </div>

        {/* ── 4 Key Ergonomic Pillars ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specs.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="p-6 border border-neutral-200/80 bg-white flex flex-col justify-between min-h-[220px]"
            >
              <div>
                <item.icon size={20} className="text-neutral-900 mb-6" />
                <span className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase block mb-1">
                  {item.title}
                </span>
                <span className="font-display text-xl tracking-tight font-medium text-neutral-900 block mb-3">
                  {item.metric}
                </span>
              </div>
              <p className="font-body text-xs text-neutral-600 leading-relaxed font-light">
                {item.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
