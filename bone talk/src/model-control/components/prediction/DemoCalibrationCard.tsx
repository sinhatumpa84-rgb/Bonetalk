import React, { useState } from 'react'
import {
  Activity,
  Play,
  RotateCcw,
  CheckCircle2,
  Radio,
  Sliders,
  Sparkles,
  Info,
  Terminal,
} from 'lucide-react'
import { useModelControl } from '../../context/ModelControlContext'

export const DemoCalibrationCard: React.FC = () => {
  const {
    demoCalibration,
    startDemoCalibration,
    triggerHelloAction,
    runDemoInference,
    resetDemoCalibration,
  } = useModelControl()

  const [isTestingInference, setIsTestingInference] = useState(false)
  const [inferenceFeedback, setInferenceFeedback] = useState<string | null>(null)

  const isRunning =
    demoCalibration.status !== 'IDLE' &&
    demoCalibration.status !== 'CALIBRATION_COMPLETE'

  const handleStart = async () => {
    setInferenceFeedback(null)
    try {
      await startDemoCalibration()
    } catch {
      // handled
    }
  }

  const handleTestInference = async () => {
    setIsTestingInference(true)
    setInferenceFeedback(null)
    try {
      await runDemoInference()
      setInferenceFeedback('Test inference complete: Recognized "HELLO"')
    } catch (err: unknown) {
      setInferenceFeedback(`Inference error: ${(err as Error).message}`)
    } finally {
      setIsTestingInference(false)
    }
  }

  const currentFeatures = demoCalibration.currentFeatures || {
    rms: 0,
    mav: 0,
    zcr: 0,
    peakToPeak: 0,
    waveformLength: 0,
    energy: 0,
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 sm:p-5 shadow-xs flex flex-col gap-4">
      {/* ── Top Header & Transparency Badges ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5E0D8]/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-sm bg-[#41634F]/10 flex items-center justify-center text-[#41634F]">
            <Sliders size={16} />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
              Simulated EMG Model Calibration
            </h3>
            <p className="text-[11px] font-mono text-[#8C827A]">
              Deterministic Bio-Signal Articulatory Calibration System
            </p>
          </div>
        </div>

        {/* Badges: Explicit DEMO MODE & SIMULATED SIGNAL labels */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/40">
            <Radio size={10} className="animate-pulse" />
            <span>DEMO MODE</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#38BDF8]/40">
            <span>SIMULATED EMG SIGNAL</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E8EFEA] text-[#2B382D] border border-[#41634F]/30">
            <span>COMMAND: HELLO</span>
          </span>
        </div>
      </div>

      {/* ── Scientific & Honesty Disclaimer Banner ── */}
      <div className="p-3 rounded-sm bg-[#FAF8F5] border border-[#E5E0D8] text-xs font-mono text-[#5C554E] flex items-start gap-2.5">
        <Info size={15} className="text-[#8C827A] shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <span className="font-bold text-[#262220]">Simulation Notice: </span>
          This workflow synthesizes facial EMG biopotentials with articulatory phoneme envelopes
          (<code className="bg-[#EFECE6] px-1 py-0.2 rounded text-[#262220]">/hɛ/</code> burst &rarr; inter-syllabic dip &rarr;{' '}
          <code className="bg-[#EFECE6] px-1 py-0.2 rounded text-[#262220]">/loʊ/</code> vowel &rarr; baseline) and extracts
          mathematical features (RMS, MAV, ZCR, Peak-to-Peak). It operates strictly in demo mode and does not claim to represent
          physiological muscle telemetry from your body.
        </div>
      </div>

      {/* ── Active Calibration Progress Bar & Stage Status ── */}
      <div className="p-3.5 rounded-sm bg-[#FBF9F5] border border-[#E5E0D8] space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-[#262220] flex items-center gap-1.5">
            <Activity size={13} className={isRunning ? 'text-[#41634F] animate-pulse' : 'text-[#8C827A]'} />
            <span className="uppercase">{demoCalibration.stageText}</span>
          </span>
          <span className="font-bold text-[#41634F]">{demoCalibration.progress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-[#E5E0D8] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#41634F] transition-all duration-300 rounded-full"
            style={{ width: `${demoCalibration.progress}%` }}
          />
        </div>

        {/* 5-Trial Indicators */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {[1, 2, 3, 4, 5].map((trialNum) => {
            const isCompleted = demoCalibration.currentTrial > trialNum || demoCalibration.isCalibrated
            const isCurrent = demoCalibration.currentTrial === trialNum && isRunning
            return (
              <div
                key={trialNum}
                className={`py-1 px-1.5 rounded text-center font-mono text-[10px] font-bold border transition-all ${
                  isCompleted
                    ? 'bg-[#E8EFEA] text-[#2B382D] border-[#41634F]/40'
                    : isCurrent
                    ? 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B] shadow-xs ring-1 ring-[#F59E0B]/30'
                    : 'bg-[#FFFFFF] text-[#A8A29E] border-[#E5E0D8]'
                }`}
              >
                TRIAL {trialNum}/5
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Countdown / Interactive Prompt Callout (Fixed Min Height for Zero Shift) ── */}
      <div className="min-h-[58px] flex items-center justify-center rounded-sm border border-[#E5E0D8] bg-[#FAF8F5] p-3 text-center">
        {demoCalibration.countdown !== null ? (
          <div className="flex items-center gap-2 font-mono text-sm font-bold text-[#92400E]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-ping" />
            <span>Calibration countdown starting in: {demoCalibration.countdown}s</span>
          </div>
        ) : demoCalibration.status === 'WAITING_FOR_TRIGGER' ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs font-mono font-bold text-[#262220]">
              Prompt: &ldquo;Say HELLO now&rdquo;
            </span>
            <button
              type="button"
              onClick={triggerHelloAction}
              className="px-3 py-1 rounded text-xs font-mono font-bold bg-[#41634F] text-[#FFFFFF] hover:bg-[#324f3e] transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 animate-pulse"
            >
              <Sparkles size={12} />
              <span>SIMULATE &ldquo;HELLO&rdquo;</span>
            </button>
          </div>
        ) : demoCalibration.isCalibrated ? (
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#2B382D]">
            <CheckCircle2 size={14} className="text-[#41634F]" />
            <span>
              MODEL CALIBRATED FOR &ldquo;HELLO&rdquo; (Similarity: {demoCalibration.validationSimilarity}%)
            </span>
          </div>
        ) : (
          <div className="text-xs font-mono text-[#8C827A]">
            Ready to initialize 5-trial calibration pattern for &ldquo;HELLO&rdquo;.
          </div>
        )}
      </div>

      {/* ── Feature Extraction Readouts (Computed in real time from buffer) ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono font-bold text-[#5C554E] uppercase tracking-wider">
            Mathematical Features (Real-Time Sample Buffer)
          </span>
          <span className="text-[10px] font-mono text-[#8C827A]">1000 Hz &bull; 600 Samples</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 font-mono text-xs">
          <div className="p-2 rounded bg-[#FBF9F5] border border-[#E5E0D8] h-[52px] flex flex-col justify-between">
            <span className="text-[9px] text-[#8C827A] uppercase tracking-wider">RMS</span>
            <span className="font-semibold text-[#262220] truncate">
              {currentFeatures.rms > 0 ? `${currentFeatures.rms.toFixed(3)} mV` : '—'}
            </span>
          </div>

          <div className="p-2 rounded bg-[#FBF9F5] border border-[#E5E0D8] h-[52px] flex flex-col justify-between">
            <span className="text-[9px] text-[#8C827A] uppercase tracking-wider">MAV</span>
            <span className="font-semibold text-[#262220] truncate">
              {currentFeatures.mav > 0 ? `${currentFeatures.mav.toFixed(3)} mV` : '—'}
            </span>
          </div>

          <div className="p-2 rounded bg-[#FBF9F5] border border-[#E5E0D8] h-[52px] flex flex-col justify-between">
            <span className="text-[9px] text-[#8C827A] uppercase tracking-wider">ZCR</span>
            <span className="font-semibold text-[#262220] truncate">
              {currentFeatures.zcr > 0 ? `${currentFeatures.zcr} crossings` : '—'}
            </span>
          </div>

          <div className="p-2 rounded bg-[#FBF9F5] border border-[#E5E0D8] h-[52px] flex flex-col justify-between">
            <span className="text-[9px] text-[#8C827A] uppercase tracking-wider">Peak-to-Peak</span>
            <span className="font-semibold text-[#262220] truncate">
              {currentFeatures.peakToPeak > 0 ? `${currentFeatures.peakToPeak.toFixed(3)} mV` : '—'}
            </span>
          </div>

          <div className="p-2 rounded bg-[#FBF9F5] border border-[#E5E0D8] h-[52px] flex flex-col justify-between">
            <span className="text-[9px] text-[#8C827A] uppercase tracking-wider">Waveform Len</span>
            <span className="font-semibold text-[#262220] truncate">
              {currentFeatures.waveformLength > 0 ? `${currentFeatures.waveformLength.toFixed(2)}` : '—'}
            </span>
          </div>

          <div className="p-2 rounded bg-[#FBF9F5] border border-[#E5E0D8] h-[52px] flex flex-col justify-between">
            <span className="text-[9px] text-[#8C827A] uppercase tracking-wider">Energy</span>
            <span className="font-semibold text-[#262220] truncate">
              {currentFeatures.energy > 0 ? `${currentFeatures.energy.toFixed(1)}` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Active Template Verification Details (If Calibrated) ── */}
      {demoCalibration.isCalibrated && demoCalibration.activeTemplate && (
        <div className="p-3 rounded-sm bg-[#E8EFEA]/60 border border-[#41634F]/30 text-xs font-mono space-y-1.5">
          <div className="flex items-center justify-between text-[#2B382D]">
            <span className="font-bold flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-[#41634F]" />
              ACTIVE MODEL TEMPLATE: &ldquo;{demoCalibration.activeTemplate.command}&rdquo;
            </span>
            <span className="text-[11px] text-[#41634F] font-semibold">
              Verified ({demoCalibration.activeTemplate.numTrials} trials aggregated)
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-[#41634F]">
            <div>Mean RMS: {demoCalibration.activeTemplate.meanFeatures.rms.toFixed(3)} mV</div>
            <div>Mean MAV: {demoCalibration.activeTemplate.meanFeatures.mav.toFixed(3)} mV</div>
            <div>Mean ZCR: {demoCalibration.activeTemplate.meanFeatures.zcr} crossings</div>
            <div>Baseline Noise: {demoCalibration.activeTemplate.baselineNoiseRms} mV</div>
          </div>
        </div>
      )}

      {/* ── Real-Time Calibration Event Log ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-[#5C554E] uppercase tracking-wider flex items-center gap-1.5">
            <Terminal size={12} className="text-[#8C827A]" />
            Calibration System Log
          </span>
          <span className="text-[10px] font-mono text-[#8C827A]">
            {demoCalibration.logs.length} entries
          </span>
        </div>

        <div className="h-28 overflow-y-auto rounded-sm border border-[#E5E0D8] bg-[#FAF8F5] p-2 font-mono text-[11px] space-y-1 select-text">
          {demoCalibration.logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 leading-tight">
              <span className="text-[#8C827A] shrink-0">[{log.time}]</span>
              <span
                className={
                  log.type === 'success'
                    ? 'text-[#2B382D] font-medium'
                    : log.type === 'stage'
                    ? 'text-[#0369A1] font-medium'
                    : log.type === 'warn'
                    ? 'text-[#92400E] font-medium'
                    : 'text-[#5C554E]'
                }
              >
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Action Toolbar (START CALIBRATION, TEST "HELLO", RESET) ── */}
      <div className="pt-3 border-t border-[#E5E0D8]/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleStart}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-sm text-xs font-mono font-bold tracking-wider uppercase transition-all select-none ${
              isRunning
                ? 'bg-[#E5E0D8] text-[#8C827A] cursor-not-allowed'
                : 'bg-[#2B382D] text-[#FFFFFF] hover:bg-[#38493B] shadow-xs cursor-pointer'
            }`}
          >
            <Play size={12} />
            <span>{isRunning ? 'CALIBRATING...' : 'START CALIBRATION'}</span>
          </button>

          <button
            type="button"
            onClick={handleTestInference}
            disabled={!demoCalibration.isCalibrated || isTestingInference || isRunning}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-sm text-xs font-mono font-bold tracking-wider uppercase border transition-all select-none ${
              demoCalibration.isCalibrated && !isTestingInference && !isRunning
                ? 'bg-[#FFFFFF] border-[#41634F] text-[#41634F] hover:bg-[#E8EFEA] cursor-pointer'
                : 'bg-[#F9F6F0] border-[#E5E0D8] text-[#A8A29E] cursor-not-allowed'
            }`}
            title="Run simulated inference against calibrated HELLO template"
          >
            <Sparkles size={12} />
            <span>{isTestingInference ? 'TESTING...' : 'TEST "HELLO"'}</span>
          </button>

          <button
            type="button"
            onClick={resetDemoCalibration}
            disabled={demoCalibration.status === 'IDLE' && !demoCalibration.isCalibrated}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-mono font-semibold tracking-wider uppercase border transition-all select-none ${
              demoCalibration.status !== 'IDLE' || demoCalibration.isCalibrated
                ? 'bg-[#FFFFFF] border-[#E5E0D8] text-[#5C554E] hover:text-[#262220] hover:bg-[#F5F2EB] cursor-pointer'
                : 'bg-[#F9F6F0] border-[#E5E0D8] text-[#A8A29E] cursor-not-allowed opacity-50'
            }`}
            title="Clear calibration template and reset engine"
          >
            <RotateCcw size={12} />
            <span>RESET</span>
          </button>
        </div>

        {inferenceFeedback && (
          <span className="text-[11px] font-mono text-[#41634F] font-semibold">
            {inferenceFeedback}
          </span>
        )}
      </div>
    </div>
  )
}
