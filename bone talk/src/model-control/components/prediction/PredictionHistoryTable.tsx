import React from 'react'
import { History, Trash2, Download } from 'lucide-react'
import { useModelControl } from '../../context/ModelControlContext'

interface PredictionHistoryTableProps {
  maxRows?: number
  showExport?: boolean
}

export const PredictionHistoryTable: React.FC<PredictionHistoryTableProps> = ({
  maxRows,
  showExport = true,
}) => {
  const { predictionHistory, clearPredictionHistory } = useModelControl()

  const displayedRows = maxRows ? predictionHistory.slice(0, maxRows) : predictionHistory

  const formatConfidence = (val: number | null) => {
    if (val === null || val === undefined) return '—'
    return `${(val * 100).toFixed(1)}%`
  }

  const handleExportCSV = () => {
    if (predictionHistory.length === 0) return
    const headers = ['Timestamp', 'Command', 'Confidence', 'Source']
    const rows = predictionHistory.map((p) => [
      p.time,
      `"${p.command}"`,
      p.confidence !== null ? `${(p.confidence * 100).toFixed(1)}%` : '—',
      p.source,
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `bonetalk_predictions_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E5E0D8]/60">
        <div className="flex items-center gap-2">
          <History size={14} className="text-[#41634F]" />
          <h4 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
            Prediction History &amp; Event Log
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {showExport && predictionHistory.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1 text-[11px] font-mono text-[#5C554E] hover:text-[#262220] py-1 px-2 rounded border border-[#E5E0D8] bg-[#FBF9F5]"
              title="Export as CSV"
            >
              <Download size={12} />
              <span>EXPORT</span>
            </button>
          )}

          {predictionHistory.length > 0 && (
            <button
              onClick={clearPredictionHistory}
              className="flex items-center gap-1 text-[11px] font-mono text-[#991B1B] hover:text-[#7F1D1D] py-1 px-2 rounded border border-[#FEE2E2] bg-[#FEF2F2]"
              title="Clear Local History"
            >
              <Trash2 size={12} />
              <span>CLEAR HISTORY</span>
            </button>
          )}
        </div>
      </div>

      {displayedRows.length === 0 ? (
        <div className="py-8 text-center bg-[#FAF8F5] border border-[#E5E0D8] rounded-sm">
          <p className="text-xs font-mono text-[#8C827A]">No predictions recorded yet.</p>
          <span className="text-[11px] font-mono text-[#A8A29E] mt-0.5 block">
            Predictions received via MQTT or inference will be logged here with real confidence scores.
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#E5E0D8] rounded-sm">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-[#736B63] text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-3 font-semibold">Time</th>
                <th className="py-2.5 px-3 font-semibold">Predicted Command</th>
                <th className="py-2.5 px-3 font-semibold">Confidence</th>
                <th className="py-2.5 px-3 font-semibold">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]/60">
              {displayedRows.map((entry) => (
                <tr key={entry.id} className="hover:bg-[#FBF9F5] transition-colors">
                  <td className="py-2 px-3 text-[#5C554E]">{entry.time}</td>
                  <td className="py-2 px-3 font-bold text-[#262220]">
                    <span className="bg-[#E8EFEA] text-[#2B382D] px-2 py-0.5 rounded border border-[#41634F]/20 text-[11px]">
                      {entry.command}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[#262220] font-semibold">
                    {formatConfidence(entry.confidence)}
                  </td>
                  <td className="py-2 px-3 text-[#8C827A] text-[11px]">{entry.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
