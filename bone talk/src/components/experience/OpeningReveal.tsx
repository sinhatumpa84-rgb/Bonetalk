import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface OpeningRevealProps {
  onComplete: () => void
}

export function OpeningReveal({ onComplete }: OpeningRevealProps) {
  const [stage, setStage] = useState<
    'dark' | 'light-sweep' | 'silhouette' | 'details' | 'full' | 'finished'
  >('dark')

  useEffect(() => {
    // Precise cinematic progression timer
    const t1 = setTimeout(() => setStage('light-sweep'), 350)
    const t2 = setTimeout(() => setStage('silhouette'), 1100)
    const t3 = setTimeout(() => setStage('details'), 2100)
    const t4 = setTimeout(() => setStage('full'), 3200)
    const t5 = setTimeout(() => {
      setStage('finished')
      onComplete()
    }, 4500)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
    }
  }, [onComplete])

  if (stage === 'finished') return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: stage === 'full' ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* 1. Horizontal Slit Light Sweep */}
        {stage === 'light-sweep' && (
          <motion.div
            className="absolute h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            initial={{ scaleX: 0, opacity: 0, y: -40 }}
            animate={{ scaleX: [0, 1.2, 0.8], opacity: [0, 1, 0], y: [ -40, 0, 40 ] }}
            transition={{ duration: 1.0, ease: 'easeInOut' }}
          />
        )}

        {/* 2. Hardware Silhouette Glow */}
        {(stage === 'silhouette' || stage === 'details') && (
          <motion.div
            className="relative flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Ambient Silhouette Halo */}
            <div className="h-44 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

            {/* Glowing Micro-LED Jewel Spark */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_20px_#22d3ee]"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.8, 1], opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
            />
          </motion.div>
        )}

        {/* 3. Editorial Typography Reveal */}
        <div className="absolute bottom-16 flex flex-col items-center text-center px-6">
          <motion.div
            className="font-mono text-[10px] tracking-[0.4em] text-neutral-500 uppercase mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: stage === 'dark' ? 0 : 0.8, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            STUDIO PRESENTATION
          </motion.div>

          <motion.h1
            className="font-display text-2xl md:text-3xl tracking-[0.25em] text-white font-light uppercase"
            initial={{ opacity: 0, letterSpacing: '0.4em' }}
            animate={{
              opacity: stage === 'details' || stage === 'full' ? 1 : 0,
              letterSpacing: '0.25em',
            }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            SAAKANTHA
          </motion.h1>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
