import React from 'react'
import { LivePipelineBar } from '../components/pipeline/LivePipelineBar'
import { EMGViewer } from '../components/telemetry/EMGViewer'
import { IMUViewer } from '../components/telemetry/IMUViewer'
import { DeviceHealthCard } from '../components/telemetry/DeviceHealthCard'
import { PredictionPanel } from '../components/prediction/PredictionPanel'
import { HardwareConnectionCard } from '../components/connection/HardwareConnectionCard'
import { ModelConnectionCard } from '../components/connection/ModelConnectionCard'
import { PredictionHistoryTable } from '../components/prediction/PredictionHistoryTable'

export const DashboardOverviewPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* ── 7-Stage End-to-End Live Pipeline ── */}
      <LivePipelineBar />

      {/* ── Two Column Primary Operations Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Telemetry & Device Signal ── 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          <EMGViewer height={200} />
          <IMUViewer />
          <DeviceHealthCard />
        </div>

        {/* Right Column: Prediction, Model & Hardware Controls ── 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          <PredictionPanel />
          <HardwareConnectionCard />
          <ModelConnectionCard />
        </div>
      </div>

      {/* ── Recent Predictions Table Preview ── */}
      <div>
        <PredictionHistoryTable maxRows={5} showExport={false} />
      </div>
    </div>
  )
}
