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
        <span className="text-[11px] font-mono text-[#8C827A]">Spatial Head Tracking</span>
      </div>

      {!hasSensorData ? (
        <div className="py-6 px-4 rounded-sm border border-[#E5E0D8] bg-[#FAF8F5] text-center">
          <p className="text-xs font-mono font-semibold text-[#5C554E]">
            Waiting for hardware data...
          </p>
          <span className="text-[11px] font-mono text-[#8C827A] mt-1 block">
            IMU telemetry active when connected device broadcasts 6-axis vectors.
          </span>
        </div>
      ) : (
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
              <div className="p-2 rounded bg-[#FFFFFF] border border-[#E5E0D8]">
                <span className="text-[10px] text-[#8C827A] block">Axis X</span>
                <span className="font-semibold text-[#262220]">
                  {accel.x !== null ? accel.x.toFixed(2) : '—'}
                </span>
              </div>
              <div className="p-2 rounded bg-[#FFFFFF] border border-[#E5E0D8]">
                <span className="text-[10px] text-[#8C827A] block">Axis Y</span>
                <span className="font-semibold text-[#262220]">
                  {accel.y !== null ? accel.y.toFixed(2) : '—'}
                </span>
              </div>
              <div className="p-2 rounded bg-[#FFFFFF] border border-[#E5E0D8]">
                <span className="text-[10px] text-[#8C827A] block">Axis Z</span>
                <span className="font-semibold text-[#262220]">
                  {accel.z !== null ? accel.z.toFixed(2) : '—'}
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
              <div className="p-2 rounded bg-[#FFFFFF] border border-[#E5E0D8]">
                <span className="text-[10px] text-[#8C827A] block">Axis X</span>
                <span className="font-semibold text-[#262220]">
                  {gyro.x !== null ? gyro.x.toFixed(1) : '—'}
                </span>
              </div>
              <div className="p-2 rounded bg-[#FFFFFF] border border-[#E5E0D8]">
                <span className="text-[10px] text-[#8C827A] block">Axis Y</span>
                <span className="font-semibold text-[#262220]">
                  {gyro.y !== null ? gyro.y.toFixed(1) : '—'}
                </span>
              </div>
              <div className="p-2 rounded bg-[#FFFFFF] border border-[#E5E0D8]">
                <span className="text-[10px] text-[#8C827A] block">Axis Z</span>
                <span className="font-semibold text-[#262220]">
                  {gyro.z !== null ? gyro.z.toFixed(1) : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
