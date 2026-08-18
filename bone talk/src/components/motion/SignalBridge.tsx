import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useRef } from 'react'
import { cn } from '../../lib/constants'
import { useReducedMotion, useIsMobile } from '../../hooks/useMediaQuery'
import { DURATION, EASE_PREMIUM } from '../../lib/motion'

export type SignalBridgeVariant =
  | 'flow'
  | 'wave-to-line'
  | 'converge'
  | 'expand'
  | 'pulse-down'

interface SignalBridgeProps {
  variant?: SignalBridgeVariant
  className?: string
  /** Optional narrative micro-label (e.g., "SIGNAL → SYSTEM") */
  label?: string
}

function BridgeMotion({
  progress,
  variant,
  isMobile,
}: {
  progress: MotionValue<number>
  variant: SignalBridgeVariant
  isMobile: boolean
}) {
  const ringSize = useTransform(progress, [0, 1], [20, isMobile ? 180 : 320])
  const ringOpacity = useTransform(progress, [0, 0.3, 0.8, 1], [0, 0.6, 0.3, 0.1])
  const dotTop = useTransform(progress, [0, 1], ['0%', '95%'])
  const dotOpacity = useTransform(progress, [0.1, 0.5, 1], [0, 1, 0.4])
  const lineOpacity = useTransform(progress, [0, 0.2, 1], [0, 0.8, 0.3])
  const flatLineProgress = useTransform(progress, [0.5, 1], [0, 1])
  const flatLineOpacity = useTransform(progress, [0.5, 1], [0, 0.5])
  const waveOpacity = useTransform(progress, [0, 0.6, 1], [0.7, 0.4, 0.15])
  const convergeOpacity = useTransform(progress, [0, 0.5, 1], [0, 0.5, 0.2])
  const expandDotOpacity = useTransform(progress, [0.4, 1], [0, 1])

  // Second expand ring for cinematic depth
  const ring2Size = useTransform(progress, [0.15, 1], [10, isMobile ? 120 : 220])
  const ring2Opacity = useTransform(progress, [0.15, 0.5, 1], [0, 0.4, 0.08])

  if (variant === 'expand') {
    return (
      <>
        <motion.div
          className="absolute rounded-full border border-cyan-signal/30"
          style={{ width: ringSize, height: ringSize, opacity: ringOpacity }}
        />
        <motion.div
          className="absolute rounded-full border border-cyan-signal/20"
          style={{ width: ring2Size, height: ring2Size, opacity: ring2Opacity }}
        />
        <motion.div
          className="absolute h-1.5 w-1.5 rounded-full bg-cyan-signal shadow-[0_0_8px_var(--color-cyan-signal)]"
          style={{ opacity: expandDotOpacity }}
        />
      </>
    )
  }

  if (variant === 'converge') {
    return (
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {[-1, 0, 1].map((offset) => (
          <motion.line
            key={offset}
            x1={`${50 + offset * 30}%`}
            y1="0%"
            x2="50%"
            y2="100%"
            stroke="var(--color-cyan-signal)"
            strokeWidth="1"
            style={{ pathLength: progress, opacity: convergeOpacity }}
          />
        ))}
      </svg>
    )
  }

  if (variant === 'wave-to-line') {
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 80" preserveAspectRatio="none">
        <motion.path
          d="M0 40 Q50 20 100 40 T200 40 T300 40 T400 40"
          fill="none"
          stroke="var(--color-cyan-signal)"
          strokeWidth="1.5"
          style={{ pathLength: progress, opacity: waveOpacity }}
        />
        <motion.line
          x1="0"
          y1="40"
          x2="400"
          y2="40"
          stroke="var(--color-cyan-signal)"
          strokeWidth="1"
          style={{ pathLength: flatLineProgress, opacity: flatLineOpacity }}
        />
      </svg>
    )
  }

  return (
    <>
      <div className="absolute inset-x-0 top-0 bottom-0 flex justify-center">
        <motion.div
          className="w-px origin-top bg-gradient-to-b from-transparent via-cyan-signal/50 to-transparent"
          style={{ scaleY: progress, opacity: lineOpacity }}
        />
      </div>
      <motion.div
        className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-cyan-signal shadow-[0_0_6px_var(--color-cyan-signal)]"
        style={{ top: dotTop, opacity: dotOpacity }}
      />
      {variant === 'pulse-down' && (
        <motion.div
          className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-cyan-signal/10"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </>
  )
}

export function SignalBridge({ variant = 'flow', className, label }: SignalBridgeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const isMobile = useIsMobile()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const progress = useTransform(scrollYProgress, [0.15, 0.85], [0, 1])
  const labelOpacity = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0, 0.6, 0])
  const height = isMobile ? 'h-14' : 'h-24 md:h-32'

  if (reduced) {
    return (
      <div
        ref={ref}
        className={cn('relative overflow-hidden pointer-events-none', height, className)}
        aria-hidden="true"
      >
        <div className="absolute inset-x-[20%] top-1/2 h-px -translate-y-1/2 bg-cyan-signal/20" />
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex items-center justify-center overflow-hidden pointer-events-none',
        height,
        className
      )}
      aria-hidden="true"
    >
      <BridgeMotion progress={progress} variant={variant} isMobile={isMobile} />

      {/* Optional narrative micro-label */}
      {label && !isMobile && (
        <motion.span
          className="absolute font-mono text-[8px] tracking-[0.3em] text-cyan-signal/50 uppercase select-none"
          style={{ opacity: labelOpacity }}
        >
          {label}
        </motion.span>
      )}
    </div>
  )
}

/** Horizontal signal line for inline section headers */
export function SignalLine({
  className,
  delay = 0,
}: {
  className?: string
  delay?: number
}) {
  const reduced = useReducedMotion()

  if (reduced) {
    return (
      <div className={cn('h-px w-full bg-cyan-signal/25', className)} aria-hidden="true" />
    )
  }

  return (
    <motion.div
      className={cn('relative h-px w-full overflow-hidden', className)}
      aria-hidden="true"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <motion.div
        className="absolute inset-y-0 left-0 h-full bg-gradient-to-r from-transparent via-cyan-signal/60 to-cyan-signal/20"
        initial={{ width: '0%' }}
        whileInView={{ width: '100%' }}
        viewport={{ once: true }}
        transition={{ duration: DURATION.slow, delay, ease: EASE_PREMIUM }}
      />
    </motion.div>
  )
}
