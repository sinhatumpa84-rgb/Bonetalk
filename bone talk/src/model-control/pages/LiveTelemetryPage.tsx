import React from 'react'
import { EMGViewer } from '../components/telemetry/EMGViewer'
import { IMUViewer } from '../components/telemetry/IMUViewer'
import { DeviceHealthCard } from '../components/telemetry/DeviceHealthCard'
import { useModelControl } from '../context/ModelControlContext'
import { Activity } from 'lucide-react'

export const LiveTelemetryPage: React.FC = () => {
  const { hasSensorData } = useModelControl()

  return (
    <div className="space-y-6">
      {/* ── Overview Header ── */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-mono font-bold text-[#262220] uppercase tracking-wider">
            Live Bio-Telemetry &amp; Sensor Telemetry
          </h2>
          <p className="text-xs font-mono text-[#8C827A] mt-0.5">
            Continuous 1000 Hz facial surface electromyography + 6-DOF IMU tracking
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span
            className={`px-2.5 py-1 rounded border uppercase text-[11px] font-bold ${
              hasSensorData
                ? 'bg-[#E8EFEA] text-[#2B382D] border-[#41634F]/30'
                : 'bg-[#F7F4EE] text-[#8C827A] border-[#E5E0D8]'
            }`}
          >
            {hasSensorData ? 'LIVE TRANSMISSION ACTIVE' : 'AWAITING HARDWARE BROADCAST'}
          </span>
        </div>
      </div>

      {/* ── High-Resolution EMG Oscilloscope ── */}
      <EMGViewer height={300} showDetailedMetrics={true} />

      {/* ── IMU and Health Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IMUViewer />
        <DeviceHealthCard />
      </div>

      {/* ── Technical Sensor Calibration Table ── */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 shadow-xs">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#E5E0D8]/60">
          <Activity size={14} className="text-[#41634F]" />
          <h4 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
            Signal Conditioning &amp; Filter Specifications
          </h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
            <span className="text-[10px] text-[#8C827A] uppercase block">Analog Frontend</span>
            <span className="font-semibold text-[#262220] block mt-0.5">ESP32-S3 ADC1 (12-bit)</span>
          </div>
          <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
            <span className="text-[10px] text-[#8C827A] uppercase block">Bandpass Filter</span>
            <span className="font-semibold text-[#262220] block mt-0.5">20 Hz – 450 Hz (4th Butter)</span>
          </div>
          <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
            <span className="text-[10px] text-[#8C827A] uppercase block">Notch Filter</span>
            <span className="font-semibold text-[#262220] block mt-0.5">50 Hz / 60 Hz Hum Rejection</span>
          </div>
          <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
            <span className="text-[10px] text-[#8C827A] uppercase block">Window Overlap</span>
            <span className="font-semibold text-[#262220] block mt-0.5">200 ms / 50% Overlap</span>
          </div>
        </div>
      </div>
    </div>
  )
}
