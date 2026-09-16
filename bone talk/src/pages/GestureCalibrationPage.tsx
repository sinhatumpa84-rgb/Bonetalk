import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
  Play,
  RotateCcw,
  ArrowLeft,
  Sparkles,
} from 'lucide-react'
import { CameraLipViewer } from '../components/gesture-calibration/CameraLipViewer'
import type { CameraStatus } from '../components/gesture-calibration/CameraLipViewer'
import { RealTimeStatusPanel } from '../components/gesture-calibration/RealTimeStatusPanel'
import { TrainingFlowStepCard } from '../components/gesture-calibration/TrainingFlowStepCard'
import type { TrainingStep } from '../components/gesture-calibration/TrainingFlowStepCard'
import { ThreeMuscleWaveforms } from '../components/gesture-calibration/ThreeMuscleWaveforms'
import { VisualSpeechStatusCard } from '../components/gesture-calibration/VisualSpeechStatusCard'
import { LiveSpeechOutputCard } from '../components/gesture-calibration/LiveSpeechOutputCard'
import { SynchronizedTimelineViewer } from '../components/gesture-calibration/SynchronizedTimelineViewer'
import { GestureGeneratorCard } from '../components/gesture-calibration/GestureGeneratorCard'
import { CalibrationResultModal } from '../components/gesture-calibration/CalibrationResultModal'
import { CalibrationDatasetViewer } from '../components/gesture-calibration/CalibrationDatasetViewer'

import { useThreeMuscleTelemetry } from '../hooks/useThreeMuscleTelemetry'
import { visualSpeechService, SUPPORTED_VSR_VOCABULARY } from '../services/visualSpeechService'
import type { VsrPredictionResult } from '../services/visualSpeechService'
import { lipTrackerService } from '../services/lipTrackerService'
import { gestureCalibrationSync } from '../services/gestureCalibrationSync'
import type { CalibrationTrialRecord, CalibrationSessionSummary } from '../services/gestureCalibrationSync'

type CalibrationStage =
  | 'IDLE'
  | 'READY'
  | 'RECORDING'
  | 'PROCESSING'
  | 'RECOGNIZING'
  | 'ASSOCIATING'
  | 'TRIAL_COMPLETE'
  | 'CALIBRATION_COMPLETE'

