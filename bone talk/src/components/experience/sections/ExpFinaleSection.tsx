import { motion } from 'framer-motion'
import { ArrowUp, Home, Compass } from 'lucide-react'
import { ExperienceCanvas } from '../ExperienceCanvas'
import type { ProductVariant } from '../data/productVariants'

interface ExpFinaleSectionProps {
  variant: ProductVariant
  onScrollToTop: () => void
  onNavigateHome: () => void
  isMobile: boolean
}

export function ExpFinaleSection({
  variant,
  onScrollToTop,
  onNavigateHome,
  isMobile,
}: ExpFinaleSectionProps) {
  return (
    <section className="relative min-h-screen w-full bg-black text-white flex flex-col justify-between py-24 px-6 sm:px-12 md:px-20 overflow-hidden border-t border-neutral-900">
      {/* Background ambient spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-cyan-950/20 blur-[180px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3 mb-3"
        >
          <span className="h-[1px] w-6 bg-cyan-400" />
          <span className="font-mono text-[10px] tracking-[0.35em] text-cyan-400 uppercase">
            SAAKANTHA / FINALE
          </span>
          <span className="h-[1px] w-6 bg-cyan-400" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="font-display text-4xl sm:text-6xl md:text-7xl tracking-[0.2em] font-light uppercase text-white mb-3"
        >
          SAAKANTHA
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-mono text-xs sm:text-sm tracking-[0.3em] text-neutral-400 uppercase"
        >
          FROM MUSCLE TO MEANING.
        </motion.p>
      </div>

      {/* Center 3D Slow-Rotating Hero Finale */}
      <div className="relative z-10 my-8 h-[48vh] min-h-[340px] w-full flex items-center justify-center">
        <ExperienceCanvas
          variant={variant}
          activeFocus="full"
          autoRotate={true}
          signalActive={false}
          isLight={false}
          isMobile={isMobile}
        />
      </div>

      {/* Bottom Editorial Actions & Return Navigation */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-neutral-900 pt-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateHome}
            className="group flex items-center gap-2.5 px-6 py-3.5 border border-neutral-800 bg-neutral-950 text-neutral-300 hover:text-white hover:border-neutral-600 font-mono text-xs tracking-widest uppercase transition-all cursor-pointer rounded-xs"
          >
            <Home size={14} className="transition-transform group-hover:-translate-x-0.5" />
            <span>MEET THE SYSTEM</span>
          </button>

          <button
            type="button"
            onClick={onScrollToTop}
            className="group flex items-center gap-2.5 px-6 py-3.5 border border-cyan-400/80 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50 font-mono text-xs tracking-widest uppercase transition-all cursor-pointer rounded-xs shadow-[0_0_15px_rgba(34,211,238,0.15)]"
          >
            <Compass size={14} />
            <span>EXPLORE THE TECHNOLOGY</span>
            <ArrowUp size={14} className="transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>

        <div className="flex flex-col items-center sm:items-end font-mono text-[10px] text-neutral-600 tracking-widest uppercase">
          <span>SAAKANTHA HARDWARE CAMPAIGN</span>
          <span className="mt-0.5">BONETALK ASSISTIVE ECOSYSTEM</span>
        </div>
      </div>
    </section>
  )
}
