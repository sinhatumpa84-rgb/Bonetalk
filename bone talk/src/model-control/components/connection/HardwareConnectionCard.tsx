import React, { useState } from 'react'
import {
  Radio,
  Plug,
  Unplug,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Usb,
  Zap,
} from 'lucide-react'
import { useModelControl } from '../../context/ModelControlContext'

export const HardwareConnectionCard: React.FC = () => {
  const {
    connectionStatus,
    connectionError,
    settings,
    updateSettings,
    connectHardware,
    disconnectHardware,
    devicePresence,
    handshakeStatus,
    lastHandshakeLatency,
    lastHeartbeatAge,
    deviceMetadata,
    systemReadiness,
    executeHandshake,
    sendCommandWithAck,
    serialDetails,
    connectSerial,
    disconnectSerial,
    hasSensorData,
    modelStatus,
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

  const [actionFeedback, setActionFeedback] = useState<{
    text: string
    type: 'success' | 'error' | 'info'
  } | null>(null)
  const [isActing, setIsActing] = useState(false)

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings(formState)
    setIsEditing(false)
  }

  const handleRunHandshake = async () => {
    setIsActing(true)
    setActionFeedback({ text: 'Sending real device_ping with unique request_id...', type: 'info' })
    try {
      const res = await executeHandshake()
      if (res.success) {
        setActionFeedback({
          text: `Handshake SUCCESS: Verified device "${settings.deviceId}" in ${res.latencyMs}ms.`,
          type: 'success',
        })
      } else {
        setActionFeedback({
          text: res.error || 'Handshake failed: No device_pong received from physical hardware.',
          type: 'error',
        })
      }
    } finally {
      setIsActing(false)
    }
  }

  const handleRequestStatus = async () => {
    setIsActing(true)
    setActionFeedback({ text: 'Requesting hardware device_status with ACK...', type: 'info' })
    try {
      const res = await sendCommandWithAck('device_status', {}, 5000)
      if (res.success) {
        setActionFeedback({
          text: `Hardware ACK Received: Device "${settings.deviceId}" status confirmed.`,
          type: 'success',
        })
      } else {
        setActionFeedback({
          text: res.error || 'Device status request timed out without hardware ACK.',
          type: 'error',
        })
      }
    } finally {
      setIsActing(false)
    }
  }

  const handleToggleSerial = async () => {
    if (serialDetails.status === 'CONNECTED') {
      await disconnectSerial()
    } else {
      await connectSerial(115200)
    }
  }

  const isMqttConnected = connectionStatus === 'Connected'
  const isMqttConnecting = connectionStatus === 'Connecting...' || connectionStatus === 'Reconnecting'
  const isDeviceOnline = devicePresence === 'ONLINE'
  const isModelReady = modelStatus === 'Ready'

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 sm:p-5 shadow-xs">
      {/* ── Header with Combined System Readiness ── */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E0D8]/60">
        <div className="flex items-center gap-2">
          <Radio size={15} className="text-[#41634F]" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
            BoneTalk Device &amp; Hardware Gateway
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 ${
              systemReadiness === 'READY'
                ? 'bg-[#E8EFEA] text-[#2B382D] border border-[#41634F]/30'
                : 'bg-[#FEE2E2] text-[#991B1B] border border-[#EF4444]/40'
            }`}
          >
            {systemReadiness === 'READY' ? (
              <CheckCircle2 size={11} className="text-[#41634F]" />
            ) : (
              <XCircle size={11} className="text-[#DC2626]" />
            )}
            <span>SYSTEM: {systemReadiness}</span>
          </span>
        </div>
      </div>

      {/* Error alert if connection failed */}
      {connectionError && (
        <div className="mb-4 p-3 rounded-sm bg-[#FEF2F2] border border-[#FCA5A5] flex items-start gap-2.5 text-xs font-mono text-[#991B1B]">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          <div>
            <span className="font-bold block">MQTT Gateway Error</span>
            <span className="text-[11px] text-[#B91C1C] mt-0.5 block">{connectionError}</span>
          </div>
        </div>
      )}

      {/* Action feedback banner */}
      {actionFeedback && (
        <div
          className={`mb-4 p-2.5 rounded text-xs font-mono flex items-center justify-between gap-2 border ${
            actionFeedback.type === 'success'
              ? 'bg-[#E8EFEA] text-[#2B382D] border-[#41634F]/30'
              : actionFeedback.type === 'error'
              ? 'bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]'
              : 'bg-[#FBF9F5] text-[#5C554E] border-[#E5E0D8]'
          }`}
        >
          <span>{actionFeedback.text}</span>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-[10px] underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Current Connection Parameters & Real Status Grid */}
      {!isEditing ? (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs mb-4">
            {/* 1. Device ID */}
            <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
              <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">Device ID</span>
              <span className="font-semibold text-[#262220] block truncate">{settings.deviceId}</span>
            </div>

            {/* 2. MQTT Broker */}
            <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
              <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">MQTT Broker</span>
              <span
                className={`font-semibold text-[11px] block mt-0.5 ${
                  isMqttConnected && isDeviceOnline && handshakeStatus === 'SUCCESS'
                    ? 'text-[#2B382D]'
                    : isMqttConnected
                    ? 'text-[#92400E]'
                    : isMqttConnecting
                    ? 'text-[#92400E]'
                    : 'text-[#8C827A]'
                }`}
              >
                ● {isMqttConnected
                  ? isDeviceOnline && handshakeStatus === 'SUCCESS'
                    ? 'CONNECTED'
                    : 'READY (NO DEVICE)'
                  : connectionStatus}
              </span>
            </div>

            {/* 3. ESP32 Physical Device */}
            <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
              <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">ESP32 Device</span>
              <span
                className={`font-semibold text-[11px] block mt-0.5 ${
                  isDeviceOnline ? 'text-[#2B382D]' : 'text-[#8C827A]'
                }`}
              >
                ● {isDeviceOnline ? 'ONLINE' : 'OFFLINE (NO PACKETS)'}
              </span>
            </div>

            {/* 4. Real AI Model */}
            <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
              <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">AI Model</span>
              <span
                className={`font-semibold text-[11px] block mt-0.5 ${
                  isModelReady ? 'text-[#2B382D]' : 'text-[#8C827A]'
                }`}
              >
                ● {isModelReady ? 'READY' : 'NOT AVAILABLE'}
              </span>
            </div>

            {/* 5. Last Heartbeat */}
            <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
              <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">Last Heartbeat</span>
              <span className="font-semibold text-[#262220] block mt-0.5">
                {isDeviceOnline && lastHeartbeatAge !== null ? `${lastHeartbeatAge}s ago` : 'None'}
              </span>
            </div>

            {/* 6. Live Signal */}
            <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
              <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">Signal Feed</span>
              <span
                className={`font-semibold text-[11px] block mt-0.5 ${
                  hasSensorData ? 'text-[#2B382D]' : 'text-[#8C827A]'
                }`}
              >
                {hasSensorData ? 'LIVE' : 'NO LIVE DATA'}
              </span>
            </div>

            {/* 7. Handshake */}
            <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
              <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">Handshake</span>
              <span
                className={`font-semibold text-[11px] block mt-0.5 ${
                  handshakeStatus === 'SUCCESS'
                    ? 'text-[#2B382D]'
                    : handshakeStatus === 'PENDING'
                    ? 'text-[#92400E]'
                    : handshakeStatus === 'FAILED'
                    ? 'text-[#991B1B]'
                    : 'text-[#92400E]'
                }`}
              >
                ● {handshakeStatus === 'SUCCESS' && lastHandshakeLatency !== null
                  ? `VERIFIED (${lastHandshakeLatency}ms)`
                  : handshakeStatus === 'SUCCESS'
                  ? 'VERIFIED'
                  : handshakeStatus === 'PENDING'
                  ? 'TESTING...'
                  : handshakeStatus === 'FAILED'
                  ? 'FAILED'
                  : 'UNVERIFIED'}
              </span>
            </div>

            {/* 8. Firmware & Version */}
            <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
              <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">Firmware Version</span>
              <span className="font-semibold text-[#262220] block mt-0.5 truncate">
                {deviceMetadata.firmware || 'ESP32-S3 (Ready)'}
              </span>
            </div>
          </div>

          {/* Action Buttons: Connect, Disconnect, Handshake, Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              {!isMqttConnected ? (
                <button
                  type="button"
                  onClick={connectHardware}
                  disabled={isMqttConnecting}
                  className="flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-mono font-semibold bg-[#2B382D] text-[#FFFFFF] hover:bg-[#38493B] transition-all cursor-pointer shadow-xs disabled:opacity-60"
                >
                  <Plug size={13} />
                  <span>{isMqttConnecting ? 'CONNECTING...' : 'CONNECT HARDWARE'}</span>
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

              {isMqttConnected && (
                <>
                  <button
                    type="button"
                    onClick={handleRunHandshake}
                    disabled={isActing}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-mono font-semibold border border-[#E5E0D8] bg-[#FBF9F5] text-[#262220] hover:bg-[#F5F2EB] transition-all cursor-pointer disabled:opacity-50"
                    title="Send device_ping with unique request_id to verify handshake with ESP32"
                  >
                    <RefreshCw size={12} className={isActing ? 'animate-spin' : ''} />
                    <span>DEVICE HANDSHAKE</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRequestStatus}
                    disabled={isActing}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-mono border border-[#E5E0D8] bg-[#FBF9F5] text-[#5C554E] hover:text-[#262220] hover:bg-[#F5F2EB] transition-all cursor-pointer disabled:opacity-50"
                    title="Send device_status command requiring hardware ACK"
                  >
                    <Zap size={12} />
                    <span>DEVICE STATUS (ACK)</span>
                  </button>
                </>
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

          {/* Web Serial Transport Panel */}
          <div className="mt-4 pt-3 border-t border-[#E5E0D8]/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Usb size={14} className="text-[#8C827A]" />
              <span className="text-[#5C554E] font-semibold">USB Web Serial Transport:</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                  serialDetails.status === 'CONNECTED'
                    ? 'bg-[#E8EFEA] text-[#2B382D] border border-[#41634F]/30'
                    : serialDetails.status === 'NOT_SUPPORTED'
                    ? 'bg-[#F5F2EB] text-[#8C827A]'
                    : 'bg-[#FAF8F5] text-[#736B63] border border-[#E5E0D8]'
                }`}
              >
                {serialDetails.status === 'NOT_SUPPORTED'
                  ? 'SERIAL NOT AVAILABLE (Requires Chrome/Edge)'
                  : serialDetails.status}
              </span>
              {serialDetails.portInfo && (
                <span className="text-[10px] text-[#8C827A]">({serialDetails.portInfo})</span>
              )}
            </div>

            {serialDetails.isSupported && (
              <button
                type="button"
                onClick={handleToggleSerial}
                className="px-3 py-1 text-[11px] rounded border border-[#E5E0D8] bg-[#FFFFFF] hover:bg-[#F5F2EB] text-[#262220] transition-colors"
              >
                {serialDetails.status === 'CONNECTED' ? 'Close Serial Port' : 'Open Serial Port'}
              </button>
            )}
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
                placeholder="wss://broker.emqx.io:8084/mqtt"
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
