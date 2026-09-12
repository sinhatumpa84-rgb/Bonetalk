import React, { useState } from 'react'
import { Wifi, WifiOff, Plug, Server, RefreshCw, Key, Shield } from 'lucide-react'
import type { MqttConnectionStatus, MqttConfig } from '../../../lib/mqttService'

interface DeviceConnectionProps {
  status: MqttConnectionStatus
  config: MqttConfig
  onConnect: (customConfig?: Partial<MqttConfig>) => void
  onDisconnect: () => void
}

export const DeviceConnectionSection: React.FC<DeviceConnectionProps> = ({
  status,
  config,
  onConnect,
  onDisconnect,
}) => {
  const [brokerUrl, setBrokerUrl] = useState(config.brokerUrl)
  const [emgTopic, setEmgTopic] = useState(config.emgTopic)
  const [imuTopic, setImuTopic] = useState(config.imuTopic || 'bonetalk/imu')
  const [telemetryTopic, setTelemetryTopic] = useState(config.telemetryTopic || 'bonetalk/telemetry')
  const [clientId, setClientId] = useState(config.clientId || '')
  const [username, setUsername] = useState(config.username || '')
  const [password, setPassword] = useState(config.password || '')

  const isConnected = status === 'connected'
  const isConnecting = status === 'connecting' || status === 'reconnecting'

  const handleToggleConnect = (e: React.FormEvent) => {
    e.preventDefault()
    if (isConnected) {
      onDisconnect()
    } else {
      onConnect({
        brokerUrl: brokerUrl.trim(),
        emgTopic: emgTopic.trim(),
        imuTopic: imuTopic.trim(),
        telemetryTopic: telemetryTopic.trim(),
        clientId: clientId.trim() || undefined,
        username: username.trim() || undefined,
        password: password.trim() || undefined,
      })
    }
  }

  return (
    <div className="rounded-sm border border-border/80 bg-graphite-light/50 p-5 backdrop-blur-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Server size={16} className="text-cyan-signal" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-cyan-signal font-semibold">
            Hardware & MQTT Bridge Configuration
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isConnected
                ? 'bg-cyan-signal animate-pulse'
                : isConnecting
                ? 'bg-yellow-400 animate-spin'
                : status === 'error'
                ? 'bg-red-500'
                : 'bg-zinc-600'
            }`}
          />
          <span
            className={`font-mono text-[10px] font-bold uppercase ${
              isConnected
                ? 'text-cyan-signal'
                : isConnecting
                ? 'text-yellow-400'
                : status === 'error'
                ? 'text-red-400'
                : 'text-zinc-500'
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      <form onSubmit={handleToggleConnect} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          {/* Broker URL */}
          <div className="sm:col-span-2">
            <label className="block text-[10px] uppercase text-cream-muted mb-1">
              MQTT WebSocket Broker URL *
            </label>
            <input
              type="text"
              value={brokerUrl}
              onChange={(e) => setBrokerUrl(e.target.value)}
              disabled={isConnected || isConnecting}
              placeholder="ws://localhost:9001 or wss://broker.emqx.io:8084/mqtt"
              className="w-full rounded-sm border border-border bg-graphite-elevated px-3 py-2 text-cream focus:border-cyan-signal focus:outline-none transition-colors"
            />
            <span className="text-[9px] text-cream-muted/60 mt-1 block">
              Browser-compatible MQTT over WebSockets (ws:// or wss://)
            </span>
          </div>

          {/* EMG Topic */}
          <div>
            <label className="block text-[10px] uppercase text-cream-muted mb-1">
              EMG Telemetry Topic
            </label>
            <input
              type="text"
              value={emgTopic}
              onChange={(e) => setEmgTopic(e.target.value)}
              disabled={isConnected || isConnecting}
              placeholder="bonetalk/emg"
              className="w-full rounded-sm border border-border bg-graphite-elevated px-3 py-2 text-cream focus:border-cyan-signal focus:outline-none transition-colors"
            />
          </div>

          {/* IMU Topic */}
          <div>
            <label className="block text-[10px] uppercase text-cream-muted mb-1">
              IMU Telemetry Topic
            </label>
            <input
              type="text"
              value={imuTopic}
              onChange={(e) => setImuTopic(e.target.value)}
              disabled={isConnected || isConnecting}
              placeholder="bonetalk/imu"
              className="w-full rounded-sm border border-border bg-graphite-elevated px-3 py-2 text-cream focus:border-cyan-signal focus:outline-none transition-colors"
            />
          </div>

          {/* Device Telemetry Topic */}
          <div>
            <label className="block text-[10px] uppercase text-cream-muted mb-1">
              Device Status Topic
            </label>
            <input
              type="text"
              value={telemetryTopic}
              onChange={(e) => setTelemetryTopic(e.target.value)}
              disabled={isConnected || isConnecting}
              placeholder="bonetalk/telemetry"
              className="w-full rounded-sm border border-border bg-graphite-elevated px-3 py-2 text-cream focus:border-cyan-signal focus:outline-none transition-colors"
            />
          </div>

          {/* Client ID */}
          <div>
            <label className="block text-[10px] uppercase text-cream-muted mb-1">
              Client ID (Optional)
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              disabled={isConnected || isConnecting}
              placeholder="auto-generated"
              className="w-full rounded-sm border border-border bg-graphite-elevated px-3 py-2 text-cream focus:border-cyan-signal focus:outline-none transition-colors"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-[10px] uppercase text-cream-muted mb-1">
              Username (Optional)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isConnected || isConnecting}
              placeholder="mqtt-user"
              className="w-full rounded-sm border border-border bg-graphite-elevated px-3 py-2 text-cream focus:border-cyan-signal focus:outline-none transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] uppercase text-cream-muted mb-1">
              Password (Optional)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isConnected || isConnecting}
              placeholder="••••••••"
              className="w-full rounded-sm border border-border bg-graphite-elevated px-3 py-2 text-cream focus:border-cyan-signal focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="submit"
            disabled={isConnecting}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-sm px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              isConnected
                ? 'bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30'
                : 'bg-cyan-signal hover:bg-emerald-400 text-graphite shadow-[0_0_15px_rgba(0,216,165,0.25)]'
            }`}
          >
            {isConnecting ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Connecting to Broker...</span>
              </>
            ) : isConnected ? (
              <>
                <WifiOff size={14} />
                <span>Disconnect MQTT</span>
              </>
            ) : (
              <>
                <Wifi size={14} />
                <span>Connect Hardware MQTT</span>
              </>
            )}
          </button>

          <span className="text-[10px] font-mono text-cream-muted/70 text-center sm:text-right">
            {isConnected ? '✓ Real-time telemetry subscription active' : 'Zero fake data • Connects directly to hardware broker'}
          </span>
        </div>
      </form>
    </div>
  )
}
