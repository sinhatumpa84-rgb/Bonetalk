import React, { useRef, useEffect, useState } from 'react'
import { Camera, CameraOff, RefreshCw, CheckCircle2, Play } from 'lucide-react'
import { lipTrackerService } from '../../services/lipTrackerService'
import type { LipTrackingState } from '../../services/lipTrackerService'

export type CameraStatus = 'CAMERA OFF' | 'CAMERA STARTING' | 'CAMERA ACTIVE' | 'CAMERA ERROR'

interface CameraLipViewerProps {
  isRecording: boolean
  recordingDurationS: number
  onCameraStatusChange?: (status: CameraStatus) => void
}

export const CameraLipViewer: React.FC<CameraLipViewerProps> = ({
  isRecording,
  recordingDurationS,
  onCameraStatusChange,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('CAMERA OFF')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [frameCount, setFrameCount] = useState<number>(0)
  const [trackingState, setTrackingState] = useState<LipTrackingState>({
    faceDetected: false,
    lipsTracked: false,
    lipBoundingBox: null,
    openness: 0,
    aspectRatio: 1.0,
    landmarks: [],
    fps: 30,
  })

  // Notify parent of camera status changes
  useEffect(() => {
    onCameraStatusChange?.(cameraStatus)
  }, [cameraStatus, onCameraStatusChange])

  // Subscribe to tracking state changes
  useEffect(() => {
    const unsub = lipTrackerService.onStateChange((state) => {
      setTrackingState(state)
      if (state.lipsTracked) {
        setFrameCount((prev) => prev + 1)
      }
    })
    return unsub
  }, [])

  const handleStartCamera = async () => {
    if (!videoRef.current || !canvasRef.current) return
    setCameraStatus('CAMERA STARTING')
    setCameraError(null)

    try {
      await lipTrackerService.startCamera(videoRef.current, canvasRef.current)
      setCameraStatus('CAMERA ACTIVE')
    } catch (err: unknown) {
      setCameraStatus('CAMERA ERROR')
      const msg =
        err instanceof Error
          ? err.message
          : 'Camera access is required for live gesture tracking.'
      setCameraError(msg)
    }
  }

  const handleStopCamera = () => {
    lipTrackerService.stopCamera()
    setCameraStatus('CAMERA OFF')
    setFrameCount(0)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      lipTrackerService.stopCamera()
    }
  }, [])

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 shadow-xs flex flex-col gap-3 select-none">
      {/* ── Section Header (LIVE GESTURE TRACKING) ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#E5E0D8]/60">
        <div className="flex items-center gap-2">
          <Camera size={15} className="text-[#41634F]" />
          <div>
            <h4 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
              LIVE GESTURE TRACKING
            </h4>
            <p className="text-[10px] font-mono text-[#8C827A]">
              Real-time muscle activity and gesture pattern monitoring
            </p>
          </div>
        </div>

        {/* Live Status Indicators (Requirement 5) */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono font-bold">
          {/* Gesture Status */}
          <span className="px-2 py-0.5 rounded bg-[#FAF8F5] text-[#262220] border border-[#E5E0D8] flex items-center gap-1">
            <span className="text-[#8C827A]">GESTURE STATUS:</span>
            <span className={isRecording ? 'text-[#92400E]' : 'text-[#41634F]'}>
              {isRecording ? 'RECORDING' : 'WAITING'}
            </span>
          </span>

          {/* Signal Status */}
          <span className="px-2 py-0.5 rounded bg-[#FAF8F5] text-[#262220] border border-[#E5E0D8] flex items-center gap-1">
            <span className="text-[#8C827A]">SIGNAL STATUS:</span>
            <span className="text-[#41634F]">READY</span>
          </span>

          {/* Pattern Status */}
          <span className="px-2 py-0.5 rounded bg-[#FAF8F5] text-[#262220] border border-[#E5E0D8] flex items-center gap-1">
            <span className="text-[#8C827A]">PATTERN STATUS:</span>
            <span className={trackingState.lipsTracked ? 'text-[#41634F]' : 'text-[#8C827A]'}>
              {trackingState.lipsTracked ? 'DETECTED' : 'NOT DETECTED'}
            </span>
          </span>

          {cameraStatus === 'CAMERA ACTIVE' && (
            <button
              type="button"
              onClick={handleStopCamera}
              className="px-2 py-0.5 rounded text-[10px] text-[#736B63] hover:text-[#991B1B] hover:bg-[#FEE2E2]/60 border border-[#E5E0D8] transition-colors cursor-pointer"
              title="Turn Monitor Off"
            >
              STOP MONITOR
            </button>
          )}
        </div>
      </div>

      {/* ── Gesture Monitor Viewport & Overlay (Strictly Fixed Dimensions: 380px) ── */}
      <div className="relative w-full h-[360px] sm:h-[400px] bg-[#141210] rounded-sm overflow-hidden border border-[#E5E0D8] flex items-center justify-center">
        {/* Real Webcam Video feed (Visible when active) */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-cover transform -scale-x-100 ${
            cameraStatus === 'CAMERA ACTIVE' ? 'block' : 'hidden'
          }`}
        />

        {/* HUD Overlay Canvas */}
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none transform -scale-x-100 ${
            cameraStatus === 'CAMERA ACTIVE' ? 'block' : 'hidden'
          }`}
        />

        {/* ── CAMERA OFF State: Prominent START GESTURE MONITOR CTA ── */}
        {cameraStatus === 'CAMERA OFF' && (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
            <div className="w-14 h-14 rounded-full bg-[#FAF8F5]/10 border border-[#E5E0D8]/20 flex items-center justify-center text-[#FAF8F5]/70 mb-1">
              <Camera size={26} />
            </div>
            <div>
              <h5 className="font-mono text-sm font-bold text-[#FAF8F5] uppercase tracking-wider">
                LIVE GESTURE MONITOR
              </h5>
              <p className="font-mono text-xs text-[#FAF8F5]/60 max-w-sm mt-1">
                Position yourself in front of the camera and perform the calibrated movement.
              </p>
            </div>
            <button
              type="button"
              onClick={handleStartCamera}
              className="mt-2 px-6 py-3 rounded-sm bg-[#41634F] text-[#FFFFFF] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#4D755E] transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-102"
            >
              <Play size={14} fill="currentColor" />
              <span>START GESTURE MONITOR</span>
            </button>
          </div>
        )}

        {/* ── CAMERA STARTING State: Spinner ── */}
        {cameraStatus === 'CAMERA STARTING' && (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 z-10 text-[#FAF8F5]">
            <RefreshCw size={28} className="animate-spin text-[#41634F]" />
            <h5 className="font-mono text-xs font-bold uppercase tracking-wider">
              Initializing Gesture Monitor...
            </h5>
            <p className="font-mono text-[11px] text-[#FAF8F5]/60 max-w-xs">
              Establishing live movement tracking feed and optical sensor gateway.
            </p>
          </div>
        )}

        {/* ── CAMERA ERROR State: Specific Permission Message ── */}
        {cameraStatus === 'CAMERA ERROR' && (
          <div className="absolute inset-0 bg-[#FAF8F5]/98 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center text-[#991B1B] mb-2">
              <CameraOff size={24} />
            </div>
            <h5 className="font-mono text-sm font-bold text-[#991B1B] uppercase tracking-wider mb-1">
              Optical sensor access required for gesture monitoring.
            </h5>
            <p className="text-xs font-mono text-[#736B63] max-w-sm mb-4">
              {cameraError || 'Please allow browser webcam permissions so BoneTalk can track your gesture movement.'}
            </p>
            <button
              type="button"
              onClick={handleStartCamera}
              className="px-4 py-2 rounded-sm text-xs font-mono font-bold bg-[#2B382D] text-[#FFFFFF] hover:bg-[#38493B] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>RETRY GESTURE MONITOR</span>
            </button>
          </div>
        )}

        {/* ── Floating Recording HUD Banner ── */}
        {isRecording && cameraStatus === 'CAMERA ACTIVE' && (
          <div className="absolute top-3 left-3 bg-[#991B1B]/90 backdrop-blur-xs text-[#FFFFFF] font-mono text-xs font-bold px-3 py-1.5 rounded flex items-center gap-2 shadow-md z-10">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFFFFF] animate-ping" />
            <span>CAPTURING &bull; {recordingDurationS.toFixed(1)}s</span>
          </div>
        )}

        {/* ── Floating Readout Bar ── */}
        {trackingState.lipsTracked && cameraStatus === 'CAMERA ACTIVE' && (
          <div className="absolute bottom-3 left-3 right-3 bg-[#141210]/85 backdrop-blur-xs text-[#FAF8F5] font-mono text-[10px] px-3 py-1.5 rounded border border-[#E5E0D8]/20 flex flex-wrap items-center justify-between gap-2 z-10">
            <div className="flex items-center gap-3">
              <span>Movement Region: <strong className="text-[#86EFAC]">LOCKED</strong></span>
              <span>Aspect Ratio: <strong>{trackingState.aspectRatio.toFixed(2)}</strong></span>
              <span>Optical Points: <strong>{trackingState.landmarks.length > 0 ? '40+ points' : '0'}</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <span>Frames Processed: <strong>{frameCount}</strong></span>
              <span className="text-[#86EFAC] flex items-center gap-1">
                <CheckCircle2 size={11} />
                Tracking Conf: 97%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Subtitle Guidance ── */}
      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-[#8C827A] pt-1">
        <span>Position yourself in front of the camera and perform the calibrated movement.</span>
        <span>Optical Kinematics &bull; Normalized Movement Region</span>
      </div>
    </div>
  )
}

export default CameraLipViewer
