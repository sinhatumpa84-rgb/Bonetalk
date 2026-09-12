import React, { useRef, useEffect } from 'react'
import { Activity, AlertCircle } from 'lucide-react'
import { useModelControl } from '../../context/ModelControlContext'

interface EMGViewerProps {
  height?: number
  showDetailedMetrics?: boolean
}

export const EMGViewer: React.FC<EMGViewerProps> = ({
  height = 180,
  showDetailedMetrics = true,
}) => {
  const { hasSensorData, rawEmgSamples, latestEmgValue, emgMetrics, connectionStatus } =
    useModelControl()

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Render EMG waveform onto Canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height

    // Background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, w, h)

    // Engineering grid lines
    ctx.strokeStyle = '#F0ECE4'
    ctx.lineWidth = 1

    const stepX = 25
    for (let x = 0; x < w; x += stepX) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }

    const stepY = 25
    for (let y = 0; y < h; y += stepY) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }

    // Zero-line
    ctx.strokeStyle = '#DCD6CA'
    ctx.beginPath()
    ctx.moveTo(0, h / 2)
    ctx.lineTo(w, h / 2)
    ctx.stroke()

    // Draw waveform only if real samples exist
    if (hasSensorData && rawEmgSamples.length > 1) {
      ctx.strokeStyle = '#41634F'
      ctx.lineWidth = 1.75
      ctx.lineJoin = 'round'
      ctx.beginPath()

      const step = w / (rawEmgSamples.length - 1)
      const centerY = h / 2
      // Scale factor: assume standard microvolt range (-1.5 to +1.5 mV or similar normalized range)
      const scaleY = h * 0.4

      rawEmgSamples.forEach((val, idx) => {
        const x = idx * step
        // Clamp and map
        const clamped = Math.max(-1.5, Math.min(1.5, val))
        const y = centerY - clamped * scaleY
        if (idx === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      // Active pulse indicator at end of line
      const lastX = w
      const lastVal = rawEmgSamples[rawEmgSamples.length - 1]
      const clampedLast = Math.max(-1.5, Math.min(1.5, lastVal))
      const lastY = centerY - clampedLast * scaleY

      ctx.fillStyle = '#2B382D'
      ctx.beginPath()
      ctx.arc(lastX - 2, lastY, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [hasSensorData, rawEmgSamples, height])

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 shadow-xs">
      {/* ── Header with Live Status ── */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E5E0D8]/60">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-[#41634F]" />
          <h4 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
            Electromyography (EMG) Signal Feed
          </h4>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="text-[#8C827A]">CH-1 Facialis</span>
          <span className="h-2 w-px bg-[#E5E0D8]" />
          <span className="text-[#8C827A]">1000 Hz</span>
        </div>
      </div>

      {/* ── Canvas Waveform or Waiting state ── */}
      <div className="relative rounded-sm overflow-hidden border border-[#E5E0D8] bg-[#FAF8F5]">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: `${height}px`, display: 'block' }}
        />

        {!hasSensorData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF8F5]/85 backdrop-blur-[1px] p-4 text-center">
            <AlertCircle size={20} className="text-[#8C827A] mb-1.5" />
            <p className="text-xs font-mono font-semibold text-[#5C554E] tracking-wide">
              Waiting for hardware data...
            </p>
            <p className="text-[11px] font-mono text-[#8C827A] mt-0.5 max-w-xs">
              {connectionStatus === 'Connected'
                ? 'Device connected. Awaiting transmission on configured topic.'
                : 'Connect ESP32 hardware via MQTT to begin streaming live bio-signals.'}
            </p>
          </div>
        )}
      </div>

      {/* ── Real Metrics Display (Strictly real, '—' if no data) ── */}
      {showDetailedMetrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-[#E5E0D8]/60 font-mono text-xs">
          <div className="p-2 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
            <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">
              Current Val
            </span>
            <span className="font-semibold text-[#262220]">
              {hasSensorData && latestEmgValue !== null ? `${latestEmgValue.toFixed(3)} mV` : '—'}
            </span>
          </div>

          <div className="p-2 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
            <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">
              RMS Amplitude
            </span>
            <span className="font-semibold text-[#262220]">
              {hasSensorData && emgMetrics.rms !== null ? `${emgMetrics.rms.toFixed(2)} µV` : '—'}
            </span>
          </div>

          <div className="p-2 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
            <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">
              MAV (Mean Abs)
            </span>
            <span className="font-semibold text-[#262220]">
              {hasSensorData && emgMetrics.mav !== null ? `${emgMetrics.mav.toFixed(2)} µV` : '—'}
            </span>
          </div>

          <div className="p-2 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
            <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">
              ZCR (Crossing)
            </span>
            <span className="font-semibold text-[#262220]">
              {hasSensorData && emgMetrics.zcr !== null ? `${emgMetrics.zcr} Hz` : '—'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
