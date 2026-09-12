import type { SVGProps } from 'react'

interface SaakanthaLogoProps extends SVGProps<SVGSVGElement> {
  variant?: 'full' | 'icon'
  iconSize?: number
  showWordmark?: boolean
  className?: string
}

export function SaakanthaLogo({
  variant = 'full',
  iconSize = 36,
  showWordmark = true,
  className = '',
  ...props
}: SaakanthaLogoProps) {
  if (variant === 'icon' || !showWordmark) {
    return (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block flex-shrink-0 ${className}`}
        aria-hidden="true"
        {...props}
      >
        <defs>
          <linearGradient id="saakanthaRingGradComp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--logo-ring-start, #334155)" />
            <stop offset="45%" stopColor="var(--logo-ring-mid, #1e293b)" />
            <stop offset="85%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="saakanthaWaveGradComp" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="35%" stopColor="#10b981" />
            <stop offset="75%" stopColor="#34d399" />
            <stop offset="100%" stopColor="var(--logo-wave-end, #334155)" />
          </linearGradient>
        </defs>

        {/* Outer Circular Ring */}
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="url(#saakanthaRingGradComp)"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Stylized Face & Ear Contour */}
        <path
          d="M 51 12 
             C 51 22, 53 28, 58 35 
             C 63 41, 65 43, 62 46 
             C 58 48, 56 49, 58 52 
             C 61 55, 60 59, 57 62 
             C 54 65, 52 69, 53 74 
             C 53 80, 48 85, 41 87"
          stroke="currentColor"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Ear / Back Contour */}
        <path
          d="M 50 40 
             C 42 40, 31 43, 31 54 
             C 31 67, 43 69, 44 76"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Stylized Intertwined Voice Soundwave */}
        <path
          d="M 33 53 
             C 35 44, 46 43, 49 50 
             C 52 57, 47 62, 52 63 
             C 56 64, 59 55, 64 45 
             C 68 37, 72 63, 76 63 
             C 80 63, 84 50, 89 57 
             C 92 61, 95 58, 97 55"
          stroke="url(#saakanthaWaveGradComp)"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3.5 select-none ${className}`}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
        aria-hidden="true"
        {...props}
      >
        <defs>
          <linearGradient id="saakanthaRingGradFullComp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--logo-ring-start, #334155)" />
            <stop offset="45%" stopColor="var(--logo-ring-mid, #1e293b)" />
            <stop offset="85%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="saakanthaWaveGradFullComp" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="35%" stopColor="#10b981" />
            <stop offset="75%" stopColor="#34d399" />
            <stop offset="100%" stopColor="var(--logo-wave-end, #334155)" />
          </linearGradient>
        </defs>

        {/* Outer Circular Ring */}
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="url(#saakanthaRingGradFullComp)"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Stylized Face & Ear Contour */}
        <path
          d="M 51 12 
             C 51 22, 53 28, 58 35 
             C 63 41, 65 43, 62 46 
             C 58 48, 56 49, 58 52 
             C 61 55, 60 59, 57 62 
             C 54 65, 52 69, 53 74 
             C 53 80, 48 85, 41 87"
          stroke="currentColor"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Ear / Back Contour */}
        <path
          d="M 50 40 
             C 42 40, 31 43, 31 54 
             C 31 67, 43 69, 44 76"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Stylized Intertwined Voice Soundwave */}
        <path
          d="M 33 53 
             C 35 44, 46 43, 49 50 
             C 52 57, 47 62, 52 63 
             C 56 64, 59 55, 64 45 
             C 68 37, 72 63, 76 63 
             C 80 63, 84 50, 89 57 
             C 92 61, 95 58, 97 55"
          stroke="url(#saakanthaWaveGradFullComp)"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span className="font-display text-base font-bold tracking-[0.22em] text-[var(--color-text-primary)] transition-colors duration-300 sm:text-lg">
        BoneTalk
      </span>
    </div>
  )
}
