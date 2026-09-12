import React from 'react'
import { Activity, Cpu, ArrowLeft, RefreshCw } from 'lucide-react'
import { useModelControl } from '../../context/ModelControlContext'
import { RealtimeConnectionIndicator } from '../../../components/connection/RealtimeConnectionIndicator'

export const ModelControlHeader: React.FC = () => {
  const {
    modelStatus,
    modelInfo,
    hasSensorData,
    refreshModelStatus,
    settings,
  } = useModelControl()

  const handleReturnToMain = () => {
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-30 bg-[#FBF9F5] border-b border-[#E5E0D8] px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* ── Brand & Return Link ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleReturnToMain}
          className="group flex items-center gap-1.5 text-xs font-mono tracking-wider text-[#736B63] hover:text-[#262220] transition-colors py-1 px-2 rounded border border-[#E5E0D8] bg-[#FFFFFF] shadow-xs"
          title="Return to BoneTalk Marketing Site"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>PORTAL</span>
        </button>

        <div className="h-4 w-px bg-[#E5E0D8] hidden sm:block" />

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold tracking-widest text-[#41634F] uppercase bg-[#E8EFEA] px-1.5 py-0.5 rounded border border-[#41634F]/20">
              CONSOLE
            </span>
            <h1 className="text-sm sm:text-base font-semibold text-[#262220] tracking-tight">
              BoneTalk Model Control
            </h1>
          </div>
          <span className="text-[11px] font-mono text-[#8C827A]">
            Hardware &amp; Neural Telemetry Engine • {settings.deviceId}
          </span>
        </div>
      </div>

      {/* ── Real Status Indicators ── */}
      <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 text-xs font-mono">
        {/* Real-Time MQTT + WebSocket Telemetry Status Indicator */}
        <RealtimeConnectionIndicator />

        {/* Sensors Receiving Status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border ${
            hasSensorData
              ? 'bg-[#E8EFEA] border-[#41634F]/30 text-[#2B382D]'
              : 'bg-[#F7F4EE] border-[#E5E0D8] text-[#8C827A]'
          }`}
        >
          <Activity size={13} className={hasSensorData ? 'text-[#41634F]' : ''} />
          <span className="font-semibold text-[11px] uppercase tracking-wider">SENSORS</span>
          <span className="text-[10px] font-medium">
            {hasSensorData ? 'STREAMING' : 'IDLE'}
          </span>
        </div>

        {/* ML Model Status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border ${
            modelStatus === 'Ready'
              ? 'bg-[#E8EFEA] border-[#41634F]/30 text-[#2B382D]'
              : modelStatus === 'Loading'
              ? 'bg-[#F5F2EB] border-[#D97706]/40 text-[#92400E]'
              : 'bg-[#F7F4EE] border-[#E5E0D8] text-[#8C827A]'
          }`}
          title={
            modelInfo?.model_type
              ? `${modelInfo.model_type} (${modelInfo.classes?.join(', ')})`
              : 'Model Status'
          }
        >
          <Cpu size={13} className={modelStatus === 'Ready' ? 'text-[#41634F]' : ''} />
          <span className="font-semibold text-[11px] uppercase tracking-wider">MODEL</span>
          <span className="text-[10px] font-medium">{modelStatus}</span>
          <button
            onClick={refreshModelStatus}
            className="hover:rotate-180 transition-transform text-[#736B63] p-0.5 ml-0.5"
            title="Refresh Model Status"
          >
            <RefreshCw size={11} />
          </button>
        </div>
      </div>
    </header>
  )
}
