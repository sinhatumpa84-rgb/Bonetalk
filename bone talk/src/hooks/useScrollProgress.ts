import { useEffect, useState, type RefObject } from 'react'

export function useScrollProgress(ref: RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let ticking = false

    const update = () => {
      const rect = el.getBoundingClientRect()
      const windowH = window.innerHeight
      const total = rect.height + windowH
      const scrolled = windowH - rect.top
      const val = Math.max(0, Math.min(1, scrolled / total))
      
      setProgress((prev) => (Math.abs(prev - val) > 0.005 ? val : prev))
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update)
        ticking = true
      }
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ref])

  return progress
}

export function useScrollY(): number {
  const [y, setY] = useState(0)

  useEffect(() => {
    const handler = () => setY(window.scrollY)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return y
}

export function useInView(
  ref: RefObject<HTMLElement | null>,
  threshold = 0.2
): boolean {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, threshold])

  return inView
}
