import { cn } from '../../lib/constants'

interface TechnicalGridProps {
  variant?: 'default' | 'hardware' | 'hidden'
  className?: string
  fixed?: boolean
}

export function TechnicalGrid({
  variant = 'default',
  className,
  fixed = false,
}: TechnicalGridProps) {
  if (variant === 'hidden') return null

  return (
    <div
      className={cn(
        'pointer-events-none overflow-hidden select-none z-0',
        fixed ? 'fixed inset-0' : 'absolute inset-0',
        className
      )}
      aria-hidden="true"
    >
      {/* Background Precision Engineering Blueprint Grid System */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `
            linear-gradient(var(--grid-primary) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-primary) 1px, transparent 1px),
            linear-gradient(var(--grid-secondary) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-secondary) 1px, transparent 1px)
          `,
          backgroundSize: `
            var(--grid-size) var(--grid-size),
            var(--grid-size) var(--grid-size),
            var(--grid-subsize) var(--grid-subsize),
            var(--grid-subsize) var(--grid-subsize)
          `,
          backgroundPosition: '-1px -1px',
        }}
      />
    </div>
  )
}
