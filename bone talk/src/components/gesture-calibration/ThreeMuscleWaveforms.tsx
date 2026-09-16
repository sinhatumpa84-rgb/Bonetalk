import React, { useRef, useEffect } from 'react'
import { Activity, Radio, Cpu } from 'lucide-react'
import type { SingleMuscleState } from '../../hooks/useThreeMuscleTelemetry'

interface ChannelWaveformProps {
  channel: SingleMuscleState
  isHardwareConnected: boolean
  isDemoActive: boolean
  isRecording?: boolean
}

const SingleChannelCard: React.FC<ChannelWaveformProps> = ({
  channel,
  isHardwareConnected,
  isDemoActive,
  isRecording = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Render waveform onto canvas with zero layout shift
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height

    // Background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, w, h)

    // Engineering grid
    ctx.strokeStyle = '#F0ECE4'
    ctx.lineWidth = 1

    const stepX = 20
    for (let x = 0; x < w; x += stepX) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }

    const stepY = 16
    for (let y = 0; y < h; y += stepY) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }

    // Zero baseline
    ctx.strokeStyle = '#DCD6CA'
    ctx.beginPath()
    ctx.moveTo(0, h / 2)
    ctx.lineTo(w, h / 2)
    ctx.stroke()

    // Waveform line
    const history = channel.history
    if (history && history.length > 1 && (isHardwareConnected || isDemoActive)) {
      ctx.strokeStyle = '#41634F'
      ctx.lineWidth = 2
      ctx.lineJoin = 'round'
      ctx.beginPath()

      const step = w / (history.length - 1)
      const centerY = h / 2
      const scaleY = h * 0.45

      history.forEach((val, idx) => {
        const x = idx * step
        const clamped = Math.max(-1.5, Math.min(1.5, val))
        const y = centerY - clamped * scaleY
        if (idx === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()

      // Endpoint dot
      const lastX = w - 1
      const lastVal = history[history.length - 1]
      const clampedLast = Math.max(-1.5, Math.min(1.5, lastVal))
      const lastY = centerY - clampedLast * scaleY

      ctx.fillStyle = '#2B382D'
      ctx.beginPath()
      ctx.arc(lastX - 2, lastY, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [channel.history, isHardwareConnected, isDemoActive])

  const hasData = (isHardwareConnected || isDemoActive) && channel.liveValue !== null
  const activityPercent = Math.round((channel.normalizedValue || 0) * 100)

  return (
    <div className="bg-[#FFFFFF] border-2 border-[#E5E0D8] rounded-sm p-4 shadow-sm flex flex-col justify-between gap-3 select-none transition-all hover:border-[#41634F]/40">
      {/* ── Top channel label & metrics ── */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E5E0D8]">
        <div>
          <h3 className="text-sm font-mono font-extrabold text-[#262220] tracking-wider uppercase">
            {channel.name}
          </h3>
          <span className="text-[10px] font-mono text-[#8C827A] block truncate max-w-[200px] sm:max-w-none">
            {channel.anatomy}
          </span>
        </div>

        <div className="text-right font-mono">
          <span className="text-xs font-extrabold text-[#262220] block">
            {hasData ? `${channel.liveValue?.toFixed(3)} mV` : '—'}
          </span>
          <span className="text-[9px] text-[#8C827A] block">
            {hasData && channel.rms !== null ? `RMS: ${channel.rms.toFixed(3)} mV` : 'RMS: —'}
          </span>
        </div>
      </div>

      {/* ── LIVE SIGNAL Section (Requirement 6) ── */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#736B63] uppercase tracking-wider">
          <span>LIVE SIGNAL</span>
          <span className="text-[9px] font-normal text-[#8C827A]">
            {isHardwareConnected ? 'HARDWARE 14-BIT' : isDemoActive ? 'SYNTHETIC SIGNAL' : 'SIGNAL IDLE'}
          </span>
        </div>

        <div className="relative w-full h-[64px] rounded-sm overflow-hidden border border-[#E5E0D8] bg-[#FAF8F5]">
          <canvas
            ref={canvasRef}
            width={360}
            height={64}
            className="w-full h-full block"
          />

          {!hasData && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#FAF8F5]/85 text-[10px] font-mono text-[#A8A29E]">
              {isHardwareConnected ? 'WAITING FOR PACKETS...' : 'DISCONNECTED / DEMO READY'}
            </div>
          )}
        </div>
      </div>

      {/* ── ACTIVITY & STATUS Grid (Requirement 6) ── */}
      <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
        {/* ACTIVITY */}
        <div className="p-2 rounded bg-[#FAF8F5] border border-[#E5E0D8] flex flex-col justify-between">
          <span className="text-[9px] text-[#8C827A] uppercase tracking-wider font-semibold">ACTIVITY</span>
          <div className="flex items-center justify-between mt-1">
            <span className="font-extrabold text-[#262220] text-sm">{activityPercent}%</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${
                channel.activity === 'HIGH'
                  ? 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/40 animate-pulse'
                  : channel.activity === 'ACTIVE'
                  ? 'bg-[#E8EFEA] text-[#2B382D] border-[#41634F]/30'
                  : 'bg-[#F9F6F0] text-[#A8A29E] border-[#E5E0D8]'
              }`}
            >
              {channel.activity}
            </span>
          </div>
          {/* Visual Activity Bar */}
          <div className="w-full h-1 bg-[#E5E0D8] rounded-full overflow-hidden mt-1.5">
            <div
              className="h-full bg-[#41634F] transition-all duration-100 rounded-full"
              style={{ width: `${activityPercent}%` }}
            />
          </div>
        </div>

        {/* STATUS */}
        <div className="p-2 rounded bg-[#FAF8F5] border border-[#E5E0D8] flex flex-col justify-between">
          <span className="text-[9px] text-[#8C827A] uppercase tracking-wider font-semibold">STATUS</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isRecording
                  ? 'bg-[#EF4444] animate-ping'
                  : hasData
                  ? 'bg-[#41634F]'
                  : 'bg-[#A8A29E]'
              }`}
            />
            <span className="font-extrabold text-xs uppercase text-[#2B382D]">
              {isRecording ? 'RECORDING' : 'READY'}
            </span>
          </div>
          <span className="text-[9px] text-[#8C827A] mt-1.5 truncate">
            {isHardwareConnected ? 'UNO R4 ONLINE' : isDemoActive ? 'SIMULATION ACTIVE' : 'AWAITING STREAM'}
          </span>
        </div>
      </div>
    </div>
  )
}

interface ThreeMuscleWaveformsProps {
  muscle1: SingleMuscleState
  muscle2: SingleMuscleState
  muscle3: SingleMuscleState
  isHardwareConnected: boolean
  isDemoActive: boolean
  onToggleDemo: () => void
  isRecording?: boolean
}

export const ThreeMuscleWaveforms: React.FC<ThreeMuscleWaveformsProps> = ({
  muscle1,
  muscle2,
  muscle3,
  isHardwareConnected,
  isDemoActive,
  onToggleDemo,
  isRecording = false,
}) => {
  return (
    <div className="space-y-3">
      {/* ── Section Header ── */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-[#41634F]" />
          <div>
            <h4 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
              Three-Channel Muscle Telemetry &bull; Primary Biosignal Panel
            </h4>
            <p className="text-[10px] font-mono text-[#8C827A]">
              Facial Electromyography: Muscle 1 (Zygomaticus), Muscle 2 (Perioral), Muscle 3 (Mandibular)
            </p>
          </div>
        </div>

        {/* Hardware vs Demo Mode Status */}
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 border ${
              isHardwareConnected
                ? 'bg-[#E8EFEA] text-[#2B382D] border-[#41634F]/30'
                : 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/40'
            }`}
          >
            {isHardwareConnected ? (
              <>
                <Cpu size={11} />
                <span>LIVE HARDWARE (UNO R4)</span>
              </>
            ) : (
              <>
                <Radio size={11} className={isDemoActive ? 'animate-pulse' : ''} />
                <span>DISCONNECTED / DEMO MODE</span>
              </>
            )}
          </span>

          {!isHardwareConnected && (
            <button
              type="button"
              onClick={onToggleDemo}
              className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-[#E5E0D8] bg-[#FAF8F5] text-[#5C554E] hover:text-[#262220] hover:bg-[#F2EFE9] transition-all cursor-pointer"
              title="Toggle synthetic facial bio-potentials for offline demonstration"
            >
              {isDemoActive ? 'STOP SIMULATION' : 'SIMULATE SIGNALS'}
            </button>
          )}
        </div>
      </div>

      {/* ── 3 Large Channel Cards Grid (Primary Visual Focus) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <SingleChannelCard
          channel={muscle1}
          isHardwareConnected={isHardwareConnected}
          isDemoActive={isDemoActive}
          isRecording={isRecording}
        />
        <SingleChannelCard
          channel={muscle2}
          isHardwareConnected={isHardwareConnected}
          isDemoActive={isDemoActive}
          isRecording={isRecording}
        />
        <SingleChannelCard
          channel={muscle3}
          isHardwareConnected={isHardwareConnected}
          isDemoActive={isDemoActive}
          isRecording={isRecording}
        />
      </div>
    </div>
  )
}
