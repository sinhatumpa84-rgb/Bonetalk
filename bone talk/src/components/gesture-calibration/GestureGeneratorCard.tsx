import React, { useState } from 'react'
import { Zap, Play, CheckCircle2, RefreshCw, Volume2, Cpu } from 'lucide-react'
import { speechService } from '../../lib/speechService'

interface GestureGeneratorCardProps {
  targetGesture: string
  onGenerateGesture?: (gesture: string) => void
}

export const GestureGeneratorCard: React.FC<GestureGeneratorCardProps> = ({
  targetGesture,
  onGenerateGesture,
}) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedGesture, setGeneratedGesture] = useState<string | null>(null)
  const [generatedStatus, setGeneratedStatus] = useState<'IDLE' | 'GENERATING' | 'READY'>('IDLE')

  const handleGenerate = async () => {
    const gesture = targetGesture.trim().toUpperCase() || 'HELLO'
    setIsGenerating(true)
    setGeneratedStatus('GENERATING')
    
    // Simulate instantaneous neural synthesis of calibrated muscle vectors
    await new Promise((resolve) => setTimeout(resolve, 600))
    
    setGeneratedGesture(gesture)
    setGeneratedStatus('READY')
    setIsGenerating(false)

    if (onGenerateGesture) {
      onGenerateGesture(gesture)
    }
  }

  const handleSpeak = () => {
    if (!generatedGesture) return
    speechService.speak(generatedGesture)
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 shadow-xs flex flex-col justify-between gap-3 select-none">
      {/* ── Header ── */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E0D8]/60">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-[#41634F]" />
          <h4 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
            GESTURE GENERATOR
          </h4>
        </div>

        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase flex items-center gap-1 ${
            generatedStatus === 'READY'
              ? 'bg-[#E8EFEA] text-[#2B382D] border-[#41634F]/30'
              : generatedStatus === 'GENERATING'
              ? 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/40 animate-pulse'
              : 'bg-[#FAF8F5] text-[#8C827A] border-[#E5E0D8]'
          }`}
        >
          {isGenerating ? <RefreshCw size={10} className="animate-spin" /> : <Cpu size={10} />}
          <span>{generatedStatus === 'READY' ? 'READY FOR MODEL INPUT' : generatedStatus}</span>
        </span>
      </div>

      {/* ── Pattern Parameters Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
        <div className="p-2 rounded bg-[#FAF8F5] border border-[#E5E0D8] flex flex-col justify-between h-[56px]">
          <span className="text-[9px] text-[#8C827A] uppercase">TARGET GESTURE</span>
          <span className="font-extrabold text-[#262220] text-sm truncate">
            {targetGesture || 'HELLO'}
          </span>
        </div>

        <div className="p-2 rounded bg-[#FAF8F5] border border-[#E5E0D8] flex flex-col justify-between h-[56px]">
          <span className="text-[9px] text-[#8C827A] uppercase">MUSCLE PATTERN</span>
          <span className="font-bold text-[#41634F] text-xs truncate">
            M1 + M2 + M3
          </span>
        </div>

        <div className="p-2 rounded bg-[#FAF8F5] border border-[#E5E0D8] flex flex-col justify-between h-[56px]">
          <span className="text-[9px] text-[#8C827A] uppercase">PATTERN STATUS</span>
          <span className="font-bold text-[#2B382D] flex items-center gap-1 text-xs">
            <CheckCircle2 size={12} className="text-[#41634F]" />
            <span>READY</span>
          </span>
        </div>
      </div>

      {/* ── Main Generated Gesture Output (Fixed Height) ── */}
      <div className="p-3.5 rounded bg-[#FBF9F5] border border-[#E5E0D8] text-center min-h-[85px] flex flex-col items-center justify-center">
        {generatedGesture ? (
          <div className="space-y-1 w-full">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#8C827A] block">
              GENERATED GESTURE
            </span>
            <span className="text-2xl font-extrabold font-mono text-[#41634F] uppercase tracking-wide block truncate">
              {generatedGesture}
            </span>
            <span className="text-[10px] font-mono text-[#2B382D] font-bold block">
              STATUS: READY FOR MODEL INPUT
            </span>
          </div>
        ) : (
          <div className="space-y-1">
            <span className="text-xs font-mono text-[#8C827A] block">
              Click &quot;GENERATE GESTURE&quot; to synthesize muscle pattern
            </span>
            <span className="text-[10px] font-mono text-[#A8A29E] block">
              Directly generates calibrated multi-channel waveform vector
            </span>
          </div>
        )}
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-mono text-xs">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-mono font-bold tracking-wider uppercase transition-all select-none cursor-pointer ${
            isGenerating
              ? 'bg-[#E5E0D8] text-[#8C827A] cursor-not-allowed'
              : 'bg-[#2B382D] text-[#FFFFFF] hover:bg-[#38493B] shadow-xs'
          }`}
        >
          {isGenerating ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
          <span>GENERATE GESTURE</span>
        </button>

        {generatedGesture && (
          <button
            type="button"
            onClick={handleSpeak}
            className="flex items-center gap-1 px-3 py-2 rounded-sm text-xs font-mono font-bold border border-[#E5E0D8] bg-[#FAF8F5] text-[#262220] hover:bg-[#F2EFE9] transition-all cursor-pointer"
            title="Play audible output for generated gesture"
          >
            <Volume2 size={13} />
            <span>PLAY OUTPUT</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default GestureGeneratorCard
