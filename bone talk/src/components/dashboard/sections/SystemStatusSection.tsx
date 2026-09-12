import React from 'react'
import { Server, Brain, Activity, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react'
import type { MqttConnectionStatus } from '../../../lib/mqttService'

interface SystemStatusProps {
  mqttStatus: MqttConnectionStatus
  backendStatus: 'online' | 'offline' | 'checking'
  modelInfo: {
    loaded: boolean
    classes?: string[]
    featureCount?: number
    modelType?: string
  }
  onRefreshBackend: () => void
}

export const SystemStatusSection: React.FC<SystemStatusProps> = ({
  mqttStatus,
  backendStatus,
  modelInfo,
  onRefreshBackend,
}) => {
  const isBackendOnline = backendStatus === 'online'
  const isMqttOnline = mqttStatus === 'connected'

  return (
    <div className="rounded-sm border border-border/80 bg-graphite-light/50 p-5 backdrop-blur-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Server size={16} className="text-cyan-signal" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-cyan-signal font-semibold">
            System & Architecture Health Status
          </span>
        </div>

        <button
          type="button"
          onClick={onRefreshBackend}
          className="inline-flex items-center gap-1.5 rounded-sm border border-border hover:border-cyan-signal px-2.5 py-1 font-mono text-[10px] text-cream-muted hover:text-cream transition-colors cursor-pointer"
        >
          <RefreshCw size={11} className={backendStatus === 'checking' ? 'animate-spin' : ''} />
          <span>Ping Services</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        {/* 1. Payment & Commerce Engine */}
        <div className="rounded-sm border border-border bg-graphite-elevated/70 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cream-muted uppercase tracking-wider">Commerce API</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
              <CheckCircle2 size={12} />
              ONLINE
            </span>
          </div>
          <span className="font-bold text-cream text-sm block">Express & Razorpay Node Gateway</span>
          <p className="text-[10px] text-cream-muted/70">
            Port 5000 • Dynamic pricing & cryptographic HMAC verification active
          </p>
        </div>

        {/* 2. TinyML / Python Inference Engine */}
        <div className="rounded-sm border border-border bg-graphite-elevated/70 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cream-muted uppercase tracking-wider">AI Inference API</span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                isBackendOnline ? 'text-emerald-400' : 'text-yellow-500'
              }`}
            >
              {isBackendOnline ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
              {isBackendOnline ? 'ONLINE' : 'STANDBY'}
            </span>
          </div>
          <span className="font-bold text-cream text-sm block">
            {modelInfo.modelType || 'BoneTalk Core Inference'}
          </span>
          <p className="text-[10px] text-cream-muted/70">
            {isBackendOnline
              ? `Classes: ${(modelInfo.classes || ['YES', 'NO', 'HELP', 'WATER']).join(', ')}`
              : 'FastAPI service on port 8000 (simulation mode active if offline)'}
          </p>
        </div>

        {/* 3. Real-time Telemetry Bridge */}
        <div className="rounded-sm border border-border bg-graphite-elevated/70 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cream-muted uppercase tracking-wider">Hardware Protocol</span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                isMqttOnline ? 'text-emerald-400' : 'text-zinc-500'
              }`}
            >
              <Activity size={12} />
              {isMqttOnline ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
          <span className="font-bold text-cream text-sm block">MQTT / WebSocket Bridge</span>
          <p className="text-[10px] text-cream-muted/70">
            {isMqttOnline ? 'Streaming 1000Hz biosignals' : 'Waiting for hardware broker connection'}
          </p>
        </div>
      </div>
    </div>
  )
}
