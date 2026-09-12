import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  History,
  Cpu,
  GitBranch,
  Wifi,
  Settings,
  Server,
  Layers,
} from 'lucide-react'
import { useDeviceTelemetry } from '../../hooks/useDeviceTelemetry'
import { LiveSensorDataSection } from './sections/LiveSensorDataSection'
import { PredictionHistorySection } from './sections/PredictionHistorySection'
import { DeviceStatusSection } from './sections/DeviceStatusSection'
import { LivePipelineSection } from './sections/LivePipelineSection'
import { DeviceConnectionSection } from './sections/DeviceConnectionSection'
import { DashboardSettingsSection } from './sections/DashboardSettingsSection'
import { SystemStatusSection } from './sections/SystemStatusSection'

type DashboardTab =
  | 'sensors'
  | 'history'
  | 'status'
  | 'pipeline'
  | 'connection'
  | 'settings'

interface DashboardContainerProps {
  currentCommand?: string | null
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({ currentCommand }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('sensors')
  const telemetry = useDeviceTelemetry()

  const tabs = [
    { id: 'sensors' as DashboardTab, label: 'Live Sensors', icon: Activity, badge: telemetry.hasEmgData ? 'LIVE' : null },
    { id: 'history' as DashboardTab, label: 'Prediction Log', icon: History, count: telemetry.predictionHistory.length },
    { id: 'status' as DashboardTab, label: 'Device Status', icon: Cpu },
    { id: 'pipeline' as DashboardTab, label: 'Live Pipeline', icon: GitBranch },
    { id: 'connection' as DashboardTab, label: 'Hardware Bridge', icon: Wifi, isConnected: telemetry.mqttStatus === 'connected' },
    { id: 'settings' as DashboardTab, label: 'Settings', icon: Settings },
  ]

  return (
    <div className="mt-8 pt-8 border-t border-border space-y-6">
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-cyan-signal" />
            <span className="font-mono text-[10px] tracking-[0.25em] text-cyan-signal uppercase font-semibold">
              Telemetry & Monitoring Console
            </span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-cream mt-0.5">
            Biomedical Instrumentation & Data Hub
          </h3>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="text-cream-muted">MQTT Protocol:</span>
          <span
            className={`px-2 py-0.5 rounded-sm border uppercase font-bold ${
              telemetry.mqttStatus === 'connected'
                ? 'bg-cyan-signal/15 border-cyan-signal/40 text-cyan-signal'
                : 'bg-graphite-elevated border-border text-cream-muted'
            }`}
          >
            {telemetry.mqttStatus}
          </span>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/80 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-sm font-mono text-xs transition-all whitespace-nowrap cursor-pointer border ${
                isActive
                  ? 'border-cyan-signal/60 bg-cyan-signal/[0.08] text-cyan-signal font-semibold shadow-[0_0_12px_rgba(0,216,165,0.15)]'
                  : 'border-transparent text-cream-muted hover:text-cream hover:bg-graphite-elevated/50'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-signal animate-pulse" />
              )}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="rounded-full bg-graphite-elevated px-1.5 py-0.2 border border-border text-[9px] text-cream-muted">
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Tab Content Panels ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'sensors' && (
            <LiveSensorDataSection
              mqttStatus={telemetry.mqttStatus}
              hasEmgData={telemetry.hasEmgData}
              hasImuData={telemetry.hasImuData}
              emgBuffer={telemetry.emgBuffer}
              emgMetrics={telemetry.emgMetrics}
              imu={telemetry.imu}
              batteryPct={telemetry.batteryPct}
              packetRate={telemetry.packetRate}
              signalQuality={telemetry.signalQuality}
              lastPacketTime={telemetry.lastPacketTime}
            />
          )}

          {activeTab === 'history' && (
            <PredictionHistorySection
              history={telemetry.predictionHistory}
              onClearHistory={telemetry.clearHistory}
            />
          )}

          {activeTab === 'status' && (
            <div className="space-y-6">
              <DeviceStatusSection
                mqttStatus={telemetry.mqttStatus}
                backendStatus={telemetry.backendStatus}
                modelInfo={telemetry.modelInfo}
                batteryPct={telemetry.batteryPct}
                signalQuality={telemetry.signalQuality}
                lastPacketTime={telemetry.lastPacketTime}
              />
              <SystemStatusSection
                mqttStatus={telemetry.mqttStatus}
                backendStatus={telemetry.backendStatus}
                modelInfo={telemetry.modelInfo}
                onRefreshBackend={telemetry.checkBackend}
              />
            </div>
          )}

          {activeTab === 'pipeline' && (
            <LivePipelineSection
              mqttStatus={telemetry.mqttStatus}
              hasEmgData={telemetry.hasEmgData}
              isModelReady={telemetry.backendStatus === 'online' && telemetry.modelInfo.loaded}
              currentPrediction={currentCommand || telemetry.detectedMessage}
              voiceEnabled={telemetry.settings.voiceEnabled}
            />
          )}

          {activeTab === 'connection' && (
            <DeviceConnectionSection
              status={telemetry.mqttStatus}
              config={telemetry.mqttConfig}
              onConnect={telemetry.connectMqtt}
              onDisconnect={telemetry.disconnectMqtt}
            />
          )}

          {activeTab === 'settings' && (
            <DashboardSettingsSection
              settings={telemetry.settings}
              onUpdateSettings={(newSettings) =>
                telemetry.setSettings((prev) => ({ ...prev, ...newSettings }))
              }
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
