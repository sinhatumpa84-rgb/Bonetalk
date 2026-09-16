import React from 'react'
import { Sparkles, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import type { VsrPredictionResult } from '../../services/visualSpeechService'

interface VisualSpeechStatusCardProps {
  targetPhrase: string
  currentStatus: 'WAITING' | 'CAPTURING' | 'ANALYZING' | 'RECOGNIZED' | 'UNCERTAIN' | 'ERROR'
  latestResult: VsrPredictionResult | null
  isProcessing: boolean
}

export const VisualSpeechStatusCard: React.FC<VisualSpeechStatusCardProps> = ({
  targetPhrase,
  currentStatus,
  latestResult,
  isProcessing,
}) => {
  const isMatch = latestResult?.isMatch ?? null
  const confidence = latestResult?.confidence ?? null

  const getStatusBadge = () => {
    switch (currentStatus) {
      case 'RECOGNIZED':
        return 'bg-[#E8EFEA] text-[#2B382D] border-[#41634F]/30'
      case 'ANALYZING':
      case 'CAPTURING':
        return 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/40 animate-pulse'
      case 'UNCERTAIN':
      case 'ERROR':
        return 'bg-[#FEE2E2] text-[#991B1B] border-[#EF4444]/40'
      case 'WAITING':
      default:
        return 'bg-[#FAF8F5] text-[#8C827A] border-[#E5E0D8]'
    }
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 shadow-xs flex flex-col justify-between gap-3">
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E0D8]/60">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[#41634F]" />
          <h4 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
            GESTURE PATTERN ANALYSIS
          </h4>
        </div>

        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase flex items-center gap-1 ${getStatusBadge()}`}>
          {isProcessing && <RefreshCw size={10} className="animate-spin" />}
          <span>{currentStatus}</span>
        </span>
      </div>

      {/* ── Primary Recognition Comparison Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
        {/* Box 1: TARGET GESTURE */}
        <div className="p-3 rounded bg-[#FAF8F5] border border-[#E5E0D8] h-[78px] flex flex-col justify-between">
          <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">
            TARGET GESTURE
          </span>
          <span className="text-xl font-extrabold text-[#262220] tracking-tight truncate block">
            {targetPhrase || '—'}
          </span>
          <span className="text-[9px] text-[#8C827A] block truncate">
            Calibrated gesture pattern
          </span>
        </div>

        {/* Box 2: DETECTED PATTERN */}
        <div className="p-3 rounded bg-[#FBF9F5] border border-[#E5E0D8] h-[78px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">
              DETECTED PATTERN
            </span>
            {latestResult?.isDemoSimulation && (
              <span className="text-[9px] font-bold px-1 rounded bg-[#FEF3C7] text-[#92400E]">
                SIMULATION
              </span>
            )}
          </div>
          <span className="text-xl font-extrabold text-[#41634F] tracking-tight truncate block">
            {latestResult?.recognizedPhrase
              ? latestResult.recognizedPhrase
              : currentStatus === 'UNCERTAIN'
              ? 'PATTERN UNCERTAIN'
              : isProcessing
              ? 'ANALYZING PATTERN...'
              : 'AWAITING GESTURE'}
          </span>
          <span className="text-[9px] text-[#8C827A] block truncate">
            Real-time pattern recognition
          </span>
        </div>
      </div>

      {/* ── Telemetry Metrics: Confidence, Match Result, Model Pathway ── */}
      <div className="grid grid-cols-3 gap-2 font-mono text-xs pt-1">
        <div className="p-2 rounded bg-[#FAF8F5] border border-[#E5E0D8] h-[50px] flex flex-col justify-between">
          <span className="text-[9px] text-[#8C827A] uppercase tracking-wider">PATTERN CONFIDENCE</span>
          <span className="font-bold text-[#262220] text-sm">
            {confidence !== null ? `${(confidence * 100).toFixed(1)}%` : '—'}
          </span>
        </div>

        <div className="p-2 rounded bg-[#FAF8F5] border border-[#E5E0D8] h-[50px] flex flex-col justify-between">
          <span className="text-[9px] text-[#8C827A] uppercase tracking-wider">TARGET MATCH</span>
          <div className="flex items-center gap-1 font-bold text-sm">
            {isMatch === true ? (
              <>
                <CheckCircle2 size={13} className="text-[#41634F]" />
                <span className="text-[#2B382D]">MATCH</span>
              </>
            ) : isMatch === false ? (
              <>
                <XCircle size={13} className="text-[#991B1B]" />
                <span className="text-[#991B1B]">MISMATCH</span>
              </>
            ) : (
              <span className="text-[#8C827A]">PENDING</span>
            )}
          </div>
        </div>

        <div className="p-2 rounded bg-[#FAF8F5] border border-[#E5E0D8] h-[50px] flex flex-col justify-between">
          <span className="text-[9px] text-[#8C827A] uppercase tracking-wider">INFERENCE MODEL</span>
          <span className="font-bold text-[#262220] truncate text-[11px]">
            Gesture Model
          </span>
        </div>
      </div>

      {/* Technical notice message if uncertain */}
      {latestResult && !latestResult.isMatch && (
        <div className="p-2 rounded bg-[#FEF3C7]/60 border border-[#F59E0B]/30 text-[11px] font-mono text-[#92400E] flex items-start gap-1.5">
          <AlertTriangle size={13} className="shrink-0 mt-0.5" />
          <span>{latestResult.message}</span>
        </div>
      )}
    </div>
  )
}
