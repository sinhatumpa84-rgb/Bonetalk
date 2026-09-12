import React from 'react'
import {
  ShieldCheck,
  Radio,
  Activity,
  Cpu,
  Zap,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { useModelControl } from '../context/ModelControlContext'

export const SystemStatusPage: React.FC = () => {
  const {
    connectionStatus,
    modelStatus,
    hasSensorData,
    latestPrediction,
    deviceHealth,
    settings,
    backendUrl,
  } = useModelControl()

  const subsystems = [
    {
      id: 'hardware',
      title: 'Hardware Link',
      component: settings.deviceId,
      state:
        connectionStatus === 'Connected'
          ? 'READY'
          : connectionStatus === 'Connecting...' || connectionStatus === 'Reconnecting'
          ? 'WAITING'
          : connectionStatus === 'Connection Error'
          ? 'ERROR'
          : 'DISCONNECTED',
      details:
        connectionStatus === 'Connected'
          ? `Link active. Battery: ${deviceHealth.battery !== null ? deviceHealth.battery + '%' : 'N/A'}`
          : 'Hardware ESP32-S3 module not actively connected over MQTT.',
      icon: Radio,
    },
    {
      id: 'mqtt',
      title: 'MQTT Gateway',
      component: settings.mqttBrokerUrl,
      state:
        connectionStatus === 'Connected'
          ? 'READY'
          : connectionStatus === 'Connecting...'
          ? 'WAITING'
          : connectionStatus === 'Connection Error'
          ? 'ERROR'
          : 'DISCONNECTED',
      details: `Subscribing to: ${settings.subscribeTopic} | Publishing to: ${settings.publishTopic}`,
      icon: ShieldCheck,
    },
    {
      id: 'sensor',
      title: 'Sensor Input',
      component: 'EMG (1000 Hz) + IMU (6-DOF)',
      state:
        hasSensorData
          ? 'READY'
          : connectionStatus === 'Connected'
          ? 'WAITING'
          : 'DISCONNECTED',
      details: hasSensorData
        ? `Receiving bio-signal data stream (${deviceHealth.packetRate || 0} pkt/s)`
        : 'Waiting for sensor packets to arrive on subscribed topic.',
      icon: Activity,
    },
    {
      id: 'model',
      title: 'ML Model Service',
      component: backendUrl,
      state:
        modelStatus === 'Ready'
          ? 'READY'
          : modelStatus === 'Loading'
          ? 'WAITING'
          : modelStatus === 'Error'
          ? 'ERROR'
          : 'DISCONNECTED',
      details:
        modelStatus === 'Ready'
          ? 'FastAPI inference engine online & classifiers loaded in memory.'
          : 'Inference service offline. Run: cd backend && uvicorn main:app --reload',
      icon: Cpu,
    },
    {
      id: 'inference',
      title: 'Inference Engine',
      component: 'Pattern Recognizer',
      state:
        latestPrediction.command
          ? 'READY'
          : modelStatus === 'Ready' && hasSensorData
          ? 'WAITING'
          : modelStatus === 'Ready'
          ? 'WAITING'
          : 'DISCONNECTED',
      details: latestPrediction.command
        ? `Last classified token: ${latestPrediction.command} at ${latestPrediction.timestamp}`
        : 'Awaiting sensor window threshold trigger for pattern classification.',
      icon: Zap,
    },
    {
      id: 'output',
      title: 'Speech & Audio Output',
      component: 'Web Speech Synthesis API',
      state:
        settings.voiceOutputEnabled
          ? 'READY'
          : 'WAITING',
      details: settings.voiceOutputEnabled
        ? `Speech enabled (Auto-speak: ${settings.autoSpeak ? 'ON' : 'OFF'}, Rate: ${settings.speechRate}x)`
        : 'Voice synthesizer disabled in settings.',
      icon: Volume2,
    },
  ]

  const getStatusBadge = (state: string) => {
    switch (state) {
      case 'READY':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#E8EFEA] text-[#2B382D] border border-[#41634F]/30">
            <CheckCircle2 size={11} />
            <span>READY</span>
          </span>
        )
      case 'WAITING':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/40">
            <Clock size={11} />
            <span>WAITING</span>
          </span>
        )
      case 'ERROR':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#FEE2E2] text-[#991B1B] border border-[#EF4444]/40">
            <AlertTriangle size={11} />
            <span>ERROR</span>
          </span>
        )
      case 'DISCONNECTED':
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#F5F2EB] text-[#8C827A] border border-[#E5E0D8]">
            <span>DISCONNECTED</span>
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-mono font-bold text-[#262220] uppercase tracking-wider">
            System Subsystem Health &amp; Diagnostics
          </h2>
          <p className="text-xs font-mono text-[#8C827A] mt-0.5">
            Real-time operating status for all 6 core functional layers
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#5C554E]">
          <span>Checked: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* ── 6 Subsystems Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subsystems.map((sub) => {
          const Icon = sub.icon
          return (
            <div
              key={sub.id}
              className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-[#F5F2EB] text-[#41634F]">
                      <Icon size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-mono font-bold text-[#262220] uppercase">
                        {sub.title}
                      </h4>
                      <span className="text-[10px] font-mono text-[#8C827A] truncate block max-w-[180px]">
                        {sub.component}
                      </span>
                    </div>
                  </div>

                  {getStatusBadge(sub.state)}
                </div>

                <p className="text-xs font-mono text-[#5C554E] mt-3 pt-3 border-t border-[#E5E0D8]/60">
                  {sub.details}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
