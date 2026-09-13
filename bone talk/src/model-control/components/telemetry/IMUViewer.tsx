import React from 'react'
import { Compass, Move } from 'lucide-react'
import { useModelControl } from '../../context/ModelControlContext'

export const IMUViewer: React.FC = () => {
  const { hasSensorData, imu } = useModelControl()

  const { accel, gyro } = imu

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E5E0D8]/60">
        <div className="flex items-center gap-2">
          <Compass size={14} className="text-[#41634F]" />
          <h4 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
            Inertial Measurement Unit (IMU 6-DOF)
          </h4>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="text-[#8C827A]">Spatial Head Tracking</span>
          <span className="h-2 w-px bg-[#E5E0D8]" />
          <span className={hasSensorData ? 'text-[#41634F] font-semibold' : 'text-[#8C827A]'}>
            {hasSensorData ? '50 Hz LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* ── IMU 6-DOF Dual Grid (Strictly Persistent Layout) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Accelerometer */}
        <div className="p-3 rounded-sm border border-[#E5E0D8] bg-[#FBF9F5]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-[#262220] uppercase">
              Accelerometer (g)
            </span>
            <Move size={12} className="text-[#41634F]" />
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center">
            <div className="p-2 rounded bg-[#FFFFFF] border border-[#E5E0D8] h-[48px] flex flex-col justify-between">
              <span className="text-[10px] text-[#8C827A] block">Axis X</span>
              <span className="font-semibold text-[#262220] truncate">
                {hasSensorData && accel.x !== null ? accel.x.toFixed(2) : '—'}
              </span>
            </div>
            <div className="p-2 rounded bg-[#FFFFFF] border border-[#E5E0D8] h-[48px] flex flex-col justify-between">
              <span className="text-[10px] text-[#8C827A] block">Axis Y</span>
              <span className="font-semibold text-[#262220] truncate">
                {hasSensorData && accel.y !== null ? accel.y.toFixed(2) : '—'}
              </span>
            </div>
            <div className="p-2 rounded bg-[#FFFFFF] border border-[#E5E0D8] h-[48px] flex flex-col justify-between">
              <span className="text-[10px] text-[#8C827A] block">Axis Z</span>
              <span className="font-semibold text-[#262220] truncate">
                {hasSensorData && accel.z !== null ? accel.z.toFixed(2) : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Gyroscope */}
        <div className="p-3 rounded-sm border border-[#E5E0D8] bg-[#FBF9F5]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-[#262220] uppercase">
              Gyroscope (deg/s)
            </span>
            <Compass size={12} className="text-[#41634F]" />
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center">
            <div className="p-2 rounded bg-[#FFFFFF] border border-[#E5E0D8] h-[48px] flex flex-col justify-between">
              <span className="text-[10px] text-[#8C827A] block">Axis X</span>
              <span className="font-semibold text-[#262220] truncate">
                {hasSensorData && gyro.x !== null ? gyro.x.toFixed(1) : '—'}
              </span>
            </div>
            <div className="p-2 rounded bg-[#FFFFFF] border border-[#E5E0D8] h-[48px] flex flex-col justify-between">
              <span className="text-[10px] text-[#8C827A] block">Axis Y</span>
              <span className="font-semibold text-[#262220] truncate">
                {hasSensorData && gyro.y !== null ? gyro.y.toFixed(1) : '—'}
              </span>
            </div>
            <div className="p-2 rounded bg-[#FFFFFF] border border-[#E5E0D8] h-[48px] flex flex-col justify-between">
              <span className="text-[10px] text-[#8C827A] block">Axis Z</span>
              <span className="font-semibold text-[#262220] truncate">
                {hasSensorData && gyro.z !== null ? gyro.z.toFixed(1) : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
