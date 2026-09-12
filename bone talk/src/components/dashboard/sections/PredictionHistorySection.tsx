import React from 'react'
import { History, Trash2, CheckCircle2, ShieldCheck, Clock } from 'lucide-react'
import type { PredictionHistoryItem } from '../../../hooks/useDeviceTelemetry'

interface PredictionHistoryProps {
  history: PredictionHistoryItem[]
  onClearHistory: () => void
  onReplaySpeech?: (command: string) => void
}

export const PredictionHistorySection: React.FC<PredictionHistoryProps> = ({
  history,
  onClearHistory,
}) => {
  return (
    <div className="rounded-sm border border-border/80 bg-graphite-light/50 p-5 backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <History size={16} className="text-cyan-signal" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-cyan-signal font-semibold">
            Prediction History & Speech Log
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-cream-muted">
            {history.length} event{history.length !== 1 ? 's' : ''}
          </span>
          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="inline-flex items-center gap-1.5 rounded-sm border border-red-500/30 bg-red-500/10 px-2.5 py-1 font-mono text-[10px] text-red-300 hover:bg-red-500/20 transition-colors cursor-pointer"
              title="Clear all recorded prediction events"
            >
              <Trash2 size={12} />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {history.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-border/60 text-[10px] text-cream-muted uppercase tracking-wider">
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Command</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-graphite-elevated/40 transition-colors">
                  <td className="py-2.5 px-3 text-cream-muted flex items-center gap-1.5">
                    <Clock size={12} className="text-zinc-500" />
                    {item.time}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-cream">
                    <span className="inline-block px-2 py-0.5 rounded-sm bg-cyan-signal/15 border border-cyan-signal/30 text-cyan-signal">
                      {item.command}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {item.confidence !== undefined ? (
                      <span className="text-emerald-400 font-semibold">{item.confidence}%</span>
                    ) : (
                      <span className="text-zinc-500">Confidence: —</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px]">
                      <CheckCircle2 size={12} />
                      {item.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-cream-muted text-[10px] uppercase">
                    <span className="rounded-sm bg-graphite-elevated px-1.5 py-0.5 border border-border">
                      {item.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center text-zinc-500 font-mono text-xs space-y-2">
          <ShieldCheck size={28} className="mx-auto text-zinc-600" />
          <p>No predictions recorded in this session.</p>
          <p className="text-[10px] text-zinc-600">
            Simulate a muscle gesture or stream live EMG data to capture real-time intent events.
          </p>
        </div>
      )}
    </div>
  )
}
