import React from 'react'
import { Cpu, ArrowLeft, RefreshCw, Radio, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { useModelControl } from '../../context/ModelControlContext'
import { RealtimeConnectionIndicator } from '../../../components/connection/RealtimeConnectionIndicator'

export const ModelControlHeader: React.FC = () => {
  const {
    connectionStatus,
    devicePresence,
    handshakeStatus,
    lastHeartbeatAge,
    modelStatus,
    modelInfo,
    systemReadiness,
    refreshModelStatus,
    settings,
  } = useModelControl()

  const handleReturnToMain = () => {
    window.location.href = '/'
  }

  const isMqttConnected = connectionStatus === 'Connected'
  const isDeviceOnline = devicePresence === 'ONLINE'
  const isHandshakeVerified = handshakeStatus === 'SUCCESS'
  const isModelReady = modelStatus === 'Ready'

  return (
    <header className="sticky top-0 z-30 bg-[#FBF9F5] border-b border-[#E5E0D8] px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 min-h-[57px]">
      {/* ── Brand & Return Link ── */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <button
          onClick={handleReturnToMain}
          className="group flex items-center gap-1.5 text-xs font-mono tracking-wider text-[#736B63] hover:text-[#262220] transition-colors py-1 px-2 rounded border border-[#E5E0D8] bg-[#FFFFFF] shadow-xs cursor-pointer select-none"
          title="Return to BoneTalk Marketing Site"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>PORTAL</span>
        </button>

        <div className="h-4 w-px bg-[#E5E0D8] hidden sm:block" />

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold tracking-widest text-[#41634F] uppercase bg-[#E8EFEA] px-1.5 py-0.2 rounded border border-[#41634F]/20">
              CONSOLE
            </span>
            <h1 className="text-xs sm:text-sm font-semibold text-[#262220] tracking-tight">
              BoneTalk Model Control
            </h1>
          </div>
          <span className="text-[10px] font-mono text-[#8C827A]">
            Hardware &amp; Neural Engine • {settings.deviceId}
          </span>
        </div>
      </div>

      {/* ── Real Status Indicators Cluster (Fixed Dimensions for Zero Layout Shift) ── */}
      <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
        {/* 1. Real MQTT Broker Status - Min-Width Invariant */}
        <div
          className={`min-w-[178px] h-[26px] shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-sm border select-none whitespace-nowrap ${
            isMqttConnected && isDeviceOnline && isHandshakeVerified
              ? 'bg-[#E8EFEA] border-[#41634F]/30 text-[#2B382D]'
              : isMqttConnected
              ? 'bg-[#FEF3C7] border-[#F59E0B]/40 text-[#92400E]'
              : connectionStatus === 'Connecting...' || connectionStatus === 'Reconnecting'
              ? 'bg-[#FEF3C7] border-[#F59E0B]/40 text-[#92400E]'
              : 'bg-[#F7F4EE] border-[#E5E0D8] text-[#8C827A]'
          }`}
          title={`MQTT Broker: ${settings.mqttBrokerUrl} (${isMqttConnected ? 'WebSocket link active' : 'Disconnected'})`}
        >
          <span
            className={`w-1.5 h-1.5 shrink-0 rounded-full ${
              isMqttConnected && isDeviceOnline && isHandshakeVerified
                ? 'bg-[#41634F]'
                : isMqttConnected
                ? 'bg-amber-500'
                : connectionStatus === 'Connecting...'
                ? 'bg-amber-500 animate-pulse'
                : 'bg-stone-400'
            }`}
          />
          <span className="font-bold text-[10px] uppercase tracking-wider">BROKER</span>
          <span className="text-[10px] font-medium uppercase">
            {isMqttConnected
              ? isDeviceOnline && isHandshakeVerified
                ? 'CONNECTED'
                : 'READY (NO DEVICE)'
              : 'DISCONNECTED'}
          </span>
        </div>

        {/* 2. Real Arduino UNO R4 Physical Device Presence - Min-Width Invariant */}
        <div
          className={`min-w-[124px] h-[26px] shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-sm border select-none whitespace-nowrap ${
            isDeviceOnline
              ? 'bg-[#E8EFEA] border-[#41634F]/30 text-[#2B382D]'
              : 'bg-[#F7F4EE] border-[#E5E0D8] text-[#8C827A]'
          }`}
          title={
            isDeviceOnline
              ? `Physical Arduino UNO R4 (${settings.deviceId}) online with live heartbeat`
              : `Physical Arduino UNO R4 (${settings.deviceId}) offline (no incoming heartbeat)`
          }
        >
          <Radio size={12} className={isDeviceOnline ? 'text-[#41634F] shrink-0' : 'text-[#8C827A] shrink-0'} />
          <span className="font-bold text-[10px] uppercase tracking-wider">DEVICE</span>
          <span className="text-[10px] font-medium uppercase">
            {isDeviceOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>

        {/* 3. Last Heartbeat - Min-Width Invariant */}
        <div
          className={`min-w-[134px] h-[26px] shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-sm border select-none whitespace-nowrap ${
            isDeviceOnline && lastHeartbeatAge !== null
              ? 'bg-[#E8EFEA] border-[#41634F]/30 text-[#2B382D]'
              : 'bg-[#F7F4EE] border-[#E5E0D8] text-[#8C827A]'
          }`}
          title={
            isDeviceOnline && lastHeartbeatAge !== null
              ? `Last heartbeat received ${lastHeartbeatAge} seconds ago`
              : 'No heartbeat packets received from physical Arduino UNO R4'
          }
        >
          <Clock size={12} className={isDeviceOnline ? 'text-[#41634F] shrink-0' : 'text-[#8C827A] shrink-0'} />
          <span className="font-bold text-[10px] uppercase tracking-wider">HEARTBEAT</span>
          <span className="text-[10px] font-medium uppercase">
            {isDeviceOnline && lastHeartbeatAge !== null ? `${lastHeartbeatAge}S AGO` : 'NONE'}
          </span>
        </div>

        {/* 4. Handshake Verification - Min-Width Invariant */}
        <div
          className={`min-w-[172px] h-[26px] shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-sm border select-none whitespace-nowrap ${
            isHandshakeVerified
              ? 'bg-[#E8EFEA] border-[#41634F]/30 text-[#2B382D]'
              : handshakeStatus === 'PENDING'
              ? 'bg-[#FEF3C7] border-[#F59E0B]/40 text-[#92400E]'
              : 'bg-[#FEF3C7] border-[#F59E0B]/40 text-[#92400E]'
          }`}
          title={
            isHandshakeVerified
              ? 'Hardware ping-pong handshake cryptographically verified'
              : handshakeStatus === 'PENDING'
              ? 'Awaiting pong response from hardware'
              : 'Handshake not verified — no physical hardware ping response'
          }
        >
          {isHandshakeVerified ? (
            <CheckCircle2 size={12} className="text-[#41634F] shrink-0" />
          ) : handshakeStatus === 'PENDING' ? (
            <RefreshCw size={12} className="text-amber-600 animate-spin shrink-0" />
          ) : (
            <AlertTriangle size={12} className="text-amber-600 shrink-0" />
          )}
          <span className="font-bold text-[10px] uppercase tracking-wider">HANDSHAKE</span>
          <span className="text-[10px] font-medium uppercase">
            {isHandshakeVerified
              ? 'VERIFIED'
              : handshakeStatus === 'PENDING'
              ? 'TESTING...'
              : 'UNVERIFIED'}
          </span>
        </div>

        {/* 5. Real ML Model Status - Min-Width Invariant */}
        <div
          className={`min-w-[152px] h-[26px] shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-sm border select-none whitespace-nowrap ${
            isModelReady
              ? 'bg-[#E8EFEA] border-[#41634F]/30 text-[#2B382D]'
              : modelStatus === 'Loading'
              ? 'bg-[#FEF3C7] border-[#F59E0B]/40 text-[#92400E]'
              : 'bg-[#F7F4EE] border-[#E5E0D8] text-[#8C827A]'
          }`}
          title={
            modelInfo?.model_type
              ? `${modelInfo.model_type} (${modelInfo.classes?.join(', ')})`
              : 'Model Service Status'
          }
        >
          <Cpu size={12} className={isModelReady ? 'text-[#41634F] shrink-0' : 'text-[#8C827A] shrink-0'} />
          <span className="font-bold text-[10px] uppercase tracking-wider">MODEL</span>
          <span className="text-[10px] font-medium uppercase">
            {isModelReady ? 'READY' : 'NOT READY'}
          </span>
          <button
            onClick={refreshModelStatus}
            className="hover:rotate-180 transition-transform text-[#736B63] p-0.5 ml-0.5 cursor-pointer shrink-0"
            title="Refresh Model Status"
          >
            <RefreshCw size={10} />
          </button>
        </div>

        {/* 6. Combined Link Readiness State - Min-Width Invariant */}
        <div
          className={`min-w-[118px] h-[26px] shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-sm border select-none whitespace-nowrap ${
            systemReadiness === 'READY'
              ? 'bg-[#2B382D] text-[#FFFFFF] border-[#2B382D]'
              : 'bg-[#FAF8F5] text-[#8C827A] border-[#E5E0D8]'
          }`}
          title={
            systemReadiness === 'READY'
              ? 'System Ready: MQTT Connected + Arduino Online + Handshake Verified + Model Ready'
              : 'System Not Ready: Requires verified physical device presence and model readiness'
          }
        >
          {systemReadiness === 'READY' ? (
            <CheckCircle2 size={11} className="text-[#A3B899] shrink-0" />
          ) : (
            <XCircle size={11} className="text-[#DC2626] shrink-0" />
          )}
          <span className="font-bold text-[10px] uppercase tracking-wider">
            {systemReadiness === 'READY' ? 'LINK: ACTIVE' : 'LINK: INACTIVE'}
          </span>
        </div>

        {/* Popover trigger for deeper network/topic diagnostics - Fixed Width */}
        <RealtimeConnectionIndicator />
      </div>
    </header>
  )
}
