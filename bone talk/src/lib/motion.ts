import type { Transition, Variants } from 'framer-motion'

/** Premium editorial easing — used site-wide */
export const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const

export const DURATION = {
  micro: 0.2,
  fast: 0.28,
  base: 0.45,
  medium: 0.6,
  slow: 0.85,
  cinematic: 1.1,
} as const

/** Visual rhythm — match section tempo to its narrative role */
export const RHYTHM = {
  technical: 0.4,   // fast — data, specs, telemetry
  system: 0.65,     // medium — pipeline, process
  emotional: 1.0,   // slow — editorial statements
  cinematic: 1.2,   // grand — worldwide, final reveal
} as const

export const STAGGER = {
  tight: 0.06,
  base: 0.08,
  relaxed: 0.12,
  editorial: 0.15,
  cinematic: 0.2,
} as const

export const VIEWPORT = {
  once: true,
  margin: '-8%',
} as const

export const VIEWPORT_EARLY = {
  once: true,
  margin: '-5%',
} as const

export function transition(
  duration: number = DURATION.base,
  delay: number = 0,
  ease: Transition['ease'] = EASE_PREMIUM
): Transition {
  return { duration, delay, ease }
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: transition(DURATION.base, i * STAGGER.base),
  }),
}

export const fadeUpMobile: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: transition(DURATION.fast, i * STAGGER.tight),
  }),
}

export const scaleReveal: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: transition(DURATION.medium, i * STAGGER.base),
  }),
}

/** Clip-path reveal from bottom — GPU-composited */
export const clipReveal: Variants = {
  hidden: { opacity: 0, clipPath: 'inset(8% 0 0 0)' },
  visible: (i: number = 0) => ({
    opacity: 1,
    clipPath: 'inset(0% 0 0 0)',
    transition: transition(DURATION.slow, i * STAGGER.relaxed),
  }),
}

/** Scale + fade — for instrument panels and containers */
export const scaleUpFade: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 12 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transition(DURATION.medium, i * STAGGER.base),
  }),
}

export const editorialLine: Variants = {
  hidden: { opacity: 0, y: '100%' },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: transition(DURATION.slow, i * STAGGER.editorial),
  }),
}

export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: transition(DURATION.base, i * STAGGER.base),
  }),
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER.base,
      delayChildren: 0.05,
    },
  },
}

export const staggerContainerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER.tight,
      delayChildren: 0.02,
    },
  },
}

/** Stagger with editorial pacing — for cinematic sections */
export const staggerContainerCinematic: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER.editorial,
      delayChildren: 0.1,
    },
  },
}

/** GPU-friendly scroll-linked transform ranges */
export const SCROLL_EXIT = {
  textY: [-48, 0] as const,
  deviceScale: [0.9, 1] as const,
  heroOpacity: [0.25, 1] as const,
  signalExtend: [0, 1] as const,
}

export const SCROLL_EXIT_MOBILE = {
  textY: [-24, 0] as const,
  deviceScale: [0.95, 1] as const,
  heroOpacity: [0.5, 1] as const,
  signalExtend: [0, 1] as const,
}
