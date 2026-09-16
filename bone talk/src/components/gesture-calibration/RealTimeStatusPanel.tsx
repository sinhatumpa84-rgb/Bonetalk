import React from 'react'
import type { CameraStatus } from './CameraLipViewer'

interface RealTimeStatusPanelProps {
  cameraStatus: CameraStatus
  faceDetected: boolean
  lipsTracked: boolean
  isCapturingSequence: boolean
  vsrModelProcessing: boolean
  isBackendAvailable: boolean | null
  isHardwareConnected: boolean
  isSyncActive: boolean
}

export const RealTimeStatusPanel: React.FC<RealTimeStatusPanelProps> = ({
  cameraStatus,
  faceDetected,
  lipsTracked,
  isCapturingSequence,
  vsrModelProcessing,
  isBackendAvailable,
  isHardwareConnected,
  isSyncActive,
}) => {
  // Honest state resolution
  const cameraLabel =
    cameraStatus === 'CAMERA ACTIVE'
      ? 'ACTIVE'
      : cameraStatus === 'CAMERA STARTING'
      ? 'STARTING'
      : cameraStatus === 'CAMERA ERROR'
      ? 'ERROR'
      : 'OFF'

  const cameraColor =
    cameraStatus === 'CAMERA ACTIVE'
      ? 'bg-[#41634F] text-[#41634F]'
      : cameraStatus === 'CAMERA STARTING'
      ? 'bg-[#F59E0B] text-[#F59E0B]'
      : cameraStatus === 'CAMERA ERROR'
      ? 'bg-[#EF4444] text-[#EF4444]'
      : 'bg-[#8C827A] text-[#8C827A]'

  const faceLabel = faceDetected ? 'DETECTED' : 'SEARCHING'
  const faceColor = faceDetected ? 'bg-[#41634F] text-[#41634F]' : 'bg-[#8C827A] text-[#8C827A]'

  const lipsLabel = lipsTracked ? 'TRACKING' : 'OFF'
  const lipsColor = lipsTracked ? 'bg-[#41634F] text-[#41634F]' : 'bg-[#8C827A] text-[#8C827A]'

  const seqLabel = isCapturingSequence ? 'CAPTURING' : 'IDLE'
  const seqColor = isCapturingSequence ? 'bg-[#F59E0B] text-[#F59E0B]' : 'bg-[#8C827A] text-[#8C827A]'

  const vsrLabel = vsrModelProcessing
    ? 'PROCESSING'
    : isBackendAvailable
    ? 'READY'
    : 'DEMO MODE'
  const vsrColor = vsrModelProcessing
    ? 'bg-[#F59E0B] text-[#F59E0B]'
    : isBackendAvailable
    ? 'bg-[#41634F] text-[#41634F]'
    : 'bg-[#0284C7] text-[#0284C7]'

  const muscleLabel = isHardwareConnected ? 'CONNECTED' : 'DISCONNECTED (DEMO)'
  const muscleColor = isHardwareConnected ? 'bg-[#41634F] text-[#41634F]' : 'bg-[#8C827A] text-[#8C827A]'

  const syncLabel = isSyncActive ? 'ACTIVE' : 'IDLE'
  const syncColor = isSyncActive ? 'bg-[#41634F] text-[#41634F]' : 'bg-[#8C827A] text-[#8C827A]'

  const items = [
    { label: 'MOVEMENT MONITOR', status: cameraLabel, color: cameraColor },
    { label: 'GESTURE TRACKING', status: faceLabel, color: faceColor },
    { label: 'SIGNAL STATUS', status: lipsLabel, color: lipsColor },
    { label: 'GESTURE SEQUENCE', status: seqLabel, color: seqColor },
    { label: 'PATTERN MODEL', status: vsrLabel, color: vsrColor },
    { label: 'MUSCLE TELEMETRY', status: muscleLabel, color: muscleColor },
    { label: 'SYNC', status: syncLabel, color: syncColor },
  ]

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 shadow-xs select-none">
      <div className="pb-2.5 mb-3 border-b border-[#E5E0D8]/60 flex items-center justify-between">
        <h4 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
          Real-Time Subsystem Status
        </h4>
        <span className="text-[10px] font-mono text-[#8C827A]">
          Live Hardware &bull; Sensor Signals
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {items.map((it) => (
          <div
            key={it.label}
            className="p-2 rounded bg-[#FAF8F5] border border-[#E5E0D8] flex flex-col justify-between min-h-[52px]"
          >
            <span className="text-[9px] font-mono font-semibold text-[#8C827A] uppercase truncate">
              {it.label}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${it.color.split(' ')[0]}`} />
              <span className="text-[10px] font-mono font-bold text-[#262220] truncate">
                {it.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RealTimeStatusPanel
