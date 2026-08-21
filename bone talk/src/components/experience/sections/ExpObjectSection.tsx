import { motion } from 'framer-motion'
import { ExperienceCanvas } from '../ExperienceCanvas'
import { LuxuryColorSelector } from '../LuxuryColorSelector'
import { InteractiveControls } from '../InteractiveControls'
import type { ProductVariant } from '../data/productVariants'

interface ExpObjectSectionProps {
  variant: ProductVariant
  onSelectVariant: (variant: ProductVariant) => void
  activeCollectionId: 'heritage' | 'skin-tone' | 'anime-tech'
  onSelectCollection: (colId: 'heritage' | 'skin-tone' | 'anime-tech') => void
  activeFocus: 'full' | 'module' | 'sensor' | 'strap'
  onChangeFocus: (focus: 'full' | 'module' | 'sensor' | 'strap') => void
  autoRotate: boolean
  onToggleAutoRotate: () => void
  onResetRotation: () => void
  rotationY: number
  onUserRotate: (rotY: number) => void
  isMobile: boolean
}

export function ExpObjectSection({
  variant,
  onSelectVariant,
  activeCollectionId,
  onSelectCollection,
  activeFocus,
  onChangeFocus,
  autoRotate,
  onToggleAutoRotate,
  onResetRotation,
  rotationY,
  onUserRotate,
  isMobile,
}: ExpObjectSectionProps) {
  return (
    <section className="relative min-h-screen w-full bg-black text-white flex flex-col justify-between pt-24 pb-12 px-6 sm:px-12 overflow-hidden">
      {/* ── Background Subtle Studio Atmospheric Ambient ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-cyan-950/20 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#000000_100%)] opacity-80" />
      </div>

      {/* ── Hero Editorial Header ── */}
      <div className="relative z-10 flex flex-col items-start max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-3 mb-3"
        >
          <span className="h-[1px] w-6 bg-cyan-400" />
          <span className="font-mono text-[10px] tracking-[0.35em] text-cyan-400 uppercase">
            SECTION 01 / THE OBJECT
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="font-display text-4xl sm:text-6xl tracking-[0.18em] font-light uppercase text-white mb-2"
        >
          SAAKANTHA
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="font-mono text-xs sm:text-sm tracking-[0.25em] text-neutral-300 uppercase mb-4"
        >
          COMMUNICATION, REIMAGINED.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="font-body text-xs sm:text-sm text-neutral-400 max-w-lg leading-relaxed font-light"
        >
          An AI-powered assistive communication system that transforms muscle activity into meaningful expression.
        </motion.p>
      </div>

      {/* ── Centered 3D Interactive Showroom Viewport ── */}
      <div className="relative z-10 my-4 h-[52vh] min-h-[360px] w-full flex items-center justify-center">
        {/* Floating Technical Hairline Callouts (Desktop) */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          {/* Top-Right Callout: Central Hub */}
          <div className="absolute top-[28%] right-[18%] flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase">
                ESP32-S3 DUAL-CORE HUB
              </span>
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            </div>
            <div className="h-[1px] w-32 bg-gradient-to-l from-cyan-400/80 to-transparent mt-1" />
            <span className="font-mono text-[9px] text-neutral-500 mt-1">
              Chamfered 0.56u casing • Micro-LED jewel
            </span>
          </div>

          {/* Bottom-Left Callout: Dual EMG Sensor Discs */}
          <div className="absolute bottom-[28%] left-[16%] flex flex-col items-start">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              <span className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase">
                DUAL EMG SENSOR ARRAY
              </span>
            </div>
            <div className="h-[1px] w-32 bg-gradient-to-r from-cyan-400/80 to-transparent mt-1" />
            <span className="font-mono text-[9px] text-neutral-500 mt-1">
              Concentric bio-conductive circular terminals
            </span>
          </div>
        </div>

        {/* 3D Canvas */}
        <ExperienceCanvas
          variant={variant}
          activeFocus={activeFocus}
          autoRotate={autoRotate}
          signalActive={false}
          isLight={false}
          isMobile={isMobile}
          rotationY={rotationY}
          onUserRotate={onUserRotate}
        />
      </div>

      {/* ── Bottom Controls & Luxury Color Selector ── */}
      <div className="relative z-10 flex flex-col lg:flex-row items-end justify-between gap-6 border-t border-neutral-900 pt-6">
        <InteractiveControls
          activeFocus={activeFocus}
          onChangeFocus={onChangeFocus}
          autoRotate={autoRotate}
          onToggleAutoRotate={onToggleAutoRotate}
          onResetRotation={onResetRotation}
        />

        <LuxuryColorSelector
          activeVariant={variant}
          onSelectVariant={onSelectVariant}
          activeCollectionId={activeCollectionId}
          onSelectCollection={onSelectCollection}
          isLight={false}
        />
      </div>
    </section>
  )
}
