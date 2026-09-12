import React, { useState } from 'react'
import { Radio, Plug, Unplug, AlertTriangle, RefreshCw } from 'lucide-react'
import { useModelControl } from '../../context/ModelControlContext'

export const HardwareConnectionCard: React.FC = () => {
  const {
    connectionStatus,
    connectionError,
    settings,
    updateSettings,
    connectHardware,
    disconnectHardware,
    sendCommand,
  } = useModelControl()

  const [isEditing, setIsEditing] = useState(false)
  const [formState, setFormState] = useState({
    deviceId: settings.deviceId,
    mqttBrokerUrl: settings.mqttBrokerUrl,
    mqttPort: settings.mqttPort,
    mqttUsername: settings.mqttUsername,
    mqttPassword: settings.mqttPassword,
    mqttClientId: settings.mqttClientId,
    subscribeTopic: settings.subscribeTopic,
    publishTopic: settings.publishTopic,
    connectionType: settings.connectionType,
  })

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings(formState)
    setIsEditing(false)
  }

  const handlePingHardware = () => {
    sendCommand('PING', { timestamp: Date.now() })
  }

  const isConnected = connectionStatus === 'Connected'
  const isConnecting = connectionStatus === 'Connecting...' || connectionStatus === 'Reconnecting'

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E0D8]/60">
        <div className="flex items-center gap-2">
          <Radio size={15} className="text-[#41634F]" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
            Hardware Connection &amp; MQTT Gateway
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
              isConnected
                ? 'bg-[#E8EFEA] text-[#2B382D] border border-[#41634F]/30'
                : isConnecting
                ? 'bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/40'
                : connectionStatus === 'Connection Error'
                ? 'bg-[#FEE2E2] text-[#991B1B] border border-[#EF4444]/40'
                : 'bg-[#F5F2EB] text-[#736B63] border border-[#E5E0D8]'
            }`}
          >
            {connectionStatus}
          </span>
        </div>
      </div>

      {/* Error alert if connection failed */}
      {connectionError && (
        <div className="mb-4 p-3 rounded-sm bg-[#FEF2F2] border border-[#FCA5A5] flex items-start gap-2.5 text-xs font-mono text-[#991B1B]">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          <div>
            <span className="font-bold block">MQTT Connection Error</span>
            <span className="text-[11px] text-[#B91C1C] mt-0.5 block">{connectionError}</span>
            <span className="text-[10px] text-[#7F1D1D] mt-1 block">
              Ensure MQTT WebSocket broker is running (e.g. EMQX ws://broker.emqx.io:8083/mqtt or local broker).
            </span>
          </div>
        </div>
      )}

      {/* Current Connection Parameters */}
      {!isEditing ? (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs mb-4">
            <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
              <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">Device ID</span>
              <span className="font-semibold text-[#262220]">{settings.deviceId}</span>
            </div>

            <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
              <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">Broker URL</span>
              <span className="font-semibold text-[#262220] truncate block" title={settings.mqttBrokerUrl}>
                {settings.mqttBrokerUrl}
              </span>
            </div>

            <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
              <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">Connection Type</span>
              <span className="font-semibold text-[#262220]">WebSocket MQTT (8083)</span>
            </div>

            <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
              <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">Subscribe Topic</span>
              <span className="font-semibold text-[#262220]">{settings.subscribeTopic}</span>
            </div>

            <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
              <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">Publish Topic</span>
              <span className="font-semibold text-[#262220]">{settings.publishTopic}</span>
            </div>

            <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
              <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">Auth Credentials</span>
              <span className="font-semibold text-[#262220]">
                {settings.mqttUsername ? `User: ${settings.mqttUsername}` : 'Anonymous / None'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              {!isConnected ? (
                <button
                  type="button"
                  onClick={connectHardware}
                  disabled={isConnecting}
                  className="flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-mono font-semibold bg-[#2B382D] text-[#FFFFFF] hover:bg-[#38493B] transition-all cursor-pointer shadow-xs disabled:opacity-60"
                >
                  <Plug size={13} />
                  <span>{isConnecting ? 'CONNECTING...' : 'CONNECT HARDWARE'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={disconnectHardware}
                  className="flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-mono font-semibold bg-[#FFFFFF] border border-[#DC2626] text-[#DC2626] hover:bg-[#FEF2F2] transition-all cursor-pointer shadow-xs"
                >
                  <Unplug size={13} />
                  <span>DISCONNECT</span>
                </button>
              )}

              {isConnected && (
                <button
                  type="button"
                  onClick={handlePingHardware}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-mono border border-[#E5E0D8] bg-[#FBF9F5] text-[#5C554E] hover:text-[#262220] hover:bg-[#F5F2EB] transition-all"
                  title="Send ping heartbeat command to device"
                >
                  <RefreshCw size={12} />
                  <span>PING</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-xs font-mono text-[#5C554E] hover:text-[#262220] underline"
            >
              Configure Gateway Parameters
            </button>
          </div>
        </div>
      ) : (
        /* Edit Settings Form */
        <form onSubmit={handleSaveSettings} className="space-y-3 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-[#736B63] uppercase tracking-wider mb-1">
                Device ID
              </label>
              <input
                type="text"
                value={formState.deviceId}
                onChange={(e) => setFormState({ ...formState, deviceId: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-[#E5E0D8] bg-[#FFFFFF] text-[#262220] focus:outline-none focus:ring-1 focus:ring-[#41634F]"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#736B63] uppercase tracking-wider mb-1">
                MQTT Broker URL (WebSocket)
              </label>
              <input
                type="text"
                value={formState.mqttBrokerUrl}
                onChange={(e) => setFormState({ ...formState, mqttBrokerUrl: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-[#E5E0D8] bg-[#FFFFFF] text-[#262220] focus:outline-none focus:ring-1 focus:ring-[#41634F]"
                placeholder="ws://broker.emqx.io:8083/mqtt"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#736B63] uppercase tracking-wider mb-1">
                Subscribe Topic
              </label>
              <input
                type="text"
                value={formState.subscribeTopic}
                onChange={(e) => setFormState({ ...formState, subscribeTopic: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-[#E5E0D8] bg-[#FFFFFF] text-[#262220] focus:outline-none focus:ring-1 focus:ring-[#41634F]"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#736B63] uppercase tracking-wider mb-1">
                Publish Topic
              </label>
              <input
                type="text"
                value={formState.publishTopic}
                onChange={(e) => setFormState({ ...formState, publishTopic: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-[#E5E0D8] bg-[#FFFFFF] text-[#262220] focus:outline-none focus:ring-1 focus:ring-[#41634F]"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#736B63] uppercase tracking-wider mb-1">
                Username (Optional)
              </label>
              <input
                type="text"
                value={formState.mqttUsername}
                onChange={(e) => setFormState({ ...formState, mqttUsername: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-[#E5E0D8] bg-[#FFFFFF] text-[#262220] focus:outline-none focus:ring-1 focus:ring-[#41634F]"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#736B63] uppercase tracking-wider mb-1">
                Password (Optional)
              </label>
              <input
                type="password"
                value={formState.mqttPassword}
                onChange={(e) => setFormState({ ...formState, mqttPassword: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-[#E5E0D8] bg-[#FFFFFF] text-[#262220] focus:outline-none focus:ring-1 focus:ring-[#41634F]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E0D8]/60">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded border border-[#E5E0D8] text-[#5C554E] hover:bg-[#F5F2EB]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-[#2B382D] text-[#FFFFFF] hover:bg-[#38493B] font-semibold"
            >
              Save Configuration
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
