import { motion, type HTMLMotionProps } from 'framer-motion'
import { useReducedMotion, useIsMobile } from '../../hooks/useMediaQuery'
import {
  fadeUp,
  fadeUpMobile,
  scaleReveal,
  clipReveal,
  scaleUpFade,
  transition,
  VIEWPORT,
} from '../../lib/motion'

type RevealVariant = 'fade-up' | 'scale' | 'clip-reveal' | 'scale-up-fade'

interface SectionRevealProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  delay?: number
  y?: number
  variant?: RevealVariant
}

/** Lightweight scroll entrance — GPU transform + opacity only */
export function SectionReveal({
  children,
  delay = 0,
  y,
  variant = 'fade-up',
  className,
  ...props
}: SectionRevealProps) {
  const reduced = useReducedMotion()
  const isMobile = useIsMobile()

  if (reduced) {
    return (
      <div className={className} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    )
  }

  // Variant-based entrance
  if (variant === 'scale') {
    return (
      <motion.div
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        variants={scaleReveal}
        custom={0}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  if (variant === 'clip-reveal') {
    return (
      <motion.div
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        variants={clipReveal}
        custom={0}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  if (variant === 'scale-up-fade') {
    return (
      <motion.div
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        variants={scaleUpFade}
        custom={0}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  // Default fade-up
  const offset = y ?? (isMobile ? 16 : 28)

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={transition(undefined, delay)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface StaggerRevealProps {
  children: React.ReactNode
  className?: string
  stagger?: number
  as?: 'div' | 'ul' | 'section'
}

export function StaggerReveal({
  children,
  className,
  stagger = 0.08,
  as = 'div',
}: StaggerRevealProps) {
  const reduced = useReducedMotion()
  const Component = motion[as] as typeof motion.div

  if (reduced) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: 0.04 },
        },
      }}
    >
      {children}
    </Component>
  )
}

export function StaggerItem({
  children,
  className,
  index = 0,
}: {
  children: React.ReactNode
  className?: string
  index?: number
}) {
  const reduced = useReducedMotion()
  const isMobile = useIsMobile()
  const variants = isMobile ? fadeUpMobile : fadeUp

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div className={className} variants={variants} custom={index}>
      {children}
    </motion.div>
  )
}
