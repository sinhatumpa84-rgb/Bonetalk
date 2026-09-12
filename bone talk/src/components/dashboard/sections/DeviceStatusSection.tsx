import React from 'react'
import { Cpu, Wifi, Radio, Battery, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import type { MqttConnectionStatus } from '../../../lib/mqttService'

interface DeviceStatusProps {
  mqttStatus: MqttConnectionStatus
  backendStatus: 'online' | 'offline' | 'checking'
  modelInfo: {
    loaded: boolean
    classes?: string[]
    featureCount?: number
    modelType?: string
  }
  batteryPct: number | null
  signalQuality: 'Good' | 'Fair' | 'Poor' | 'No Signal'
  lastPacketTime: Date | null
}

export const DeviceStatusSection: React.FC<DeviceStatusProps> = ({
  mqttStatus,
  backendStatus,
  modelInfo,
  batteryPct,
  signalQuality,
  lastPacketTime,
}) => {
  const isMqttConnected = mqttStatus === 'connected'
  const isModelReady = backendStatus === 'online' && modelInfo.loaded

  return (
    <div className="rounded-sm border border-border/80 bg-graphite-light/50 p-5 backdrop-blur-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-cyan-signal" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-cyan-signal font-semibold">
            Device & Hardware Status Panel
          </span>
        </div>
        <span className="font-mono text-[10px] text-cream-muted uppercase">ESP32-S3 CORE</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 font-mono text-xs">
        {/* 1. DEVICE */}
        <div className="rounded-sm border border-border bg-graphite-elevated/70 p-3.5 space-y-1">
          <span className="text-[10px] text-cream-muted uppercase tracking-wider block">Device</span>
          <span className="font-bold text-cream text-sm block">BoneTalk Wearable</span>
          <span className="text-[10px] text-cream-muted/70 block">Surface EMG + 6-Axis IMU Array</span>
        </div>

        {/* 2. HARDWARE CONNECTION */}
        <div className="rounded-sm border border-border bg-graphite-elevated/70 p-3.5 space-y-1">
          <span className="text-[10px] text-cream-muted uppercase tracking-wider block">Connection</span>
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isMqttConnected
                  ? 'bg-cyan-signal animate-pulse'
                  : mqttStatus === 'connecting' || mqttStatus === 'reconnecting'
                  ? 'bg-yellow-400 animate-spin'
                  : 'bg-zinc-600'
              }`}
            />
            <span
              className={`font-bold text-sm uppercase ${
                isMqttConnected
                  ? 'text-cyan-signal'
                  : mqttStatus === 'connecting' || mqttStatus === 'reconnecting'
                  ? 'text-yellow-400'
                  : 'text-zinc-400'
              }`}
            >
              {mqttStatus === 'connected'
                ? 'Connected'
                : mqttStatus === 'connecting'
                ? 'Connecting...'
                : mqttStatus === 'reconnecting'
                ? 'Reconnecting...'
                : 'Disconnected'}
            </span>
          </div>
          <span className="text-[10px] text-cream-muted/70 block">
            {isMqttConnected ? 'Active live link' : 'Awaiting device stream'}
          </span>
        </div>

        {/* 3. MQTT LINK */}
        <div className="rounded-sm border border-border bg-graphite-elevated/70 p-3.5 space-y-1">
          <span className="text-[10px] text-cream-muted uppercase tracking-wider block">MQTT Telemetry</span>
          <div className="flex items-center gap-1.5 font-bold text-sm">
            <Wifi size={14} className={isMqttConnected ? 'text-cyan-signal' : 'text-zinc-600'} />
            <span className={isMqttConnected ? 'text-cream' : 'text-zinc-500'}>
              {isMqttConnected ? 'Connected (WS)' : 'Disconnected'}
            </span>
          </div>
          <span className="text-[10px] text-cream-muted/70 block truncate">
            {isMqttConnected ? 'Topic: bonetalk/#' : 'No active broker connection'}
          </span>
        </div>

        {/* 4. ML MODEL */}
        <div className="rounded-sm border border-border bg-graphite-elevated/70 p-3.5 space-y-1">
          <span className="text-[10px] text-cream-muted uppercase tracking-wider block">ML Model</span>
          <div className="flex items-center gap-1.5 font-bold text-sm">
            {isModelReady ? (
              <CheckCircle2 size={14} className="text-emerald-400" />
            ) : (
              <AlertCircle size={14} className="text-yellow-500" />
            )}
            <span className={isModelReady ? 'text-emerald-400' : 'text-zinc-400'}>
              {backendStatus === 'checking'
                ? 'Checking...'
                : isModelReady
                ? 'Ready'
                : backendStatus === 'offline'
                ? 'Unavailable (Offline)'
                : 'Loading'}
            </span>
          </div>
          <span className="text-[10px] text-cream-muted/70 block truncate">
            {modelInfo.modelType || 'RandomForest / 1D-CNN'}
          </span>
        </div>

        {/* 5. BATTERY & SIGNAL */}
        <div className="rounded-sm border border-border bg-graphite-elevated/70 p-3.5 space-y-1">
          <span className="text-[10px] text-cream-muted uppercase tracking-wider block">Battery & Signal</span>
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-cream flex items-center gap-1">
              <Battery size={13} className="text-cyan-signal" />
              {batteryPct !== null ? `${batteryPct}%` : '—'}
            </span>
            <span
              className={`text-[11px] font-semibold flex items-center gap-1 ${
                signalQuality === 'Good'
                  ? 'text-emerald-400'
                  : signalQuality === 'Fair'
                  ? 'text-yellow-400'
                  : signalQuality === 'Poor'
                  ? 'text-red-400'
                  : 'text-zinc-500'
              }`}
            >
              <Radio size={12} />
              {signalQuality}
            </span>
          </div>
          <span className="text-[10px] text-cream-muted/70 block">Hardware Power Telemetry</span>
        </div>

        {/* 6. LAST DATA PACKET */}
        <div className="rounded-sm border border-border bg-graphite-elevated/70 p-3.5 space-y-1">
          <span className="text-[10px] text-cream-muted uppercase tracking-wider block">Last Packet</span>
          <div className="flex items-center gap-1.5 font-bold text-sm text-cream">
            <Clock size={13} className="text-cyan-signal" />
            <span>{lastPacketTime ? lastPacketTime.toLocaleTimeString() : 'No data received'}</span>
          </div>
          <span className="text-[10px] text-cream-muted/70 block">
            {lastPacketTime ? 'Latest valid telemetry frame' : 'Hardware idle'}
          </span>
        </div>
      </div>
    </div>
  )
}
