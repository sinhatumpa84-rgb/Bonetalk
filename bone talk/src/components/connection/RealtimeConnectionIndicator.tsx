import React, { useState, useEffect, useRef } from 'react'
import {
  Radio,
  Wifi,
  Activity,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Power,
  X,
  ChevronDown,
  Terminal,
} from 'lucide-react'
import { mqttService } from '../../services/mqttService'
import type { ConnectionDetails, MqttConnectionStatus } from '../../services/mqttService'
import { websocketService } from '../../services/websocketService'
import type { WebSocketServiceDetails } from '../../services/websocketService'

interface RealtimeConnectionIndicatorProps {
  className?: string
  compact?: boolean
  showDetailsPopover?: boolean
}

export const RealtimeConnectionIndicator: React.FC<RealtimeConnectionIndicatorProps> = ({
  className = '',
  compact: _compact = false,
  showDetailsPopover = true,
}) => {
  const [mqttDetails, setMqttDetails] = useState<ConnectionDetails>(() => mqttService.getDetails())
  const [wsDetails, setWsDetails] = useState<WebSocketServiceDetails>(() => websocketService.getDetails())
  const [isOpen, setIsOpen] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    step: string
    details: string
    deviceStatus: string
  } | null>(null)

  const popoverRef = useRef<HTMLDivElement>(null)

  // Subscribe to real-time status updates from services
  useEffect(() => {
    const unsubMqtt = mqttService.onStatusChange(setMqttDetails)
    const unsubWs = websocketService.onStatusChange(setWsDetails)
    return () => {
      unsubMqtt()
      unsubWs()
    }
  }, [])

  // Auto-close popover when clicking outside
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const status: MqttConnectionStatus = mqttDetails.status
  const isDeviceVerified = mqttDetails.devicePresence === 'ONLINE' && mqttDetails.handshakeVerified

  // Color mapping based on exact states - Green ONLY when real device is verified
  const getStatusColor = (s: MqttConnectionStatus) => {
    switch (s) {
      case 'CONNECTED':
        if (isDeviceVerified) {
          return {
            dot: 'bg-emerald-500',
            text: 'text-emerald-700 dark:text-emerald-400',
            border: 'border-emerald-500/30',
            bg: 'bg-emerald-500/10',
          }
        }
        return {
          dot: 'bg-amber-500',
          text: 'text-amber-700 dark:text-amber-400',
          border: 'border-amber-500/30',
          bg: 'bg-amber-500/10',
        }
      case 'CONNECTING':
        return {
          dot: 'bg-amber-500 animate-pulse',
          text: 'text-amber-700 dark:text-amber-400',
          border: 'border-amber-500/30',
          bg: 'bg-amber-500/10',
        }
      case 'RECONNECTING':
        return {
          dot: 'bg-amber-500 animate-pulse',
          text: 'text-amber-700 dark:text-amber-400',
          border: 'border-amber-500/30',
          bg: 'bg-amber-500/10',
        }
      case 'ERROR':
        return {
          dot: 'bg-rose-500',
          text: 'text-rose-700 dark:text-rose-400',
          border: 'border-rose-500/30',
          bg: 'bg-rose-500/10',
        }
      case 'DISCONNECTED':
      default:
        return {
          dot: 'bg-stone-400',
          text: 'text-stone-600 dark:text-stone-400',
          border: 'border-border',
          bg: 'bg-graphite-elevated/60',
        }
    }
  }

  const colors = getStatusColor(status)

  const handleToggleConnect = () => {
    if (status === 'CONNECTED' || status === 'CONNECTING') {
      mqttService.disconnect()
      websocketService.disconnect()
    } else {
      mqttService.connect()
      websocketService.connect()
    }
  }

  const handleRunDiagnostic = async () => {
    setIsTesting(true)
    setTestResult(null)
    try {
      const res = await mqttService.testConnection(5000)
      setTestResult(res)
    } catch (err) {
      setTestResult({
        success: false,
        step: 'EXCEPTION',
        details: err instanceof Error ? err.message : 'Unknown test error',
        deviceStatus: 'DEVICE OFFLINE',
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className={`relative inline-block text-left font-mono ${className}`} ref={popoverRef}>
      {/* ── Main Trigger Button / Indicator Pill ── */}
      <button
        type="button"
        onClick={() => showDetailsPopover && setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-sm border px-2.5 py-1 text-xs transition-all duration-200 cursor-pointer select-none ${colors.bg} ${colors.border} ${colors.text} hover:opacity-90`}
        aria-label={`MQTT Status: ${status}`}
        aria-expanded={isOpen}
      >
        <span className={`h-2 w-2 rounded-full ${colors.dot}`} aria-hidden="true" />
        <span className="font-semibold tracking-wider uppercase text-[11px]">
          {status === 'CONNECTED'
            ? isDeviceVerified
              ? 'DEVICE: ONLINE'
              : 'BROKER READY — NO DEVICE'
            : `MQTT: ${status}`}
        </span>
        {showDetailsPopover && (
          <ChevronDown
            size={12}
            className={`transition-transform duration-200 opacity-70 ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {/* ── Technical Diagnostics Popover ── */}
      {isOpen && showDetailsPopover && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-sm border border-border bg-graphite shadow-[var(--shadow-level-3)] z-50 p-4 text-xs space-y-3.5 backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <div className="flex items-center gap-2">
              <Radio size={14} className="text-cyan-signal" />
              <span className="font-bold text-cream uppercase tracking-wider text-[11px]">
                Real-Time Telemetry Bus
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-cream-muted hover:text-cream p-1 cursor-pointer"
              aria-label="Close telemetry diagnostics"
            >
              <X size={13} />
            </button>
          </div>

          {/* Section 1: MQTT over WebSocket Status */}
          <div className="rounded-sm bg-graphite-elevated/70 p-2.5 border border-border space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-cream-muted text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                <Radio size={12} />
                MQTT over WSS
              </span>
              <span className={`font-bold text-[10px] uppercase flex items-center gap-1 ${colors.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                {status}
              </span>
            </div>
            <div className="text-[10px] text-cream truncate font-sans" title={mqttDetails.brokerUrl}>
              <span className="text-cream-muted font-mono">Broker: </span>
              {mqttDetails.brokerUrl || 'Not configured'}
            </div>
            {mqttDetails.subscribedTopics.length > 0 && (
              <div className="text-[10px] text-cream-muted truncate">
                <span className="font-mono">Topics: </span>
                {mqttDetails.subscribedTopics.join(', ')}
              </div>
            )}
          </div>

          {/* Section 2: Backend WebSocket Streaming */}
          <div className="rounded-sm bg-graphite-elevated/70 p-2.5 border border-border space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-cream-muted text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                <Wifi size={12} />
                Backend Streaming WS
              </span>
              <span
                className={`font-bold text-[10px] uppercase flex items-center gap-1 ${
                  wsDetails.status === 'CONNECTED'
                    ? 'text-emerald-500'
                    : wsDetails.status === 'CONNECTING' || wsDetails.status === 'RECONNECTING'
                    ? 'text-amber-500'
                    : 'text-stone-400'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    wsDetails.status === 'CONNECTED'
                      ? 'bg-emerald-500'
                      : wsDetails.status === 'CONNECTING' || wsDetails.status === 'RECONNECTING'
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-stone-400'
                  }`}
                />
                {wsDetails.status}
              </span>
            </div>
            <div className="text-[10px] text-cream truncate font-sans" title={wsDetails.url}>
              <span className="text-cream-muted font-mono">Endpoint: </span>
              {wsDetails.url}
            </div>
          </div>

          {/* Section 3: Real Device Hardware Status */}
          <div className="rounded-sm bg-graphite-elevated/70 p-2.5 border border-border space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-cream-muted text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={12} />
                Physical Device Presence
              </span>
              <span
                className={`font-bold text-[10px] uppercase px-1.5 py-0.5 rounded ${
                  mqttDetails.devicePresence === 'ONLINE'
                    ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                    : 'bg-stone-500/15 text-stone-400 border border-stone-500/20'
                }`}
              >
                {mqttDetails.devicePresence || 'OFFLINE'}
              </span>
            </div>

            <div className="space-y-1 pt-1 border-t border-border/50 text-[10px] text-cream">
              <div className="flex items-center justify-between">
                <span className="text-cream-muted">Device ID:</span>
                <span className="font-semibold text-cyan-signal">
                  {mqttDetails.deviceMetadata?.deviceId || mqttDetails.lastMessage?.device_id || 'BONE-01'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cream-muted">Handshake:</span>
                <span className={mqttDetails.handshakeVerified ? 'text-emerald-500 font-semibold' : 'text-stone-400'}>
                  {mqttDetails.handshakeVerified ? 'VERIFIED' : 'UNVERIFIED'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cream-muted">Last Heartbeat:</span>
                <span>{mqttDetails.lastHeartbeatTime || 'None'}</span>
              </div>
              {mqttDetails.deviceMetadata?.firmware && (
                <div className="flex items-center justify-between">
                  <span className="text-cream-muted">Firmware:</span>
                  <span>{mqttDetails.deviceMetadata.firmware}</span>
                </div>
              )}
              {mqttDetails.lastMessage && (
                <>
                  {mqttDetails.lastMessage.noise_level !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-cream-muted">Noise Level:</span>
                      <span>{mqttDetails.lastMessage.noise_level} dB</span>
                    </div>
                  )}
                  {mqttDetails.lastMessage.speech_detected !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-cream-muted">Speech Detected:</span>
                      <span>{mqttDetails.lastMessage.speech_detected ? 'YES' : 'NO'}</span>
                    </div>
                  )}
                  {mqttDetails.lastMessage.vibration !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-cream-muted">Vibration:</span>
                      <span>{mqttDetails.lastMessage.vibration ? 'ACTIVE' : 'IDLE'}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-between text-[9px] text-cream-muted pt-1 border-t border-border/40">
              <span>Last Connected:</span>
              <span>{mqttDetails.lastConnectionTime || 'None'}</span>
            </div>
          </div>

          {/* Diagnostic Test Output */}
          {testResult && (
            <div
              className={`rounded-sm p-2 text-[10px] border ${
                testResult.step === 'TELEMETRY_RECEIVED'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : testResult.step === 'BROKER_REACHABLE_NO_DEVICE_DETECTED'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              }`}
            >
              <div className="font-bold flex items-center gap-1">
                {testResult.step === 'TELEMETRY_RECEIVED' ? (
                  <CheckCircle2 size={11} />
                ) : (
                  <AlertCircle size={11} />
                )}
                <span>DIAGNOSTIC: {testResult.step.replace(/_/g, ' ')}</span>
              </div>
              <p className="mt-0.5 leading-relaxed font-sans">{testResult.details}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleToggleConnect}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-sm border border-border hover:border-cyan-signal text-cream text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer bg-graphite-elevated"
            >
              <Power size={11} />
              <span>{status === 'CONNECTED' ? 'Disconnect' : 'Connect'}</span>
            </button>

            <button
              type="button"
              onClick={handleRunDiagnostic}
              disabled={isTesting}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-sm border border-cyan-signal/40 bg-cyan-signal/15 text-cyan-signal hover:bg-cyan-signal/25 text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
              title="Test broker connection and topic telemetry"
            >
              {isTesting ? (
                <RotateCcw size={11} className="animate-spin" />
              ) : (
                <Terminal size={11} />
              )}
              <span>{isTesting ? 'Testing...' : 'Test Bus'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default RealtimeConnectionIndicator
