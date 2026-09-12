import React from 'react'
import { Activity, Radio, Cpu, Battery, Wifi, WifiOff, Gauge, Compass } from 'lucide-react'
import type { EmgMetrics, ImuData } from '../../../hooks/useDeviceTelemetry'
import type { MqttConnectionStatus } from '../../../lib/mqttService'

interface LiveSensorDataProps {
  mqttStatus: MqttConnectionStatus
  hasEmgData: boolean
  hasImuData: boolean
  emgBuffer: number[]
  emgMetrics: EmgMetrics
  imu: ImuData
  batteryPct: number | null
  packetRate: number
  signalQuality: 'Good' | 'Fair' | 'Poor' | 'No Signal'
  lastPacketTime: Date | null
}

export const LiveSensorDataSection: React.FC<LiveSensorDataProps> = ({
  mqttStatus,
  hasEmgData,
  hasImuData,
  emgBuffer,
  emgMetrics,
  imu,
  batteryPct,
  packetRate,
  signalQuality,
  lastPacketTime,
}) => {
  const isConnected = mqttStatus === 'connected'

  return (
    <div className="space-y-6">
      {/* ── Top Telemetry Status Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-sm border border-border/80 bg-graphite-elevated/60 p-3.5 flex items-center justify-between">
          <div>
            <span className="block font-mono text-[9px] uppercase tracking-wider text-cream-muted">Hardware Link</span>
            <span className="font-mono text-xs font-bold text-cream flex items-center gap-1.5 mt-0.5">
              {isConnected ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-cyan-signal animate-pulse" />
                  <span className="text-cyan-signal">STREAMING</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-zinc-600" />
                  <span className="text-zinc-400">DISCONNECTED</span>
                </>
              )}
            </span>
          </div>
          {isConnected ? <Wifi size={16} className="text-cyan-signal" /> : <WifiOff size={16} className="text-zinc-500" />}
        </div>

        <div className="rounded-sm border border-border/80 bg-graphite-elevated/60 p-3.5 flex items-center justify-between">
          <div>
            <span className="block font-mono text-[9px] uppercase tracking-wider text-cream-muted">Packet Rate</span>
            <span className="font-mono text-xs font-bold text-cream mt-0.5 block">
              {isConnected ? `${packetRate} Hz` : '—'}
            </span>
          </div>
          <Activity size={16} className={isConnected && packetRate > 0 ? 'text-cyan-signal' : 'text-zinc-600'} />
        </div>

        <div className="rounded-sm border border-border/80 bg-graphite-elevated/60 p-3.5 flex items-center justify-between">
          <div>
            <span className="block font-mono text-[9px] uppercase tracking-wider text-cream-muted">Signal Quality</span>
            <span
              className={`font-mono text-xs font-bold mt-0.5 block ${
                signalQuality === 'Good'
                  ? 'text-emerald-400'
                  : signalQuality === 'Fair'
                  ? 'text-yellow-400'
                  : signalQuality === 'Poor'
                  ? 'text-red-400'
                  : 'text-zinc-500'
              }`}
            >
              {signalQuality}
            </span>
          </div>
          <Radio size={16} className={isConnected ? 'text-cyan-signal' : 'text-zinc-600'} />
        </div>

        <div className="rounded-sm border border-border/80 bg-graphite-elevated/60 p-3.5 flex items-center justify-between">
          <div>
            <span className="block font-mono text-[9px] uppercase tracking-wider text-cream-muted">Device Battery</span>
            <span className="font-mono text-xs font-bold text-cream mt-0.5 block">
              {batteryPct !== null ? `${batteryPct}%` : '—'}
            </span>
          </div>
          <Battery size={16} className={batteryPct !== null && batteryPct > 20 ? 'text-cyan-signal' : 'text-zinc-600'} />
        </div>
      </div>

      {/* ── EMG Signal & Waveform Section ── */}
      <div className="rounded-sm border border-border/80 bg-graphite-light/50 p-5 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${hasEmgData ? 'bg-cyan-signal animate-pulse' : 'bg-zinc-600'}`} />
            <span className="font-mono text-[11px] uppercase tracking-widest text-cyan-signal font-semibold">
              Primary EMG Channel (Ch1 Differential)
            </span>
          </div>
          <span className="font-mono text-[10px] text-cream-muted">
            {lastPacketTime ? `Last: ${lastPacketTime.toLocaleTimeString()}` : 'Awaiting hardware stream'}
          </span>
        </div>

        {/* Live Canvas / Waveform Display */}
        <div className="relative rounded-sm border border-border bg-graphite/90 h-44 overflow-hidden flex items-center justify-center">
          {hasEmgData && emgBuffer.length > 0 ? (
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 120">
              <defs>
                <linearGradient id="emgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00D8A5" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00D8A5" stopOpacity="1" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="400" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <line x1="0" y1="60" x2="400" y2="60" stroke="rgba(0,216,165,0.2)" />
              <line x1="0" y1="90" x2="400" y2="90" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              {/* Waveform Polyline */}
              <polyline
                fill="none"
                stroke="url(#emgGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={emgBuffer
                  .map((val, idx) => {
                    const x = (idx / (emgBuffer.length - 1 || 1)) * 400
                    // Center at y=60, scale +/- 50
                    const y = Math.max(10, Math.min(110, 60 - val * 0.5))
                    return `${x.toFixed(1)},${y.toFixed(1)}`
                  })
                  .join(' ')}
              />
            </svg>
          ) : (
            <div className="text-center p-6 space-y-2">
              <Cpu size={24} className="mx-auto text-zinc-600 animate-pulse" />
              <p className="font-mono text-xs text-cream-muted">
                {isConnected ? 'Waiting for device data...' : 'Hardware disconnected — No live data stream'}
              </p>
              <p className="text-[10px] font-mono text-zinc-600">
                Connect an ESP32-S3 over MQTT or WebSocket to stream real-time biometric voltage
              </p>
            </div>
          )}

          <div className="pointer-events-none absolute top-2 left-3 font-mono text-[9px] text-cream-muted/50">
            FS: 1000 Hz • ±3.3V
          </div>
          <div className="pointer-events-none absolute bottom-2 right-3 font-mono text-[9px] text-cream-muted/50">
            Buffer: {emgBuffer.length} samples
          </div>
        </div>

        {/* Real Computed Mathematical Features */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-border/60 text-center font-mono">
          <div className="bg-graphite-elevated/40 p-2.5 rounded-sm border border-border/50">
            <span className="block text-[9px] text-cream-muted uppercase tracking-wider">Instantaneous</span>
            <span className="text-sm sm:text-base font-bold text-cream">
              {hasEmgData ? `${emgMetrics.currentValue} μV` : '—'}
            </span>
          </div>

          <div className="bg-graphite-elevated/40 p-2.5 rounded-sm border border-border/50">
            <span className="block text-[9px] text-cyan-signal uppercase tracking-wider">RMS Energy</span>
            <span className="text-sm sm:text-base font-bold text-cyan-signal">
              {hasEmgData ? `${emgMetrics.rms} μV` : '—'}
            </span>
          </div>

          <div className="bg-graphite-elevated/40 p-2.5 rounded-sm border border-border/50">
            <span className="block text-[9px] text-cream-muted uppercase tracking-wider">MAV</span>
            <span className="text-sm sm:text-base font-bold text-cream">
              {hasEmgData ? `${emgMetrics.mav} μV` : '—'}
            </span>
          </div>

          <div className="bg-graphite-elevated/40 p-2.5 rounded-sm border border-border/50">
            <span className="block text-[9px] text-cream-muted uppercase tracking-wider">Zero Crossings (ZCR)</span>
            <span className="text-sm sm:text-base font-bold text-cream">
              {hasEmgData ? emgMetrics.zcr : '—'}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-graphite-elevated/40 p-2.5 rounded-sm border border-border/50">
            <span className="block text-[9px] text-cream-muted uppercase tracking-wider">Peak Amplitude</span>
            <span className="text-sm sm:text-base font-bold text-emerald-400">
              {hasEmgData ? `${emgMetrics.peak} μV` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* ── 6-Axis IMU (Accelerometer & Gyroscope) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Accelerometer */}
        <div className="rounded-sm border border-border/80 bg-graphite-light/50 p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Gauge size={14} className="text-cyan-signal" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-cyan-signal font-semibold">
                Accelerometer (g)
              </span>
            </div>
            <span className="font-mono text-[9px] text-cream-muted">3-AXIS LINEAR</span>
          </div>

          {hasImuData ? (
            <div className="grid grid-cols-3 gap-2.5 font-mono text-center">
              <div className="bg-graphite-elevated p-3 rounded-sm border border-border">
                <span className="text-[9px] text-cream-muted block">ACCEL X</span>
                <span className="text-base font-bold text-cream">{imu.accel.x.toFixed(2)} g</span>
              </div>
              <div className="bg-graphite-elevated p-3 rounded-sm border border-border">
                <span className="text-[9px] text-cream-muted block">ACCEL Y</span>
                <span className="text-base font-bold text-cream">{imu.accel.y.toFixed(2)} g</span>
              </div>
              <div className="bg-graphite-elevated p-3 rounded-sm border border-border">
                <span className="text-[9px] text-cream-muted block">ACCEL Z</span>
                <span className="text-base font-bold text-cream">{imu.accel.z.toFixed(2)} g</span>
              </div>
            </div>
          ) : (
            <div className="p-5 text-center text-zinc-500 font-mono text-xs">
              Waiting for IMU accelerometer packet...
            </div>
          )}
        </div>

        {/* Gyroscope */}
        <div className="rounded-sm border border-border/80 bg-graphite-light/50 p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Compass size={14} className="text-cyan-signal" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-cyan-signal font-semibold">
                Gyroscope (deg/s)
              </span>
            </div>
            <span className="font-mono text-[9px] text-cream-muted">3-AXIS ANGULAR</span>
          </div>

          {hasImuData ? (
            <div className="grid grid-cols-3 gap-2.5 font-mono text-center">
              <div className="bg-graphite-elevated p-3 rounded-sm border border-border">
                <span className="text-[9px] text-cream-muted block">GYRO X</span>
                <span className="text-base font-bold text-cream">{imu.gyro.x.toFixed(1)}°/s</span>
              </div>
              <div className="bg-graphite-elevated p-3 rounded-sm border border-border">
                <span className="text-[9px] text-cream-muted block">GYRO Y</span>
                <span className="text-base font-bold text-cream">{imu.gyro.y.toFixed(1)}°/s</span>
              </div>
              <div className="bg-graphite-elevated p-3 rounded-sm border border-border">
                <span className="text-[9px] text-cream-muted block">GYRO Z</span>
                <span className="text-base font-bold text-cream">{imu.gyro.z.toFixed(1)}°/s</span>
              </div>
            </div>
          ) : (
            <div className="p-5 text-center text-zinc-500 font-mono text-xs">
              Waiting for IMU gyroscope packet...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
