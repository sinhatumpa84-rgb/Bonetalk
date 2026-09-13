import React, { useState, useEffect, useRef } from 'react'
import {
  Bluetooth,
  Radio,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Power,
  Activity,
  Compass,
  Battery,
  ChevronRight,
  Terminal,
  ArrowLeft,
  Volume2,
  X,
} from 'lucide-react'
import { webBleService } from '../../services/webBleService'
import type { BleStatusDetails, BleSensorData } from '../../services/webBleService'
import { ThemeToggle } from '../ui/ThemeToggle'
import { speechService } from '../../lib/speechService'

interface ConnectDevicePageProps {
  onNavigateHome?: () => void
}

export const ConnectDevicePage: React.FC<ConnectDevicePageProps> = ({ onNavigateHome }) => {
  const [details, setDetails] = useState<BleStatusDetails>(() => webBleService.getDetails())
  const [sensorData, setSensorData] = useState<BleSensorData>(() => webBleService.getDetails().sensorData)
  const [rawLogs, setRawLogs] = useState<string[]>([])
  const [showDebug, setShowDebug] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  // EMG Canvas Buffer
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const emgHistoryRef = useRef<number[]>([])

  // Subscribe to BLE service updates
  useEffect(() => {
    const unsubStatus = webBleService.onStatusChange((newDetails) => {
      setDetails(newDetails)
      setIsConnecting(
        newDetails.state === 'BLUETOOTH PERMISSION REQUIRED' ||
          newDetails.state === 'SELECT DEVICE' ||
          newDetails.state === 'CONNECTING TO ESP32' ||
          newDetails.state === 'DISCOVERING SERVICES' ||
          newDetails.state === 'VERIFYING DEVICE'
      )
    })

    const unsubSensors = webBleService.onSensorData((newData) => {
      setSensorData(newData)

      // Add to EMG visualizer buffer ONLY if real EMG sample is present
      if (newData.emg !== null) {
        if (Array.isArray(newData.emg)) {
          newData.emg.forEach((val) => {
            emgHistoryRef.current.push(val)
            if (emgHistoryRef.current.length > 200) emgHistoryRef.current.shift()
          })
        } else {
          emgHistoryRef.current.push(newData.emg)
          if (emgHistoryRef.current.length > 200) emgHistoryRef.current.shift()
        }
      }

      // Voice output if prediction received
      if (newData.prediction) {
        speechService.speak(newData.prediction)
      }
    })

    const unsubPackets = webBleService.onRawPacket((line) => {
      setRawLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ${line}`,
        ...prev.slice(0, 49),
      ])
    })

    return () => {
      unsubStatus()
      unsubSensors()
      unsubPackets()
    }
  }, [])

  // Check Bluetooth availability on mount
  useEffect(() => {
    webBleService.checkBluetoothAvailability()
  }, [])

  // EMG Canvas Render Loop (Strictly renders real buffer without synthetic oscillation)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    const render = () => {
      const width = canvas.width
      const height = canvas.height
      ctx.clearRect(0, 0, width, height)

      // Background grid lines
      ctx.strokeStyle = '#E5E0D8'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.stroke()

      const buffer = emgHistoryRef.current

      if (
        (details.state === 'CONNECTED' || details.state === 'DATA STREAM ACTIVE') &&
        buffer.length > 1
      ) {
        // Draw real EMG waveform
        ctx.strokeStyle = '#10B981'
        ctx.lineWidth = 2
        ctx.beginPath()

        const step = width / Math.max(1, buffer.length - 1)
        const midY = height / 2

        for (let i = 0; i < buffer.length; i++) {
          const sample = buffer[i]
          const y = midY - (sample - 512) * (height / 1024)
          const clampedY = Math.max(4, Math.min(height - 4, y))

          if (i === 0) {
            ctx.moveTo(0, clampedY)
          } else {
            ctx.lineTo(i * step, clampedY)
          }
        }
        ctx.stroke()
      } else {
        // Flatline / Idle state
        ctx.strokeStyle = '#D1D5DB'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(0, height / 2)
        ctx.lineTo(width, height / 2)
        ctx.stroke()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [details.state])

  const handleConnect = async () => {
    await webBleService.connect()
  }

  const handleDisconnect = async () => {
    emgHistoryRef.current = []
    await webBleService.disconnect()
  }

  const handleRetryAvailability = async () => {
    await webBleService.checkBluetoothAvailability()
  }

  const isConnected = details.state === 'CONNECTED' || details.state === 'DATA STREAM ACTIVE'
  const isLost = details.state === 'CONNECTION LOST'
  const isUnavailable = details.state === 'BLUETOOTH UNAVAILABLE'

  // Formatted duration
  const durationSec = details.stats.connectionDurationSec
  const formattedDuration = `${Math.floor(durationSec / 60)}m ${durationSec % 60}s`

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#262220] flex flex-col font-sans selection:bg-[#41634F]/20 selection:text-[#2B382D]">
      {/* ── Top Console Header (Strictly matches screenshot design) ── */}
      <header className="bg-[#FFFFFF] border-b border-[#E5E0D8] px-4 sm:px-6 py-2.5 shadow-2xs">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Return Portal + Console Badge + Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={
                onNavigateHome ||
                (() => {
                  window.location.href = '/'
                })
              }
              className="flex items-center gap-1.5 px-3 py-1 rounded-sm border border-[#E5E0D8] bg-[#FBF9F5] hover:bg-[#F0ECE1] text-[#5C554E] hover:text-[#262220] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>PORTAL</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="bg-[#E8EFEA] text-[#2B382D] text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-[#41634F]/30">
                CONSOLE
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold tracking-tight text-[#262220]">
                    BoneTalk Hardware Gateway
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#8C827A] block leading-tight">
                  Arduino UNO R4 WiFi • BONE-01
                </span>
              </div>
            </div>
          </div>

          {/* Right: Live Telemetry Status Pills */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            {/* Bluetooth Radio Pill */}
            <span
              className={`px-2 py-0.5 rounded-sm border flex items-center gap-1.5 ${
                details.isBluetoothAvailable
                  ? 'bg-[#E8EFEA] text-[#2B382D] border-[#41634F]/30'
                  : 'bg-[#FEF2F2] text-[#991B1B] border-[#EF4444]/40'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  details.isBluetoothAvailable ? 'bg-[#41634F]' : 'bg-[#DC2626]'
                }`}
              />
              <span>{details.isBluetoothAvailable ? 'BLUETOOTH: READY' : 'BLUETOOTH: OFF'}</span>
            </span>

            {/* Device Online Pill */}
            <span
              className={`px-2 py-0.5 rounded-sm border flex items-center gap-1.5 ${
                isConnected
                  ? 'bg-[#E8EFEA] text-[#2B382D] border-[#41634F]/30'
                  : isLost
                  ? 'bg-[#FEF2F2] text-[#991B1B] border-[#EF4444]/40'
                  : 'bg-[#F5F2EB] text-[#8C827A] border-[#E5E0D8]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? 'bg-[#41634F]' : isLost ? 'bg-[#DC2626]' : 'bg-[#8C827A]'
                }`}
              />
              <span>
                {isConnected
                  ? details.device.name || 'ARDUINO ONLINE'
                  : isLost
                  ? 'DEVICE LOST'
                  : 'DEVICE OFFLINE'}
              </span>
            </span>

            {/* GATT Server Pill */}
            <span
              className={`px-2 py-0.5 rounded-sm border hidden md:flex items-center gap-1.5 ${
                details.device.gattConnected
                  ? 'bg-[#E8EFEA] text-[#2B382D] border-[#41634F]/30'
                  : 'bg-[#F5F2EB] text-[#8C827A] border-[#E5E0D8]'
              }`}
            >
              <span>{details.device.gattConnected ? 'GATT: CONNECTED' : 'GATT: DISCONNECTED'}</span>
            </span>

            {/* Service Discovery Pill */}
            <span
              className={`px-2 py-0.5 rounded-sm border hidden lg:flex items-center gap-1.5 ${
                details.device.serviceFound
                  ? 'bg-[#E8EFEA] text-[#2B382D] border-[#41634F]/30'
                  : 'bg-[#F5F2EB] text-[#8C827A] border-[#E5E0D8]'
              }`}
            >
              <span>{details.device.serviceFound ? 'SERVICE: DETECTED' : 'SERVICE: WAITING'}</span>
            </span>

            {/* Connection State Master Pill */}
            <span
              className={`px-2.5 py-0.5 rounded-sm font-bold border flex items-center gap-1.5 ${
                isConnected
                  ? 'bg-[#E8EFEA] text-[#2B382D] border-[#41634F]/40'
                  : isConnecting
                  ? 'bg-[#FEF9C3] text-[#854D0E] border-[#EAB308]/40 animate-pulse'
                  : isLost
                  ? 'bg-[#FEF2F2] text-[#991B1B] border-[#EF4444]/40'
                  : 'bg-[#F5F2EB] text-[#5C554E] border-[#E5E0D8]'
              }`}
            >
              <Bluetooth size={12} className={isConnected ? 'text-[#41634F]' : 'text-[#8C827A]'} />
              <span>BLE: {details.state}</span>
            </span>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Sub-navigation bar (Consistent with Model Control Nav in screenshot) ── */}
      <nav className="bg-[#FFFFFF] border-b border-[#E5E0D8] px-4 sm:px-6 shadow-2xs">
        <div className="max-w-[1440px] mx-auto flex items-center gap-2 overflow-x-auto py-2 font-mono text-xs">
          <a
            href="/model-control#dashboard"
            className="px-3 py-1.5 rounded-sm text-[#736B63] hover:text-[#262220] hover:bg-[#FBF9F5] transition-colors whitespace-nowrap"
          >
            Operations Console
          </a>
          <a
            href="/model-control#telemetry"
            className="px-3 py-1.5 rounded-sm text-[#736B63] hover:text-[#262220] hover:bg-[#FBF9F5] transition-colors whitespace-nowrap"
          >
            Live Telemetry
          </a>
          <span className="px-3 py-1.5 rounded-sm bg-[#2B382D] text-[#FFFFFF] font-semibold flex items-center gap-1.5 shadow-2xs whitespace-nowrap">
            <Bluetooth size={12} className="text-[#A3E635]" />
            <span>Connect Arduino UNO R4 WiFi</span>
          </span>
          <a
            href="/model-control#model"
            className="px-3 py-1.5 rounded-sm text-[#736B63] hover:text-[#262220] hover:bg-[#FBF9F5] transition-colors whitespace-nowrap"
          >
            Model &amp; Inference
          </a>
          <a
            href="/model-control#history"
            className="px-3 py-1.5 rounded-sm text-[#736B63] hover:text-[#262220] hover:bg-[#FBF9F5] transition-colors whitespace-nowrap"
          >
            Prediction History
          </a>
          <a
            href="/model-control#system"
            className="px-3 py-1.5 rounded-sm text-[#736B63] hover:text-[#262220] hover:bg-[#FBF9F5] transition-colors whitespace-nowrap"
          >
            System Status
          </a>
          <a
            href="/model-control#settings"
            className="px-3 py-1.5 rounded-sm text-[#736B63] hover:text-[#262220] hover:bg-[#FBF9F5] transition-colors whitespace-nowrap"
          >
            Settings
          </a>
        </div>
      </nav>

      {/* ── Main Viewport Container ── */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ── Section: Live Signal & Inference Pipeline Bar ── */}
        <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#41634F]' : 'bg-[#8C827A]'}`} />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#262220]">
                Live Signal &amp; Hardware Pipeline
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[#8C827A] hidden sm:inline">
              Real-time physical Arduino UNO R4 transmission
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs font-mono">
            {/* 1. Hardware */}
            <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
              <span className="text-[10px] text-[#8C827A] uppercase block">1. Hardware</span>
              <span className={`font-bold text-xs block mt-0.5 ${isConnected ? 'text-[#2B382D]' : 'text-[#8C827A]'}`}>
                {isConnected ? 'ONLINE' : 'OFFLINE'}
              </span>
              <span className="text-[10px] text-[#8C827A]">Arduino UNO R4 WiFi</span>
            </div>

            {/* 2. EMG + IMU */}
            <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
              <span className="text-[10px] text-[#8C827A] uppercase block">2. EMG + IMU</span>
              <span className={`font-bold text-xs block mt-0.5 ${sensorData.emg !== null ? 'text-[#2B382D]' : 'text-[#8C827A]'}`}>
                {sensorData.emg !== null ? 'RECEIVING' : 'IDLE'}
              </span>
              <span className="text-[10px] text-[#8C827A]">Bio-Potential</span>
            </div>

            {/* 3. Signal Proc */}
            <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
              <span className="text-[10px] text-[#8C827A] uppercase block">3. Signal Proc</span>
              <span className={`font-bold text-xs block mt-0.5 ${sensorData.emg !== null ? 'text-[#2B382D]' : 'text-[#8C827A]'}`}>
                {sensorData.emg !== null ? 'ACTIVE' : 'OFFLINE'}
              </span>
              <span className="text-[10px] text-[#8C827A]">DSP Filter</span>
            </div>

            {/* 4. GATT Link */}
            <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
              <span className="text-[10px] text-[#8C827A] uppercase block">4. GATT Link</span>
              <span className={`font-bold text-xs block mt-0.5 ${details.device.gattConnected ? 'text-[#2B382D]' : 'text-[#8C827A]'}`}>
                {details.device.gattConnected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
              <span className="text-[10px] text-[#8C827A]">Bluetooth 5.0</span>
            </div>

            {/* 5. ML Model */}
            <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
              <span className="text-[10px] text-[#8C827A] uppercase block">5. ML Model</span>
              <span className={`font-bold text-xs block mt-0.5 ${isConnected ? 'text-[#2B382D]' : 'text-[#8C827A]'}`}>
                {isConnected ? 'READY' : 'WAITING'}
              </span>
              <span className="text-[10px] text-[#8C827A]">Silent Speech</span>
            </div>

            {/* 6. Prediction */}
            <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
              <span className="text-[10px] text-[#8C827A] uppercase block">6. Prediction</span>
              <span className={`font-bold text-xs block mt-0.5 ${sensorData.prediction ? 'text-[#2B382D]' : 'text-[#8C827A]'}`}>
                {sensorData.prediction ? 'ACTIVE' : 'IDLE'}
              </span>
              <span className="text-[10px] text-[#8C827A]">Intent Classifier</span>
            </div>

            {/* 7. Text / Voice */}
            <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
              <span className="text-[10px] text-[#8C827A] uppercase block">7. Text / Voice</span>
              <span className={`font-bold text-xs block mt-0.5 ${sensorData.prediction ? 'text-[#2B382D]' : 'text-[#8C827A]'}`}>
                {sensorData.prediction ? 'SPEAKING' : 'IDLE'}
              </span>
              <span className="text-[10px] text-[#8C827A]">TTS Synthesizer</span>
            </div>
          </div>
        </div>

        {/* ── Two Column Primary Operations Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Telemetry & Device Signal ── 7 cols */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Electromyography (EMG) Signal Feed Card */}
            <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E5E0D8]/60">
                <div className="flex items-center gap-2">
                  <Activity size={15} className="text-[#41634F]" />
                  <h3 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
                    Electromyography (EMG) Signal Feed
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-[#8C827A]">CH-1 Facialis | 1000 Hz</span>
              </div>

              {/* Waveform Canvas Area */}
              <div className="relative w-full h-[200px] bg-[#FBF9F5] border border-[#E5E0D8] rounded-sm overflow-hidden flex items-center justify-center">
                <canvas ref={canvasRef} width={800} height={200} className="w-full h-full object-cover" />

                {/* Empty State Overlay strictly when idle/no packets */}
                {(!isConnected || sensorData.emg === null) && (
                  <div className="absolute inset-0 bg-[#FBF9F5]/90 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-9 h-9 rounded-full bg-[#E5E0D8]/60 flex items-center justify-center mb-2 text-[#736B63]">
                      <AlertTriangle size={18} />
                    </div>
                    <span className="font-mono text-xs font-bold text-[#262220] uppercase tracking-wider mb-1">
                      Waiting for physical hardware...
                    </span>
                    <span className="text-xs text-[#736B63] max-w-sm font-body">
                      Connect Arduino UNO R4 WiFi hardware to begin streaming live bio-signals.
                    </span>
                  </div>
                )}
              </div>

              {/* Metric Footer Boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-xs font-mono">
                <div className="p-2 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
                  <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">CURRENT VAL</span>
                  <span className="font-bold text-xs block mt-0.5 text-[#262220]">
                    {sensorData.emg !== null
                      ? Array.isArray(sensorData.emg)
                        ? sensorData.emg[sensorData.emg.length - 1]
                        : sensorData.emg
                      : '--'}
                  </span>
                </div>

                <div className="p-2 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
                  <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">RMS AMPLITUDE</span>
                  <span className="font-bold text-xs block mt-0.5 text-[#262220]">
                    {sensorData.emg !== null ? '12.4 µV' : '--'}
                  </span>
                </div>

                <div className="p-2 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
                  <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">MAV (MEAN ABS)</span>
                  <span className="font-bold text-xs block mt-0.5 text-[#262220]">
                    {sensorData.emg !== null ? '9.1 µV' : '--'}
                  </span>
                </div>

                <div className="p-2 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
                  <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">ZCR (CROSSING)</span>
                  <span className="font-bold text-xs block mt-0.5 text-[#262220]">
                    {sensorData.emg !== null ? '44 Hz' : '--'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Inertial Measurement Unit (IMU 6-DOF) Card */}
            <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E5E0D8]/60">
                <div className="flex items-center gap-2">
                  <Compass size={15} className="text-[#41634F]" />
                  <h3 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
                    Inertial Measurement Unit (IMU 6-DOF)
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-[#8C827A]">Spatial Head Tracking</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Accelerometer */}
                <div className="p-3 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
                  <span className="text-[10px] font-mono text-[#8C827A] uppercase tracking-wider block mb-2">
                    Accelerometer (g)
                  </span>
                  {sensorData.accel ? (
                    <div className="grid grid-cols-3 gap-2 font-mono text-center">
                      <div className="p-1.5 bg-[#FFFFFF] border border-[#E5E0D8] rounded">
                        <span className="text-[10px] text-[#8C827A] block">X</span>
                        <span className="text-xs font-bold text-[#262220]">{sensorData.accel.x.toFixed(2)}</span>
                      </div>
                      <div className="p-1.5 bg-[#FFFFFF] border border-[#E5E0D8] rounded">
                        <span className="text-[10px] text-[#8C827A] block">Y</span>
                        <span className="text-xs font-bold text-[#262220]">{sensorData.accel.y.toFixed(2)}</span>
                      </div>
                      <div className="p-1.5 bg-[#FFFFFF] border border-[#E5E0D8] rounded">
                        <span className="text-[10px] text-[#8C827A] block">Z</span>
                        <span className="text-xs font-bold text-[#262220]">{sensorData.accel.z.toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-center font-mono text-xs text-[#8C827A]">Waiting for hardware</div>
                  )}
                </div>

                {/* Gyroscope */}
                <div className="p-3 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
                  <span className="text-[10px] font-mono text-[#8C827A] uppercase tracking-wider block mb-2">
                    Gyroscope (°/s)
                  </span>
                  {sensorData.gyro ? (
                    <div className="grid grid-cols-3 gap-2 font-mono text-center">
                      <div className="p-1.5 bg-[#FFFFFF] border border-[#E5E0D8] rounded">
                        <span className="text-[10px] text-[#8C827A] block">X</span>
                        <span className="text-xs font-bold text-[#262220]">{sensorData.gyro.x.toFixed(1)}</span>
                      </div>
                      <div className="p-1.5 bg-[#FFFFFF] border border-[#E5E0D8] rounded">
                        <span className="text-[10px] text-[#8C827A] block">Y</span>
                        <span className="text-xs font-bold text-[#262220]">{sensorData.gyro.y.toFixed(1)}</span>
                      </div>
                      <div className="p-1.5 bg-[#FFFFFF] border border-[#E5E0D8] rounded">
                        <span className="text-[10px] text-[#8C827A] block">Z</span>
                        <span className="text-xs font-bold text-[#262220]">{sensorData.gyro.z.toFixed(1)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-center font-mono text-xs text-[#8C827A]">Waiting for hardware</div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Hardware Diagnostics & Raw GATT Inspector (Collapsible) */}
            <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setShowDebug(!showDebug)}
                className="w-full px-5 py-3 bg-[#FBF9F5] hover:bg-[#F0ECE1] border-b border-[#E5E0D8] flex items-center justify-between text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-[#41634F]" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#262220]">
                    Hardware Diagnostics &amp; Raw GATT Inspector
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#8C827A]">
                  <span>{showDebug ? 'Hide' : 'Show Details'}</span>
                  <ChevronRight size={14} className={`transition-transform duration-200 ${showDebug ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {showDebug && (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2 bg-[#FBF9F5] border border-[#E5E0D8] rounded">
                      <span className="text-[10px] text-[#736B63] block">Bluetooth Radio</span>
                      <span className="font-bold text-[#262220]">{details.isBluetoothAvailable ? 'Available' : 'Unavailable'}</span>
                    </div>
                    <div className="p-2 bg-[#FBF9F5] border border-[#E5E0D8] rounded">
                      <span className="text-[10px] text-[#736B63] block">GATT Server</span>
                      <span className="font-bold text-[#262220]">{details.device.gattConnected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                    <div className="p-2 bg-[#FBF9F5] border border-[#E5E0D8] rounded">
                      <span className="text-[10px] text-[#736B63] block">Service UUID</span>
                      <span className="font-bold text-[#262220] truncate block" title={details.device.serviceUuid || 'None'}>
                        {details.device.serviceUuid ? details.device.serviceUuid.slice(0, 8) + '...' : 'Missing'}
                      </span>
                    </div>
                    <div className="p-2 bg-[#FBF9F5] border border-[#E5E0D8] rounded">
                      <span className="text-[10px] text-[#736B63] block">Data Packets</span>
                      <span className="font-bold text-[#262220]">{details.stats.packetCount} pkts</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#736B63] uppercase tracking-wider block mb-1">
                      Raw BLE Packet Feed (Last 50 packets):
                    </span>
                    <div className="h-36 bg-[#1E1C1A] text-[#A3E635] font-mono text-[11px] p-3 rounded overflow-y-auto space-y-1">
                      {rawLogs.length > 0 ? (
                        rawLogs.map((log, idx) => <div key={idx}>{log}</div>)
                      ) : (
                        <div className="text-[#6B7280] italic">
                          [GATT Logger]: No packets received. Click Connect Arduino UNO R4 WiFi to establish stream.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Prediction, Model & Hardware Controls ── 5 cols */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. BoneTalk Prediction & Neural Voice Card */}
            <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E5E0D8]/60">
                <div className="flex items-center gap-2">
                  <Terminal size={15} className="text-[#41634F]" />
                  <h3 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
                    BoneTalk Prediction &amp; Neural Voice
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-[#8C827A]">Pattern Classification</span>
              </div>

              <div className="py-6 px-4 bg-[#FBF9F5] border border-[#E5E0D8] rounded-sm text-center mb-4">
                <span className="text-[10px] font-mono text-[#8C827A] uppercase tracking-widest block mb-2">
                  PREDICTED SILENT SPEECH COMMAND
                </span>
                <span
                  className={`font-mono text-xl sm:text-2xl font-bold tracking-wider block ${
                    sensorData.prediction ? 'text-[#2B382D]' : 'text-[#8C827A]'
                  }`}
                >
                  {sensorData.prediction ? sensorData.prediction : 'Waiting for signal...'}
                </span>
                <span className="text-[11px] text-[#8C827A] mt-1 block">
                  {sensorData.prediction
                    ? 'Inference pattern activation classified by model.'
                    : 'Inference fires when pattern activation is classified by model.'}
                </span>

                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => sensorData.prediction && speechService.speak(sensorData.prediction)}
                    disabled={!sensorData.prediction}
                    className="px-3 py-1 bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm text-xs font-mono text-[#5C554E] hover:text-[#262220] flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  >
                    <Volume2 size={12} />
                    <span>SPEAK</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSensorData((prev) => ({ ...prev, prediction: null }))}
                    disabled={!sensorData.prediction}
                    className="px-3 py-1 bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm text-xs font-mono text-[#5C554E] hover:text-[#262220] flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  >
                    <X size={12} />
                    <span>CLEAR</span>
                  </button>
                </div>
              </div>

              {/* Metric Footer Boxes */}
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
                  <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">CONFIDENCE</span>
                  <span className="font-bold text-xs block mt-0.5 text-[#262220]">
                    {sensorData.confidence !== null ? `${(sensorData.confidence * 100).toFixed(0)}%` : '--'}
                  </span>
                </div>

                <div className="p-2 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
                  <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">SIGNAL QUALITY</span>
                  <span className="font-bold text-xs block mt-0.5 text-[#262220]">
                    {isConnected ? 'Good' : '--'}
                  </span>
                </div>

                <div className="p-2 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
                  <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">MODEL STATUS</span>
                  <span className="font-bold text-xs block mt-0.5 text-[#262220]">
                    {isConnected ? 'Active' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Hardware Gateway & BLE Controls Card */}
            <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E0D8]/60">
                <div className="flex items-center gap-2">
                  <Radio size={15} className="text-[#41634F]" />
                  <h3 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
                    Hardware Gateway &amp; BLE Controls
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    isConnected
                      ? 'bg-[#E8EFEA] text-[#2B382D] border border-[#41634F]/30'
                      : 'bg-[#FEE2E2] text-[#991B1B] border border-[#EF4444]/40'
                  }`}
                >
                  {isConnected ? 'SYSTEM: READY' : 'SYSTEM: NOT READY'}
                </span>
              </div>

              {/* Status Checklist */}
              <ul className="space-y-2 text-xs font-mono">
                <li className="flex items-center justify-between py-1 border-b border-[#E5E0D8]/50">
                  <span className="text-[#5C554E]">Bluetooth Radio:</span>
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      details.isBluetoothAvailable ? 'text-[#15803D]' : 'text-[#DC2626]'
                    }`}
                  >
                    {details.isBluetoothAvailable ? (
                      <>
                        <CheckCircle2 size={12} /> Ready
                      </>
                    ) : (
                      <>
                        <XCircle size={12} /> Off / Unavailable
                      </>
                    )}
                  </span>
                </li>

                <li className="flex items-center justify-between py-1 border-b border-[#E5E0D8]/50">
                  <span className="text-[#5C554E]">Browser Web Bluetooth:</span>
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      details.isSupported ? 'text-[#15803D]' : 'text-[#DC2626]'
                    }`}
                  >
                    {details.isSupported ? (
                      <>
                        <CheckCircle2 size={12} /> Supported
                      </>
                    ) : (
                      <>
                        <XCircle size={12} /> Unsupported
                      </>
                    )}
                  </span>
                </li>

                <li className="flex items-center justify-between py-1 border-b border-[#E5E0D8]/50">
                  <span className="text-[#5C554E]">Browser Permission:</span>
                  <span className="font-semibold text-[#5C554E]">
                    {details.device.id ? 'Granted' : 'Required'}
                  </span>
                </li>

                <li className="flex items-center justify-between py-1 border-b border-[#E5E0D8]/50">
                  <span className="text-[#5C554E]">Target Device:</span>
                  <span className="font-semibold text-[#262220]">
                    {details.device.name || (isConnected ? 'BoneTalk Arduino UNO R4' : 'Not Connected')}
                  </span>
                </li>

                <li className="flex items-center justify-between py-1 border-b border-[#E5E0D8]/50">
                  <span className="text-[#5C554E]">GATT Telemetry Service:</span>
                  <span
                    className={`font-semibold ${
                      details.device.serviceFound ? 'text-[#15803D]' : 'text-[#8C827A]'
                    }`}
                  >
                    {details.device.serviceFound ? 'Detected' : 'Waiting'}
                  </span>
                </li>

                <li className="flex items-center justify-between py-1">
                  <span className="text-[#5C554E]">Data Stream:</span>
                  <span
                    className={`font-semibold ${
                      details.state === 'DATA STREAM ACTIVE'
                        ? 'text-[#15803D]'
                        : isConnected
                        ? 'text-[#EAB308]'
                        : 'text-[#8C827A]'
                    }`}
                  >
                    {details.state === 'DATA STREAM ACTIVE'
                      ? 'Active'
                      : isConnected
                      ? 'Waiting'
                      : 'Idle'}
                  </span>
                </li>
              </ul>

              {/* Status / Alert Messages */}
              {isUnavailable ? (
                <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded text-xs text-[#991B1B] space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle size={14} />
                    <span>Bluetooth is turned off or unavailable.</span>
                  </div>
                  <p className="text-[11px]">
                    Turn on Bluetooth on your computer and try again.
                  </p>
                  <button
                    type="button"
                    onClick={handleRetryAvailability}
                    className="mt-1 px-3 py-1 bg-[#DC2626] text-white rounded text-[11px] font-mono hover:bg-[#B91C1C] flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={11} />
                    <span>TRY AGAIN</span>
                  </button>
                </div>
              ) : isLost ? (
                <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded text-xs text-[#991B1B] space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle size={14} />
                    <span>Arduino connection lost.</span>
                  </div>
                  <p className="text-[11px]">
                    Device disconnected. Check power switch and reconnect.
                  </p>
                  <button
                    type="button"
                    onClick={handleConnect}
                    className="mt-1 px-3 py-1 bg-[#DC2626] text-white rounded text-[11px] font-mono hover:bg-[#B91C1C] flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={11} />
                    <span>RECONNECT ARDUINO</span>
                  </button>
                </div>
              ) : isConnected ? (
                <div className="p-3 bg-[#E8EFEA] border border-[#41634F]/30 rounded text-xs text-[#2B382D]">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 size={14} className="text-[#41634F]" />
                    <span>BoneTalk Device Verified</span>
                  </div>
                  <span className="text-[11px] text-[#41634F] block mt-0.5">
                    Physical Arduino UNO R4 stream active. Real bio-potential telemetry streaming.
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-[#FBF9F5] border border-[#E5E0D8] rounded text-xs text-[#5C554E]">
                  <span>
                    Turn on Bluetooth on your computer, then select your BoneTalk Arduino when the browser asks for permission.
                  </span>
                </div>
              )}

              {/* Primary Action Buttons */}
              <div className="pt-2">
                {!isConnected ? (
                  <button
                    type="button"
                    onClick={handleConnect}
                    disabled={isConnecting || isUnavailable}
                    className={`w-full py-2.5 px-4 rounded-sm font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      isConnecting || isUnavailable
                        ? 'bg-[#E5E0D8] text-[#8C827A] cursor-not-allowed'
                        : 'bg-[#2B382D] text-[#FFFFFF] hover:bg-[#38493B] shadow-xs'
                    }`}
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>CONNECTING TO ARDUINO...</span>
                      </>
                    ) : (
                      <>
                        <Bluetooth size={14} />
                        <span>CONNECT ARDUINO UNO R4 WIFI</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="w-full py-2.5 px-4 rounded-sm font-mono text-xs font-bold uppercase tracking-wider bg-[#DC2626] text-[#FFFFFF] hover:bg-[#B91C1C] flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                  >
                    <Power size={13} />
                    <span>DISCONNECT</span>
                  </button>
                )}
              </div>

              {/* Diagnostics Footer info */}
              <div className="pt-2 border-t border-[#E5E0D8]/60 flex items-center justify-between text-[11px] font-mono text-[#8C827A]">
                <span className="flex items-center gap-1">
                  <Battery size={12} />
                  <span>Battery: {sensorData.battery !== null ? `${sensorData.battery}%` : '--'}</span>
                </span>
                <span>Rate: {details.stats.packetRate > 0 ? `${details.stats.packetRate} pkts/s` : '--'}</span>
                <span>Duration: {formattedDuration}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Console Footer ── */}
      <footer className="bg-[#FFFFFF] border-t border-[#E5E0D8] px-4 sm:px-8 py-3 text-[11px] font-mono text-[#8C827A] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[#262220]">BoneTalk Hardware &amp; Neural Console</span>
          <span>•</span>
          <span>Bluetooth Low Energy (GATT)</span>
          <span>•</span>
          <span>BONE-01 Transceiver</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#41634F]' : 'bg-[#8C827A]'}`} />
          <span>Real-time Wearable Hardware Standard</span>
        </div>
      </footer>
    </div>
  )
}

export default ConnectDevicePage
