import React from 'react'
import { PredictionHistoryTable } from '../components/prediction/PredictionHistoryTable'
import { useModelControl } from '../context/ModelControlContext'

export const HistoryPage: React.FC = () => {
  const { predictionHistory } = useModelControl()

  return (
    <div className="space-y-6">
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-mono font-bold text-[#262220] uppercase tracking-wider">
            Prediction Log &amp; Event Archive
          </h2>
          <p className="text-xs font-mono text-[#8C827A] mt-0.5">
            Complete chronological record of all silent speech predictions received from model
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded border border-[#E5E0D8] bg-[#FAF8F5] text-[#5C554E] font-semibold">
            TOTAL LOGGED: {predictionHistory.length}
          </span>
        </div>
      </div>

      <PredictionHistoryTable showExport={true} />
    </div>
  )
}
