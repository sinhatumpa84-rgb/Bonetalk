import React from 'react'
import { Volume2, CheckCircle2, XCircle } from 'lucide-react'
import { speechService } from '../../lib/speechService'

interface LiveSpeechOutputCardProps {
  targetPhrase?: string
  recognizedPhrase: string | null
  confidence: number | null
  isDemoSimulation: boolean
}

export const LiveSpeechOutputCard: React.FC<LiveSpeechOutputCardProps> = ({
  targetPhrase,
  recognizedPhrase,
  confidence,
  isDemoSimulation,
}) => {
  const hasOutput = !!recognizedPhrase && recognizedPhrase !== 'UNSUPPORTED PHRASE'
  const isMatch =
    hasOutput && targetPhrase
      ? recognizedPhrase.trim().toUpperCase() === targetPhrase.trim().toUpperCase()
      : null

  const handleSpeak = () => {
    if (!recognizedPhrase) return
    speechService.speak(recognizedPhrase)
  }

  return (
    <div className="bg-[#FFFFFF] border-2 border-[#41634F]/40 rounded-sm p-4 sm:p-5 shadow-xs flex flex-col justify-between select-none">
      {/* ── Card Header ── */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]/60">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#41634F] animate-ping" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
            LIVE GESTURE OUTPUT
          </h3>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px]">
          {isDemoSimulation ? (
            <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30 font-bold">
              SIMULATION ENGINE
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-[#E8EFEA] text-[#2B382D] border border-[#41634F]/30 font-bold">
              GESTURE ENGINE READY
            </span>
          )}
        </div>
      </div>

      {/* ── Main Recognized Gesture Display (Fixed Height for Zero Shift) ── */}
      <div className="p-5 my-3 rounded-sm border border-[#E5E0D8] bg-[#FAF8F5] text-center min-h-[130px] flex flex-col items-center justify-center">
        {hasOutput ? (
          <div className="space-y-1.5 w-full">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C827A] block">
              DECODED GESTURE PATTERN
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-[#262220] uppercase truncate max-w-full">
              {recognizedPhrase}
            </h2>
            <div className="flex items-center justify-center gap-4 text-xs font-mono pt-1">
              <span className="text-[#41634F] font-semibold">
                Confidence: {confidence !== null ? `${(confidence * 100).toFixed(1)}%` : '—'}
              </span>
              {isMatch !== null && (
                <span
                  className={`font-bold flex items-center gap-1 ${
                    isMatch ? 'text-[#2B382D]' : 'text-[#991B1B]'
                  }`}
                >
                  {isMatch ? (
                    <>
                      <CheckCircle2 size={13} className="text-[#41634F]" />
                      <span>MATCH: YES</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={13} className="text-[#991B1B]" />
                      <span>MATCH: NO</span>
                    </>
                  )}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <span className="text-sm font-mono text-[#8C827A] block font-semibold">
              Waiting for gesture pattern...
            </span>
            <span className="text-[11px] font-mono text-[#A8A29E] block max-w-sm mx-auto">
              Calibrated gesture output will appear here once matched by the model.
            </span>
          </div>
        )}
      </div>

      {/* ── Comparison Details Grid (Target vs Recognized) ── */}
      {targetPhrase && (
        <div className="grid grid-cols-3 gap-2 pb-3 mb-2 border-b border-[#E5E0D8]/60 text-center font-mono text-xs">
          <div className="p-1.5 rounded bg-[#FAF8F5] border border-[#E5E0D8]">
            <span className="text-[9px] text-[#8C827A] uppercase block">TARGET GESTURE</span>
            <span className="font-bold text-[#262220] uppercase truncate block">
              {targetPhrase}
            </span>
          </div>
          <div className="p-1.5 rounded bg-[#FAF8F5] border border-[#E5E0D8]">
            <span className="text-[9px] text-[#8C827A] uppercase block">DETECTED</span>
            <span className="font-bold text-[#41634F] uppercase truncate block">
              {recognizedPhrase || '—'}
            </span>
          </div>
          <div className="p-1.5 rounded bg-[#FAF8F5] border border-[#E5E0D8]">
            <span className="text-[9px] text-[#8C827A] uppercase block">MATCH</span>
            <span
              className={`font-bold uppercase truncate block ${
                isMatch === true
                  ? 'text-[#2B382D]'
                  : isMatch === false
                  ? 'text-[#991B1B]'
                  : 'text-[#8C827A]'
              }`}
            >
              {isMatch === true ? 'YES' : isMatch === false ? 'NO' : 'PENDING'}
            </span>
          </div>
        </div>
      )}

      {/* ── Source Label & Audio Speak Action ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 font-mono text-xs">
        <div className="text-[11px] text-[#5C554E]">
          <span className="text-[#8C827A]">Source: </span>
          <span className="font-semibold text-[#262220]">Calibrated Muscle &amp; Gesture Signals</span>
        </div>

        <button
          type="button"
          onClick={handleSpeak}
          disabled={!hasOutput}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-mono font-bold tracking-wider uppercase transition-all select-none ${
            hasOutput
              ? 'bg-[#2B382D] text-[#FFFFFF] hover:bg-[#38493B] shadow-xs cursor-pointer'
              : 'bg-[#E5E0D8] text-[#8C827A] cursor-not-allowed opacity-60'
          }`}
          title="Synthesize recognized gesture pattern as audible speech"
        >
          <Volume2 size={14} />
          <span>SPEAK GESTURE</span>
        </button>
      </div>
    </div>
  )
}

export default LiveSpeechOutputCard
