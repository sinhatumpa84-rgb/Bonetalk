import React from 'react'
import { Cpu, Radio, Activity, Sparkles, Volume2, ShieldCheck, Zap } from 'lucide-react'
import { useModelControl } from '../../context/ModelControlContext'

export const LivePipelineBar: React.FC = () => {
  const { pipeline, latestPrediction } = useModelControl()

  const stages = [
    {
      id: 'hardware',
      label: '1. HARDWARE',
      subtext: 'ESP32-S3',
      status: pipeline.hardware,
      icon: Radio,
    },
    {
      id: 'sensors',
      label: '2. EMG + IMU',
      subtext: '8-Ch + 6-DOF',
      status: pipeline.sensors,
      icon: Activity,
    },
    {
      id: 'processing',
      label: '3. SIGNAL PROC',
      subtext: 'Bandpass / Notch',
      status: pipeline.processing,
      icon: Zap,
    },
    {
      id: 'mqtt',
      label: '4. MQTT BROKER',
      subtext: 'WebSocket Bus',
      status: pipeline.mqtt,
      icon: ShieldCheck,
    },
    {
      id: 'model',
      label: '5. ML MODEL',
      subtext: 'Pattern Inference',
      status: pipeline.model,
      icon: Cpu,
    },
    {
      id: 'prediction',
      label: '6. PREDICTION',
      subtext: latestPrediction.command || 'Awaiting Signal',
      status: latestPrediction.command ? latestPrediction.command : pipeline.prediction,
      isPrediction: true,
      icon: Sparkles,
    },
    {
      id: 'output',
      label: '7. TEXT / VOICE',
      subtext: 'TTS Synthesizer',
      status: pipeline.output,
      icon: Volume2,
    },
  ]

  const getStatusColor = (status: string, isPred = false) => {
    if (isPred && status !== 'WAITING' && status !== 'IDLE') {
      return 'bg-[#2B382D] text-[#FFFFFF] border-[#2B382D]'
    }
    switch (status) {
      case 'CONNECTED':
      case 'RECEIVING':
      case 'ACTIVE':
      case 'READY':
        return 'bg-[#E8EFEA] text-[#2B382D] border-[#41634F]/30'
      case 'CONNECTING':
      case 'LOADING':
        return 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/40'
      case 'WAITING':
      case 'IDLE':
        return 'bg-[#F5F2EB] text-[#736B63] border-[#E5E0D8]'
      case 'DISCONNECTED':
      case 'UNAVAILABLE':
        return 'bg-[#F9F6F0] text-[#A8A29E] border-[#E5E0D8]'
      case 'ERROR':
        return 'bg-[#FEE2E2] text-[#991B1B] border-[#EF4444]/40'
      default:
        return 'bg-[#F5F2EB] text-[#736B63] border-[#E5E0D8]'
    }
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E5E0D8]/60">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#41634F]" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
            Live Signal &amp; Inference Pipeline
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#8C827A]">
          Real-time end-to-end hardware pipeline telemetry
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {stages.map((stage) => {
          const Icon = stage.icon
          const statusClass = getStatusColor(stage.status, stage.isPrediction)
          return (
            <div
              key={stage.id}
              className={`flex flex-col justify-between p-2.5 rounded-sm border ${statusClass} transition-all`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#5C554E]">
                  {stage.label}
                </span>
                <Icon size={12} className="opacity-75" />
              </div>

              <div className="my-1">
                <span className="block text-xs font-mono font-bold truncate">
                  {stage.status}
                </span>
                <span className="text-[10px] font-mono opacity-80 truncate block">
                  {stage.subtext}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
