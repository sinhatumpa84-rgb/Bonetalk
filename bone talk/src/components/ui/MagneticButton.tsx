import { useRef, useState, type ReactNode, type MouseEvent } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/constants'

interface MagneticButtonProps {
  children: ReactNode
  onClick?: () => void
  href?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
  magnetic?: boolean
  'aria-label'?: string
  dataCursor?: string
}

export function MagneticButton({
  children,
  onClick,
  href,
  variant = 'primary',
  className,
  magnetic = true,
  'aria-label': ariaLabel,
  dataCursor,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouse = (e: MouseEvent) => {
    if (!magnetic || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setPosition({
      x: (e.clientX - rect.left - rect.width / 2) * 0.15,
      y: (e.clientY - rect.top - rect.height / 2) * 0.15,
    })
  }

  const reset = () => setPosition({ x: 0, y: 0 })

  const baseStyles = cn(
    'group relative inline-flex items-center gap-2 font-mono text-xs tracking-[0.2em] uppercase transition-colors duration-200',
    variant === 'primary' &&
      'border border-cream/20 bg-cream/[0.04] px-6 py-3 hover:border-cyan-signal/40 hover:bg-cyan-signal/[0.06]',
    variant === 'secondary' &&
      'px-2 py-2 text-cream-muted hover:text-cream',
    variant === 'ghost' &&
      'border border-border px-5 py-2.5 hover:border-cyan-signal/30',
    className
  )

  const content = (
    <motion.span
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="inline-flex items-center gap-2"
    >
      {children}
    </motion.span>
  )

  if (href) {
    return (
      <a
        ref={ref}
        href={href}
        className={baseStyles}
        onMouseMove={handleMouse}
        onMouseLeave={reset}
        aria-label={ariaLabel}
        data-cursor={dataCursor ?? 'OPEN'}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={baseStyles}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      aria-label={ariaLabel}
      data-cursor={dataCursor}
    >
      {content}
    </button>
  )
}
