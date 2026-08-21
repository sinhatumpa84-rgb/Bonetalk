import type { ReactNode } from 'react'
import { cn } from '../../lib/constants'

interface MagneticButtonProps {
  children: ReactNode
  onClick?: () => void
  href?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
  'aria-label'?: string
}

export function MagneticButton({
  children,
  onClick,
  href,
  variant = 'primary',
  className,
  'aria-label': ariaLabel,
}: MagneticButtonProps) {
  const baseStyles = cn(
    'group relative inline-flex items-center gap-2 font-mono text-xs tracking-[0.2em] uppercase transition-colors duration-200 cursor-pointer',
    variant === 'primary' &&
    'border border-cream/20 bg-cream/[0.04] px-6 py-3 hover:border-cyan-signal/40 hover:bg-cyan-signal/[0.06]',
    variant === 'secondary' &&
    'px-2 py-2 text-cream-muted hover:text-cream',
    variant === 'ghost' &&
    'border border-border px-5 py-2.5 hover:border-cyan-signal/30',
    className
  )

  const content = (
    <span className="inline-flex items-center gap-2">
      {children}
    </span>
  )

  if (href) {
    const isInternalRoute = href.startsWith('/') && !href.startsWith('//')
    return (
      <a
        href={href}
        className={baseStyles}
        aria-label={ariaLabel}
        onClick={(e) => {
          if (isInternalRoute) {
            e.preventDefault()
            window.history.pushState({}, '', href)
            window.dispatchEvent(new PopStateEvent('popstate'))
          }
          onClick?.()
        }}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={baseStyles}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  )
}