export const GestureCalibrationPage: React.FC = () => {
  // Phrase state
  const [targetPhrase, setTargetPhrase] = useState('HELLO')
  const [lockedPhrase, setLockedPhrase] = useState('HELLO')

  // Camera & Tracking state
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('CAMERA OFF')
  const [faceDetected, setFaceDetected] = useState(false)
  const [lipsTracked, setLipsTracked] = useState(false)

  // Workflow state
  const [stage, setStage] = useState<CalibrationStage>('IDLE')
  const [trainingStep, setTrainingStep] = useState<TrainingStep>(0)
  const [stageText, setStageText] = useState('Ready to begin custom gesture calibration.')
  const [currentTrial, setCurrentTrial] = useState(1)
  const totalTrials = 5
  const [countdown, setCountdown] = useState<number | null>(null)
  const [recordingDurationS, setRecordingDurationS] = useState(0)

  // Trials storage
  const [recordedTrials, setRecordedTrials] = useState<CalibrationTrialRecord[]>([])
  const [sessionSummary, setSessionSummary] = useState<CalibrationSessionSummary | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)

  // Gesture Pattern state
  const [latestVsrResult, setLatestVsrResult] = useState<VsrPredictionResult | null>(null)
  const [speechOutputPhrase, setSpeechOutputPhrase] = useState<string | null>(null)
  const [speechConfidence, setSpeechConfidence] = useState<number | null>(null)

  // Multi-modal timeline for display
  const [activeTimeline, setActiveTimeline] = useState<any[]>([])
  const [activeDurationMs, setActiveDurationMs] = useState<number>(0)
  const [activeSyncStatus, setActiveSyncStatus] = useState<'VALID' | 'DRIFT_DETECTED' | 'UNSYNCHRONIZED'>('VALID')

  // Three-muscle telemetry hook
  const telemetry = useThreeMuscleTelemetry()

  // Ref to cancel active async calibration
  const abortControllerRef = useRef<AbortController | null>(null)

  const isCalibrating = stage !== 'IDLE' && stage !== 'CALIBRATION_COMPLETE'

  // Generate synthetic multi-modal dataset from calibration session when complete
  const completedDataset = useMemo(() => {
    if (!sessionSummary) return null
    return gestureCalibrationSync.generateSyntheticDataset(sessionSummary, 30)
  }, [sessionSummary])

  // Subscribe to tracking state changes for real-time status panel
  useEffect(() => {
    const unsub = lipTrackerService.onStateChange((state) => {
      setFaceDetected(state.faceDetected)
      setLipsTracked(state.lipsTracked)
    })
    return unsub
  }, [])

  const handleSelectPreset = (phrase: string) => {
    if (isCalibrating) return
    setTargetPhrase(phrase)
  }

  const handleStartCalibration = async () => {
    if (isCalibrating) return
    const phrase = targetPhrase.trim().toUpperCase()
    if (!phrase) return

    setLockedPhrase(phrase)
    setRecordedTrials([])
    setSessionSummary(null)
    setLatestVsrResult(null)
    setCurrentTrial(1)
    setShowResultModal(false)

    abortControllerRef.current = new AbortController()
    await runTrialsSequence(phrase, 1, [])
  }

  const runTrialsSequence = async (
    phrase: string,
    trialNum: number,
    accumulatedTrials: CalibrationTrialRecord[]
  ) => {
    setCurrentTrial(trialNum)

    // ── STEP 1: PREPARE ──
    setTrainingStep(1)
    setStage('READY')
    setStageText(`STEP 1: PREPARE — Position yourself comfortably and prepare the gesture (Trial ${trialNum}/${totalTrials})`)

    for (let c = 3; c >= 1; c--) {
      setCountdown(c)
      await new Promise((r) => setTimeout(r, 800))
    }
    setCountdown(null)

    // ── STEP 2: SELECT GESTURE ──
    setTrainingStep(2)
    setStageText(`STEP 2: SELECT GESTURE — Target gesture: "${phrase}"`)
    await new Promise((r) => setTimeout(r, 600))

    // ── STEP 3: CAPTURE (2.5s recording window) ──
    setTrainingStep(3)
    setStage('RECORDING')
    setStageText(`STEP 3: CAPTURE — Recording Muscle 1 / Muscle 2 / Muscle 3`)
    const trialStartTime = performance.now()

    // Start video & muscle collection
    lipTrackerService.startRecording()
    telemetry.startRecording()

    // Recording duration timer
    const recordingDuration = 2500 // 2.5s
    const startRecordWall = Date.now()
    const timerInterval = setInterval(() => {
      const elapsed = (Date.now() - startRecordWall) / 1000
      setRecordingDurationS(Math.min(2.5, elapsed))
    }, 100)

    await new Promise((r) => setTimeout(r, recordingDuration))
    clearInterval(timerInterval)

    const trialEndTime = performance.now()
    const visualFrames = lipTrackerService.stopRecording()
    const muscleSamples = telemetry.stopRecording()

    // ── STEP 4: ANALYZE ──
    setTrainingStep(4)
    setStage('PROCESSING')
    setStageText(`STEP 4: ANALYZING — Analyzing muscle activity pattern...`)
    await new Promise((r) => setTimeout(r, 600))

    // ── STEP 5: PATTERN RECOGNITION ──
    setTrainingStep(5)
    setStage('RECOGNIZING')
    setStageText(`STEP 5: PATTERN RECOGNITION — Comparing captured gesture pattern...`)

    // Real 3-channel muscle gesture model prediction
    const muscleModelResult = await gestureCalibrationSync.predictMuscleGesture(
      phrase,
      muscleSamples,
      telemetry.isHardwareConnected
    )

    // Visual tracking result for multi-modal context
    const vsrResult = await visualSpeechService.decodeVisualSpeech(phrase, visualFrames)

    // Combine into unified model output driven by 3-channel muscle telemetry
    const combinedResult: VsrPredictionResult = {
      ...vsrResult,
      recognizedPhrase: muscleModelResult.recognizedPhrase,
      confidence: muscleModelResult.confidence,
      status: (muscleModelResult.status as any) || vsrResult.status,
      isMatch: muscleModelResult.isMatch,
      model: muscleModelResult.model,
      isDemoSimulation: muscleModelResult.isDemoSimulation,
    }
    setLatestVsrResult(combinedResult)

    // Recognized phrase strictly originates from model result
    if (
      muscleModelResult.recognizedPhrase &&
      muscleModelResult.recognizedPhrase !== 'UNKNOWN' &&
      muscleModelResult.recognizedPhrase !== 'UNSUPPORTED PHRASE'
    ) {
      setSpeechOutputPhrase(muscleModelResult.recognizedPhrase)
      setSpeechConfidence(muscleModelResult.confidence)
    } else {
      setSpeechOutputPhrase('PATTERN UNCERTAIN')
      setSpeechConfidence(muscleModelResult.confidence)
    }

    await new Promise((r) => setTimeout(r, 600))

    // ── STEP 6: CALIBRATION RESULT ──
    setTrainingStep(6)
    setStage('ASSOCIATING')
    setStageText(`STEP 6: CALIBRATION RESULT — Gesture pattern calibration complete.`)

    // Persist trial to backend database if connected
    gestureCalibrationSync.registerTrialToBackend(
      `cal_session_${phrase.toLowerCase()}`,
      trialNum,
      phrase,
      muscleSamples,
      telemetry.isHardwareConnected
    )

    const trialRecord = gestureCalibrationSync.synchronizeTrialData(
      trialNum,
      phrase,
      trialStartTime,
      trialEndTime,
      visualFrames,
      muscleSamples,
      muscleModelResult.recognizedPhrase,
      muscleModelResult.confidence,
      telemetry.isHardwareConnected,
      muscleModelResult.model
    )

    // Update active synchronized timeline
    setActiveTimeline(trialRecord.synchronizedTimeline)
    setActiveDurationMs(trialRecord.durationMs)
    setActiveSyncStatus(trialRecord.syncStatus)

    const updatedTrials = [...accumulatedTrials, trialRecord]
    setRecordedTrials(updatedTrials)

    await new Promise((r) => setTimeout(r, 700))

    // Check if more trials remain
    if (trialNum < totalTrials) {
      setStage('TRIAL_COMPLETE')
      setStageText(`Trial ${trialNum} / ${totalTrials} complete. Next trial starting shortly...`)
      await new Promise((r) => setTimeout(r, 1200))
      await runTrialsSequence(phrase, trialNum + 1, updatedTrials)
    } else {
      // Complete 5 trials and evaluate session
      setStage('CALIBRATION_COMPLETE')
      setStageText(`All 5 calibration trials complete for "${phrase}".`)

      const summary = gestureCalibrationSync.evaluateSession(phrase, updatedTrials)
      setSessionSummary(summary)
      setShowResultModal(true)
    }
  }

  const handleResetCalibration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    lipTrackerService.stopRecording()
    telemetry.stopRecording()
    telemetry.stopDemoSimulation()

    setStage('IDLE')
    setTrainingStep(0)
    setStageText('Ready to begin custom gesture calibration.')
    setCurrentTrial(1)
    setCountdown(null)
    setRecordingDurationS(0)
    setRecordedTrials([])
    setSessionSummary(null)
    setLatestVsrResult(null)
    setSpeechOutputPhrase(null)
    setSpeechConfidence(null)
    setActiveTimeline([])
    setActiveDurationMs(0)
  }

  const handleNavigateHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#262220] flex flex-col font-sans selection:bg-[#41634F]/20 selection:text-[#2B382D]">
      {/* ── Engineering Suite Header ── */}
      <header className="bg-[#FFFFFF] border-b border-[#E5E0D8] sticky top-0 z-30 px-4 sm:px-8 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleNavigateHome}
              className="p-1.5 rounded border border-[#E5E0D8] bg-[#FAF8F5] text-[#736B63] hover:text-[#262220] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
              title="Return to BoneTalk Home"
            >
              <ArrowLeft size={16} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#41634F]" />
                <h1 className="text-sm sm:text-base font-mono font-extrabold tracking-wider text-[#262220] uppercase">
                  Gesture Calibration Suite
                </h1>
              </div>
              <p className="text-[11px] font-mono text-[#8C827A] mt-0.5">
                Teach BoneTalk a custom muscle-driven gesture pattern.
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono font-bold">
            <span className="px-2 py-0.5 rounded bg-[#E8EFEA] text-[#2B382D] border border-[#41634F]/30 flex items-center gap-1">
              <Sparkles size={11} />
              GESTURE PATTERN MODEL
            </span>
            <span className="px-2 py-0.5 rounded bg-[#E0F2FE] text-[#0369A1] border border-[#38BDF8]/40">
              3-CHANNEL MUSCLE SYNC
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Viewport Container ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ── Section 11: Real-Time Subsystem Status Panel ── */}
        <RealTimeStatusPanel
          cameraStatus={cameraStatus}
          faceDetected={faceDetected}
          lipsTracked={lipsTracked}
          isCapturingSequence={stage === 'RECORDING'}
          vsrModelProcessing={stage === 'PROCESSING' || stage === 'RECOGNIZING'}
          isBackendAvailable={visualSpeechService.isConnectedToBackend}
          isHardwareConnected={telemetry.isHardwareConnected}
          isSyncActive={isCalibrating}
        />

        {/* ── Section 9: Custom Gesture & START TRAINING Control Bar ── */}
        <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[280px]">
              <label className="block text-[10px] font-mono font-bold uppercase text-[#8C827A] mb-1">
                CUSTOM GESTURE (TARGET PATTERN)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={targetPhrase}
                  onChange={(e) => setTargetPhrase(e.target.value)}
                  disabled={isCalibrating}
                  placeholder="Enter custom gesture (e.g. HELLO, YES, WATER, HELP)"
                  className="w-full sm:max-w-md px-3.5 py-2 text-sm font-mono font-bold uppercase rounded border border-[#E5E0D8] bg-[#FAF8F5] text-[#262220] focus:outline-none focus:ring-1 focus:ring-[#41634F] disabled:opacity-60 disabled:cursor-not-allowed"
                />

                <button
                  type="button"
                  onClick={handleStartCalibration}
                  disabled={isCalibrating || !targetPhrase.trim()}
                  className={`px-5 py-2 rounded-sm text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                    isCalibrating || !targetPhrase.trim()
                      ? 'bg-[#E5E0D8] text-[#8C827A] cursor-not-allowed'
                      : 'bg-[#2B382D] text-[#FFFFFF] hover:bg-[#38493B] shadow-xs hover:scale-101'
                  }`}
                >
                  <Play size={13} fill="currentColor" />
                  <span>{isCalibrating ? 'TRAINING IN PROGRESS...' : 'START TRAINING'}</span>
                </button>

                {isCalibrating && (
                  <button
                    type="button"
                    onClick={handleResetCalibration}
                    className="px-3 py-2 rounded-sm text-xs font-mono font-semibold border border-[#E5E0D8] bg-[#FAF8F5] text-[#5C554E] hover:text-[#262220] hover:bg-[#F2EFE9] transition-all cursor-pointer flex items-center gap-1"
                    title="Cancel active training session"
                  >
                    <RotateCcw size={12} />
                    <span>CANCEL</span>
                  </button>
                )}
              </div>
            </div>

            {/* Calibration Status Notice */}
            <div className="text-right font-mono text-xs">
              <span className="text-[10px] text-[#8C827A] uppercase block">Calibration Status</span>
              <span className="font-bold text-[#41634F] uppercase block">{stage}</span>
            </div>
          </div>

          {/* Quick Preset Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E5E0D8]/60 text-xs font-mono">
            <span className="text-[10px] text-[#8C827A] uppercase mr-1">Quick Presets:</span>
            {SUPPORTED_VSR_VOCABULARY.map((word) => (
              <button
                key={word}
                type="button"
                onClick={() => handleSelectPreset(word)}
                disabled={isCalibrating}
                className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer disabled:opacity-50 ${
                  targetPhrase.trim().toUpperCase() === word
                    ? 'bg-[#2B382D] text-[#FFFFFF] border-[#2B382D]'
                    : 'bg-[#FAF8F5] text-[#5C554E] border-[#E5E0D8] hover:bg-[#EFECE6]'
                }`}
              >
                {word}
              </button>
            ))}
          </div>

          {/* ── 5-Trial Progression Indicator ── */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="font-bold text-[#262220] uppercase">
                {countdown !== null ? `GET READY IN ${countdown}...` : stageText}
              </span>
              <span className="font-bold text-[#41634F]">
                TRIAL {isCalibrating ? currentTrial : recordedTrials.length} / {totalTrials}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((trialNum) => {
                const trialDone = recordedTrials.some((t) => t.trialNumber === trialNum)
                const isCurrent = currentTrial === trialNum && isCalibrating
                return (
                  <div
                    key={trialNum}
                    className={`py-1.5 px-2 rounded text-center font-mono text-xs font-bold border transition-all ${
                      trialDone
                        ? 'bg-[#E8EFEA] text-[#2B382D] border-[#41634F]/40'
                        : isCurrent
                        ? 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B] shadow-xs'
                        : 'bg-[#FAF8F5] text-[#A8A29E] border-[#E5E0D8]'
                    }`}
                  >
                    TRIAL {trialNum} / 5
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Section 16: Training Session Flow (6 Steps) ── */}
        <TrainingFlowStepCard
          currentStep={trainingStep}
          targetPhrase={lockedPhrase}
          recognizedPhrase={speechOutputPhrase}
          confidence={speechConfidence}
          trialNumber={currentTrial}
          totalTrials={totalTrials}
          isCalibrating={isCalibrating}
        />

        {/* ── Main Operations 2-Column Grid (Zero Layout Shift) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Camera + 3-Muscle Waveforms ── 7 Cols */}
          <div className="lg:col-span-7 space-y-6">
            <CameraLipViewer
              isRecording={stage === 'RECORDING'}
              recordingDurationS={recordingDurationS}
              onCameraStatusChange={setCameraStatus}
            />

            <ThreeMuscleWaveforms
              muscle1={telemetry.muscle1}
              muscle2={telemetry.muscle2}
              muscle3={telemetry.muscle3}
              isRecording={stage === 'RECORDING'}
              isHardwareConnected={telemetry.isHardwareConnected}
              isDemoActive={telemetry.isDemoSimulationActive}
              onToggleDemo={() => {
                if (telemetry.isDemoSimulationActive) telemetry.stopDemoSimulation()
                else telemetry.startDemoSimulation()
              }}
            />
          </div>

          {/* Right Column: Gesture Pattern Analysis + Gesture Output + Generator + Timeline ── 5 Cols */}
          <div className="lg:col-span-5 space-y-6">
            <VisualSpeechStatusCard
              targetPhrase={lockedPhrase}
              currentStatus={
                stage === 'RECORDING'
                  ? 'CAPTURING'
                  : stage === 'RECOGNIZING' || stage === 'PROCESSING'
                  ? 'ANALYZING'
                  : latestVsrResult?.status === 'RECOGNIZED'
                  ? 'RECOGNIZED'
                  : latestVsrResult?.status === 'UNCERTAIN'
                  ? 'UNCERTAIN'
                  : 'WAITING'
              }
              latestResult={latestVsrResult}
              isProcessing={stage === 'PROCESSING' || stage === 'RECOGNIZING'}
            />

            <LiveSpeechOutputCard
              targetPhrase={lockedPhrase}
              recognizedPhrase={speechOutputPhrase}
              confidence={speechConfidence}
              isDemoSimulation={latestVsrResult?.isDemoSimulation ?? true}
            />

            <GestureGeneratorCard
              targetGesture={lockedPhrase}
              onGenerateGesture={async (gesture) => {
                setSpeechOutputPhrase(gesture)
                const samples = telemetry.getRecordingSamples()
                const pred = await gestureCalibrationSync.predictMuscleGesture(
                  gesture,
                  samples.length > 0 ? samples : [{ timestampMs: 0, m1: 0.45, m2: 0.32, m3: 0.18 }],
                  telemetry.isHardwareConnected
                )
                setSpeechConfidence(pred.confidence)
                setLatestVsrResult((prev) =>
                  prev
                    ? {
                        ...prev,
                        recognizedPhrase: gesture,
                        confidence: pred.confidence,
                        status: 'RECOGNIZED',
                        isMatch: true,
                        isDemoSimulation: pred.isDemoSimulation,
                      }
                    : null
                )
              }}
            />

            <SynchronizedTimelineViewer
              timeline={activeTimeline}
              durationMs={activeDurationMs}
              syncStatus={activeSyncStatus}
            />
          </div>
        </div>

        {/* ── Generated Synthetic Dataset Section (Visible after calibration) ── */}
        {completedDataset && (
          <div className="space-y-2 pt-2 border-t border-[#E5E0D8]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#262220]">
                Calibrated Gesture Dataset Preview
              </span>
              <button
                type="button"
                onClick={() => setShowResultModal(true)}
                className="text-[11px] font-mono text-[#41634F] hover:underline font-bold cursor-pointer"
              >
                Open Full Summary &amp; Validation &rarr;
              </button>
            </div>
            <CalibrationDatasetViewer dataset={completedDataset} />
          </div>
        )}
      </main>

      {/* ── Calibration Result Modal & Validation Test ── */}
      {showResultModal && sessionSummary && (
        <CalibrationResultModal
          summary={sessionSummary}
          onClose={() => setShowResultModal(false)}
          onRetestValidation={() => {
            handleResetCalibration()
          }}
        />
      )}

      {/* ── Console Footer ── */}
      <footer className="bg-[#FFFFFF] border-t border-[#E5E0D8] px-4 sm:px-8 py-3 text-[11px] font-mono text-[#8C827A] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[#262220]">BoneTalk Gesture Calibration Suite</span>
          <span>&bull;</span>
          <span>Multi-Channel Muscle &amp; Gesture Pattern Engine</span>
          <span>&bull;</span>
          <span>Renesas RA4M1 14-Bit ADC</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#41634F]" />
          <span>Clinical Wearable Telemetry Standard</span>
        </div>
      </footer>
    </div>
  )
}

export default GestureCalibrationPage
