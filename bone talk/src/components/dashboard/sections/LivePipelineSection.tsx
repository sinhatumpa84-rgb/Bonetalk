import React from 'react'
import { ArrowRight, Cpu, Radio, Activity, Brain, Volume2, Sparkles } from 'lucide-react'
import type { MqttConnectionStatus } from '../../../lib/mqttService'

interface LivePipelineProps {
  mqttStatus: MqttConnectionStatus
  hasEmgData: boolean
  isModelReady: boolean
  currentPrediction: string | null
  voiceEnabled: boolean
}

export const LivePipelineSection: React.FC<LivePipelineProps> = ({
  mqttStatus,
  hasEmgData,
  isModelReady,
  currentPrediction,
  voiceEnabled,
}) => {
  const isConnected = mqttStatus === 'connected'

  const stages = [
    {
      id: 'device',
      title: 'BoneTalk Device',
      subtitle: 'ESP32-S3 Wearable',
      icon: Cpu,
      status: isConnected ? 'CONNECTED' : 'DISCONNECTED',
      active: isConnected,
      badgeColor: isConnected ? 'text-cyan-signal border-cyan-signal/40 bg-cyan-signal/10' : 'text-zinc-500 border-zinc-700 bg-zinc-800/40',
    },
    {
      id: 'sensors',
      title: 'EMG + IMU',
      subtitle: 'Differential Biosensing',
      icon: Radio,
      status: hasEmgData ? 'RECEIVING' : 'WAITING',
      active: hasEmgData,
      badgeColor: hasEmgData ? 'text-cyan-signal border-cyan-signal/40 bg-cyan-signal/10' : 'text-zinc-500 border-zinc-700 bg-zinc-800/40',
    },
    {
      id: 'processing',
      title: 'Signal Processing',
      subtitle: 'Bandpass + RMS/MAV',
      icon: Activity,
      status: hasEmgData ? 'ACTIVE' : 'IDLE',
      active: hasEmgData,
      badgeColor: hasEmgData ? 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10' : 'text-zinc-500 border-zinc-700 bg-zinc-800/40',
    },
    {
      id: 'model',
      title: 'ML Inference',
      subtitle: 'TinyML / RandomForest',
      icon: Brain,
      status: isModelReady ? 'READY' : 'OFFLINE',
      active: isModelReady,
      badgeColor: isModelReady ? 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10' : 'text-yellow-500 border-yellow-500/40 bg-yellow-500/10',
    },
    {
      id: 'prediction',
      title: 'Prediction',
      subtitle: 'Intent Recognition',
      icon: Sparkles,
      status: currentPrediction ? currentPrediction : 'AWAITING INPUT',
      active: Boolean(currentPrediction),
      badgeColor: currentPrediction ? 'text-cyan-signal border-cyan-signal/40 bg-cyan-signal/10 font-bold' : 'text-zinc-500 border-zinc-700 bg-zinc-800/40',
    },
    {
      id: 'output',
      title: 'Voice Output',
      subtitle: 'Speech Synthesis',
      icon: Volume2,
      status: voiceEnabled ? 'ACTIVE' : 'MUTED',
      active: voiceEnabled,
      badgeColor: voiceEnabled ? 'text-cyan-signal border-cyan-signal/40 bg-cyan-signal/10' : 'text-zinc-500 border-zinc-700 bg-zinc-800/40',
    },
  ]

  return (
    <div className="rounded-sm border border-border/80 bg-graphite-light/50 p-5 backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-cyan-signal" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-cyan-signal font-semibold">
            Live Neuromuscular Telemetry Pipeline
          </span>
        </div>
        <span className="font-mono text-[10px] text-cream-muted uppercase">REAL-TIME FLOW</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {stages.map((stage, idx) => {
          const Icon = stage.icon
          return (
            <div key={stage.id} className="relative flex flex-col justify-between rounded-sm border border-border bg-graphite-elevated/80 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className={`p-1.5 rounded-sm border ${stage.active ? 'border-cyan-signal/40 text-cyan-signal bg-cyan-signal/10' : 'border-border text-zinc-600 bg-graphite'}`}>
                  <Icon size={16} />
                </div>
                {idx < stages.length - 1 && (
                  <ArrowRight size={14} className="hidden lg:block text-border -mr-1" />
                )}
              </div>

              <div>
                <span className="font-mono text-xs font-bold text-cream block">{stage.title}</span>
                <span className="font-mono text-[9px] text-cream-muted/70 block mt-0.5">{stage.subtitle}</span>
              </div>

              <div className="pt-2 border-t border-border/50">
                <span className={`inline-block px-2 py-0.5 rounded-sm border font-mono text-[9px] tracking-wider uppercase ${stage.badgeColor}`}>
                  {stage.status}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
