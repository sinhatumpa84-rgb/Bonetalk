import { useScrollY } from '../../hooks/useScrollProgress'
import { cn } from '../../lib/constants'

interface TechnicalGridProps {
  variant?: 'default' | 'hardware' | 'hidden'
  className?: string
}

export function TechnicalGrid({
  variant = 'default',
  className,
}: TechnicalGridProps) {
  const scrollY = useScrollY()

  if (variant === 'hidden') return null

  const opacity =
    variant === 'hardware' ? 0.06 : 0.03 + Math.min(scrollY * 0.00002, 0.02)
  const offset = scrollY * 0.02

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      <div
        className="absolute inset-[-50%] h-[200%] w-[200%]"
        style={{
          opacity,
          transform: `translateY(${offset}px)`,
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  )
}
