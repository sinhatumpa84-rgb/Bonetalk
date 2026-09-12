import React from 'react'
import { Sparkles, Volume2, XCircle } from 'lucide-react'
import { useModelControl } from '../../context/ModelControlContext'

export const PredictionPanel: React.FC = () => {
  const {
    latestPrediction,
    detectedMessage,
    speakDetectedMessage,
    clearDetectedMessage,
    modelStatus,
  } = useModelControl()

  const hasPrediction = !!latestPrediction.command

  const formatConfidence = (val: number | null) => {
    if (val === null || val === undefined) return '—'
    return `${(val * 100).toFixed(1)}%`
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E0D8]/60">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-[#41634F]" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
            BoneTalk Prediction &amp; Neural Voice
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#8C827A]">Real-time Pattern Classification</span>
      </div>

      {/* ── Main Command Display Box ── */}
      <div className="p-6 rounded-sm border border-[#E5E0D8] bg-[#FAF8F5] text-center mb-4">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C827A] block mb-1">
          Predicted Silent Speech Command
        </span>

        {hasPrediction ? (
          <div className="my-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-[#262220] uppercase">
              {latestPrediction.command}
            </h2>
            {latestPrediction.timestamp && (
              <span className="text-[10px] font-mono text-[#8C827A] block mt-1">
                Detected at {latestPrediction.timestamp}
              </span>
            )}
          </div>
        ) : (
          <div className="py-4">
            <p className="text-sm font-mono text-[#8C827A] tracking-wide">Waiting for signal...</p>
            <span className="text-[11px] font-mono text-[#A8A29E] mt-1 block">
              Inference fires when pattern activation is classified by model.
            </span>
          </div>
        )}

        {/* ── Controls: SPEAK and CLEAR ── */}
        <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-[#E5E0D8]/60">
          <button
            type="button"
            onClick={speakDetectedMessage}
            disabled={!detectedMessage}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-mono tracking-wider font-semibold transition-all ${
              detectedMessage
                ? 'bg-[#2B382D] text-[#FFFFFF] hover:bg-[#38493B] shadow-xs cursor-pointer'
                : 'bg-[#E5E0D8] text-[#8C827A] cursor-not-allowed opacity-60'
            }`}
            title="Synthesize speech through audio device"
          >
            <Volume2 size={14} />
            <span>SPEAK</span>
          </button>

          <button
            type="button"
            onClick={clearDetectedMessage}
            disabled={!detectedMessage}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-mono tracking-wider border transition-all ${
              detectedMessage
                ? 'bg-[#FFFFFF] border-[#E5E0D8] text-[#5C554E] hover:text-[#262220] hover:bg-[#F5F2EB] cursor-pointer'
                : 'border-[#E5E0D8] text-[#A8A29E] cursor-not-allowed opacity-60'
            }`}
            title="Clear current detected message"
          >
            <XCircle size={14} />
            <span>CLEAR</span>
          </button>
        </div>
      </div>

      {/* ── Telemetry Stats Grid: Confidence, Signal Quality, Model Status ── */}
      <div className="grid grid-cols-3 gap-2.5 font-mono text-xs">
        <div className="p-2.5 rounded-sm bg-[#FBF9F5] border border-[#E5E0D8]">
          <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">
            Confidence
          </span>
          <span className="font-semibold text-[#262220] text-sm block mt-0.5">
            {formatConfidence(latestPrediction.confidence)}
          </span>
        </div>

        <div className="p-2.5 rounded-sm bg-[#FBF9F5] border border-[#E5E0D8]">
          <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">
            Signal Quality
          </span>
          <span className="font-semibold text-[#262220] text-sm block mt-0.5">
            {latestPrediction.signalQuality || '—'}
          </span>
        </div>

        <div className="p-2.5 rounded-sm bg-[#FBF9F5] border border-[#E5E0D8]">
          <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">
            Model Status
          </span>
          <span
            className={`font-semibold text-sm block mt-0.5 ${
              modelStatus === 'Ready' ? 'text-[#2B382D]' : 'text-[#8C827A]'
            }`}
          >
            {modelStatus}
          </span>
        </div>
      </div>
    </div>
  )
}
