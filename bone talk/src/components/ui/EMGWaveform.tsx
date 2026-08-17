import { useEffect, useRef, useCallback } from 'react'
import { generateWaveformPoint, type SignalCommand, SIGNAL_PATTERNS } from '../../lib/constants'
import { useTheme } from '../../context/ThemeContext'

interface EMGWaveformProps {
  width?: number
  height?: number
  amplitude?: number
  frequency?: number
  burst?: number
  intensity?: number
  color?: string
  className?: string
  animate?: boolean
  command?: SignalCommand | null
  showGrid?: boolean
}

function readThemeColors() {
  const styles = getComputedStyle(document.documentElement)
  return {
    grid: styles.getPropertyValue('--emg-grid').trim() || 'rgba(0, 0, 0, 0.06)',
    baseline: styles.getPropertyValue('--emg-baseline').trim() || 'rgba(5, 150, 105, 0.2)',
    signal: styles.getPropertyValue('--color-cyan-signal').trim() || '#059669',
    medical: styles.getPropertyValue('--color-medical').trim() || '#16A34A',
  }
}

export function EMGWaveform({
  width = 800,
  height = 120,
  amplitude = 0.7,
  frequency = 2.5,
  burst = 0.5,
  intensity = 1,
  color,
  className = '',
  animate = true,
  command = null,
  showGrid = true,
}: EMGWaveformProps) {
  const { theme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timeRef = useRef(0)
  const rafRef = useRef<number>(0)

  const pattern = command ? SIGNAL_PATTERNS[command] : null
  const amp = pattern?.amplitude ?? amplitude
  const freq = pattern?.frequency ?? frequency
  const brst = pattern?.burst ?? burst

  // Initialize canvas size & DPR scaling only when width/height change
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
  }, [width, height])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const colors = readThemeColors()
    const strokeColor = color ?? colors.signal

    ctx.clearRect(0, 0, width, height)

    // Optional Oscilloscope Grid Background
    if (showGrid) {
      ctx.strokeStyle = colors.grid
      ctx.lineWidth = 1
      const gridSpacing = 20
      ctx.beginPath()
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
      }
      ctx.stroke()

      // Center baseline
      ctx.strokeStyle = colors.baseline
      ctx.beginPath()
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.stroke()
    }

    const midY = height / 2
    const points = 240

    // 1. Primary Raw EMG Waveform
    ctx.beginPath()
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width
      const normalizedX = (i / points) * Math.PI * 8
      const y =
        midY -
        generateWaveformPoint(normalizedX, timeRef.current, amp * intensity, freq, brst) *
          (height * 0.38)

      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }

    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 1.75
    ctx.globalAlpha = 0.95
    ctx.shadowColor = strokeColor
    ctx.shadowBlur = 8
    ctx.stroke()
    ctx.shadowBlur = 0

    // 2. Smooth Integrated Muscle Envelope Trace (Subtle secondary overlay)
    ctx.beginPath()
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width
      const normalizedX = (i / points) * Math.PI * 8
      const envY =
        midY -
        Math.abs(Math.sin(normalizedX * 0.5 + timeRef.current * brst)) *
          amp *
          intensity *
          (height * 0.32)

      if (i === 0) ctx.moveTo(x, envY)
      else ctx.lineTo(x, envY)
    }
    ctx.strokeStyle = colors.medical
    ctx.lineWidth = 1.2
    ctx.globalAlpha = 0.4
    ctx.setLineDash([4, 4])
    ctx.stroke()
    ctx.setLineDash([])

    // 3. Shaded Area Under Waveform
    ctx.beginPath()
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width
      const normalizedX = (i / points) * Math.PI * 8
      const y =
        midY -
        generateWaveformPoint(normalizedX, timeRef.current, amp * intensity, freq, brst) *
          (height * 0.38)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    ctx.fillStyle = strokeColor
    ctx.globalAlpha = 0.08 * intensity
    ctx.fill()

    ctx.globalAlpha = 1
  }, [width, height, amp, freq, brst, intensity, color, showGrid, theme])

  useEffect(() => {
    if (!animate) {
      draw()
      return
    }

    let running = true
    const loop = () => {
      if (!running) return
      timeRef.current += 0.03
      draw()
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      running = false
      cancelAnimationFrame(rafRef.current)
    }
  }, [animate, draw])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}


