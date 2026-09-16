import React from 'react'
import { Eye, MessageSquare, Radio, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react'

export type TrainingStep = 1 | 2 | 3 | 4 | 5 | 6 | 0

interface TrainingFlowStepCardProps {
  currentStep: TrainingStep
  targetPhrase: string
  recognizedPhrase: string | null
  confidence: number | null
  trialNumber: number
  totalTrials: number
  isCalibrating: boolean
}

export const TrainingFlowStepCard: React.FC<TrainingFlowStepCardProps> = ({
  currentStep,
  targetPhrase,
  recognizedPhrase,
  confidence,
  trialNumber,
  totalTrials,
  isCalibrating,
}) => {
  const steps = [
    {
      num: 1,
      name: 'PREPARE',
      desc: 'Position yourself comfortably and prepare the gesture.',
      icon: Eye,
    },
    {
      num: 2,
      name: 'SELECT GESTURE',
      desc: `Target: "${targetPhrase}"`,
      icon: MessageSquare,
    },
    {
      num: 3,
      name: 'CAPTURE',
      desc: 'Recording Muscle 1 / Muscle 2 / Muscle 3',
      icon: Radio,
    },
    {
      num: 4,
      name: 'ANALYZE',
      desc: 'Analyzing muscle activity pattern...',
      icon: Sparkles,
    },
    {
      num: 5,
      name: 'PATTERN RECOGNITION',
      desc: recognizedPhrase ? `Detected: "${recognizedPhrase}"` : 'Comparing captured gesture pattern...',
      icon: CheckCircle2,
    },
    {
      num: 6,
      name: 'CALIBRATION RESULT',
      desc: confidence !== null ? `Confidence: ${(confidence * 100).toFixed(1)}%` : 'Gesture pattern calibration complete.',
      icon: ShieldCheck,
    },
  ]

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 shadow-xs select-none">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-[#E5E0D8]/60">
        <div>
          <h4 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
            Training Session Flow
          </h4>
          <p className="text-[10px] font-mono text-[#8C827A]">
            6-Step Muscle Activity &amp; Gesture Pattern Calibration Sequence
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {isCalibrating ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30 font-extrabold text-[10px] animate-pulse">
                TRAINING ACTIVE
              </span>
              <span className="px-2 py-0.5 rounded bg-[#E8EFEA] text-[#2B382D] border border-[#41634F]/30 font-bold text-[10px]">
                TARGET GESTURE: {targetPhrase || '—'}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#FAF8F5] text-[#41634F] border border-[#E5E0D8] font-bold text-[10px]">
                MUSCLE 1/2/3: RECORDING
              </span>
              <span className="px-2 py-0.5 rounded bg-[#FAF8F5] text-[#0284C7] border border-[#E5E0D8] font-bold text-[10px]">
                PATTERN CAPTURE: ACTIVE
              </span>
              <span className="font-bold text-[#41634F] text-[11px] ml-1">
                TRIAL {trialNumber} OF {totalTrials}
              </span>
            </div>
          ) : (
            <span className="font-bold text-[#8C827A]">SESSION IDLE</span>
          )}
        </div>
      </div>

      {/* ── 6-Step Horizontal Progress Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {steps.map((s) => {
          const Icon = s.icon
          const isActive = currentStep === s.num
          const isDone = currentStep > s.num || (!isCalibrating && currentStep === 6)

          return (
            <div
              key={s.num}
              className={`p-2.5 rounded-sm border transition-all flex flex-col justify-between min-h-[90px] ${
                isActive
                  ? 'bg-[#FEF3C7] border-[#F59E0B] shadow-xs ring-1 ring-[#F59E0B]'
                  : isDone
                  ? 'bg-[#E8EFEA] border-[#41634F]/40'
                  : 'bg-[#FAF8F5] border-[#E5E0D8] opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-mono font-extrabold uppercase text-[#8C827A]">
                  STEP {s.num}
                </span>
                <Icon
                  size={14}
                  className={
                    isActive
                      ? 'text-[#B45309] animate-pulse'
                      : isDone
                      ? 'text-[#41634F]'
                      : 'text-[#8C827A]'
                  }
                />
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold text-[#262220] block leading-tight uppercase">
                  {s.name}
                </span>
                <p className="text-[9px] font-mono text-[#5C554E] mt-0.5 leading-snug line-clamp-2">
                  {s.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TrainingFlowStepCard
