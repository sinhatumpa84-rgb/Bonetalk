import React from 'react'
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import type { SynchronizedDataPoint } from '../../services/gestureCalibrationSync'

interface SynchronizedTimelineViewerProps {
  timeline: SynchronizedDataPoint[]
  durationMs: number
  syncStatus: 'VALID' | 'DRIFT_DETECTED' | 'UNSYNCHRONIZED'
}

export const SynchronizedTimelineViewer: React.FC<SynchronizedTimelineViewerProps> = ({
  timeline,
  durationMs,
  syncStatus,
}) => {
  const hasData = timeline && timeline.length > 0

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 shadow-xs space-y-3 select-none">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#E5E0D8]/60">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-[#41634F]" />
          <div>
            <h4 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
              GESTURE TIMELINE
            </h4>
            <p className="text-[10px] font-mono text-[#8C827A]">
              Timestamp-Aligned Gesture Dynamics &bull; 3 Muscle Channels
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] font-bold">
          <span
            className={`px-2 py-0.5 rounded border uppercase flex items-center gap-1 ${
              syncStatus === 'VALID'
                ? 'bg-[#E8EFEA] text-[#2B382D] border-[#41634F]/30'
                : syncStatus === 'DRIFT_DETECTED'
                ? 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/40'
                : 'bg-[#FAF8F5] text-[#8C827A] border-[#E5E0D8]'
            }`}
          >
            {syncStatus === 'VALID' ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
            <span>SYNC: {syncStatus}</span>
          </span>

          <span className="px-2 py-0.5 rounded bg-[#FAF8F5] text-[#5C554E] border border-[#E5E0D8]">
            {durationMs > 0 ? `${(durationMs / 1000).toFixed(2)}s Duration` : '0.00s'}
          </span>
        </div>
      </div>

      {/* ── 4 Parallel Tracks ── */}
      <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-sm p-3 space-y-2.5 font-mono text-xs">
        {/* Track 1: Gesture Kinematics */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#5C554E]">
            <span className="font-bold uppercase tracking-wider">Track 1: Gesture Kinematics</span>
            <span className="text-[#8C827A]">{hasData ? `${timeline.length} Samples (~30 FPS)` : 'No samples'}</span>
          </div>
          <div className="h-4 bg-[#FFFFFF] border border-[#E5E0D8] rounded-xs relative flex items-center px-1 overflow-hidden">
            {hasData ? (
              <div className="w-full flex items-center justify-between">
                {timeline.filter((_, i) => i % 2 === 0).map((pt, idx) => (
                  <div
                    key={idx}
                    className="w-1 rounded-full bg-[#0284C7]"
                    style={{ height: `${Math.min(14, Math.max(3, pt.lipOpenness * 35))}px` }}
                    title={`t=${pt.timestampMs}ms, amplitude=${pt.lipOpenness}`}
                  />
                ))}
              </div>
            ) : (
              <span className="text-[9px] text-[#A8A29E] italic">Waiting for gesture sequence...</span>
            )}
          </div>
        </div>

        {/* Track 2: Muscle 1 */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#5C554E]">
            <span className="font-bold uppercase tracking-wider">Track 2: Muscle 1 (CH-1)</span>
            <span className="text-[#8C827A]">EMG CH-1</span>
          </div>
          <div className="h-4 bg-[#FFFFFF] border border-[#E5E0D8] rounded-xs relative flex items-center px-1 overflow-hidden">
            {hasData ? (
              <div className="w-full flex items-center justify-between">
                {timeline.filter((_, i) => i % 2 === 0).map((pt, idx) => (
                  <div
                    key={idx}
                    className="w-1 rounded-full bg-[#41634F]"
                    style={{ height: `${Math.min(14, Math.max(2, Math.abs(pt.muscle1) * 25))}px` }}
                    title={`t=${pt.timestampMs}ms, m1=${pt.muscle1}mV`}
                  />
                ))}
              </div>
            ) : (
              <span className="text-[9px] text-[#A8A29E] italic">Waiting for EMG 1 samples...</span>
            )}
          </div>
        </div>

        {/* Track 3: Muscle 2 */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#5C554E]">
            <span className="font-bold uppercase tracking-wider">Track 3: Muscle 2 (CH-2)</span>
            <span className="text-[#8C827A]">EMG CH-2</span>
          </div>
          <div className="h-4 bg-[#FFFFFF] border border-[#E5E0D8] rounded-xs relative flex items-center px-1 overflow-hidden">
            {hasData ? (
              <div className="w-full flex items-center justify-between">
                {timeline.filter((_, i) => i % 2 === 0).map((pt, idx) => (
                  <div
                    key={idx}
                    className="w-1 rounded-full bg-[#41634F]"
                    style={{ height: `${Math.min(14, Math.max(2, Math.abs(pt.muscle2) * 25))}px` }}
                    title={`t=${pt.timestampMs}ms, m2=${pt.muscle2}mV`}
                  />
                ))}
              </div>
            ) : (
              <span className="text-[9px] text-[#A8A29E] italic">Waiting for EMG 2 samples...</span>
            )}
          </div>
        </div>

        {/* Track 4: Muscle 3 */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#5C554E]">
            <span className="font-bold uppercase tracking-wider">Track 4: Muscle 3 (CH-3)</span>
            <span className="text-[#8C827A]">EMG CH-3</span>
          </div>
          <div className="h-4 bg-[#FFFFFF] border border-[#E5E0D8] rounded-xs relative flex items-center px-1 overflow-hidden">
            {hasData ? (
              <div className="w-full flex items-center justify-between">
                {timeline.filter((_, i) => i % 2 === 0).map((pt, idx) => (
                  <div
                    key={idx}
                    className="w-1 rounded-full bg-[#41634F]"
                    style={{ height: `${Math.min(14, Math.max(2, Math.abs(pt.muscle3) * 25))}px` }}
                    title={`t=${pt.timestampMs}ms, m3=${pt.muscle3}mV`}
                  />
                ))}
              </div>
            ) : (
              <span className="text-[9px] text-[#A8A29E] italic">Waiting for EMG 3 samples...</span>
            )}
          </div>
        </div>

        {/* Gesture Event Trigger Track */}
        <div className="pt-1 flex items-center justify-between text-[9px] font-mono border-t border-[#E5E0D8]/40">
          <span className="text-[#8C827A] font-bold">EVENT TRIGGER:</span>
          {hasData ? (
            <span className="text-[#41634F] font-bold flex items-center gap-1">
              <span>GESTURE EVENT</span>
              <span className="text-xs">▲</span>
              <span>(T_PEAK ONSET)</span>
            </span>
          ) : (
            <span className="text-[#A8A29E]">NO EVENT REGISTERED</span>
          )}
        </div>

        {/* Timeline bottom timestamp scale */}
        <div className="flex items-center justify-between text-[9px] text-[#8C827A] pt-1 border-t border-[#E5E0D8]/60">
          <span>0.0s (T_start)</span>
          <span className="text-[#B45309] font-bold">TIME ─────────────────────────&rarr;</span>
          <span>{durationMs > 0 ? `+${(durationMs / 1000).toFixed(1)}s` : '+2.5s'}</span>
        </div>
      </div>
    </div>
  )
}
