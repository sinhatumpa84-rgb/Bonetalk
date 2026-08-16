import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { useIsMobile } from '../../hooks/useMediaQuery'

export function CustomCursor() {
  const isMobile = useIsMobile()
  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  const springConfig = { stiffness: 400, damping: 28, mass: 0.4 }
  const cursorX = useSpring(mouseX, springConfig)
  const cursorY = useSpring(mouseY, springConfig)

  const [visible, setVisible] = useState(false)
  const [label, setLabel] = useState<string | null>(null)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    if (isMobile) return

    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      if (!visible) setVisible(true)
    }

    const enter = () => setVisible(true)
    const leave = () => setVisible(false)

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const interactive = target.closest(
        'a, button, [data-cursor], [data-cursor-label]'
      )
      if (interactive) {
        setHovering(true)
        const cursorLabel =
          interactive.getAttribute('data-cursor') ||
          interactive.getAttribute('data-cursor-label')
        setLabel(cursorLabel)
      } else {
        setHovering(false)
        setLabel(null)
      }
    }

    window.addEventListener('mousemove', move, { passive: true })
    window.addEventListener('mouseover', handleOver, { passive: true })
    document.body.addEventListener('mouseenter', enter)
    document.body.addEventListener('mouseleave', leave)

    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', handleOver)
      document.body.removeEventListener('mouseenter', enter)
      document.body.removeEventListener('mouseleave', leave)
    }
  }, [isMobile, visible, mouseX, mouseY])

  if (isMobile) return null

  return (
    <>
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[10000] mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: hovering ? '-50%' : '-50%',
          translateY: hovering ? '-50%' : '-50%',
          opacity: visible ? 1 : 0,
        }}
      >
        <motion.div
          className="rounded-full border border-cream/70"
          animate={{
            width: hovering ? 44 : 10,
            height: hovering ? 44 : 10,
          }}
          transition={{ duration: 0.15 }}
        />
      </motion.div>

      <AnimatePresence>
        {label && hovering && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none fixed z-[10001] font-mono text-[9px] tracking-[0.25em] text-cream uppercase"
            style={{
              left: cursorX,
              top: cursorY,
              translateX: 24,
              translateY: -8,
            }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 769px) {
          *, *::before, *::after { cursor: none !important; }
        }
      `}</style>
    </>
  )
}

