import React from 'react'
import { ModelConnectionCard } from '../components/connection/ModelConnectionCard'
import { PredictionPanel } from '../components/prediction/PredictionPanel'
import { useModelControl } from '../context/ModelControlContext'
import { Layers } from 'lucide-react'

export const ModelInferencePage: React.FC = () => {
  const { modelStatus, modelInfo } = useModelControl()

  const classes = modelInfo?.classes || ['NO', 'REST', 'THANK YOU', 'YES']

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-mono font-bold text-[#262220] uppercase tracking-wider">
            Machine Learning Inference Architecture
          </h2>
          <p className="text-xs font-mono text-[#8C827A] mt-0.5">
            Real-time inference pipeline connected to FastAPI backend &amp; trained EMG classifiers
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span
            className={`px-2.5 py-1 rounded border uppercase text-[11px] font-bold ${
              modelStatus === 'Ready'
                ? 'bg-[#E8EFEA] text-[#2B382D] border-[#41634F]/30'
                : 'bg-[#FEE2E2] text-[#991B1B] border-[#EF4444]/40'
            }`}
          >
            STATUS: {modelStatus}
          </span>
        </div>
      </div>

      {/* ── Model Connection Card + Prediction Console ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModelConnectionCard />
        <PredictionPanel />
      </div>

      {/* ── Model Architecture Breakdown ── */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E5E0D8]/60">
          <Layers size={15} className="text-[#41634F]" />
          <h4 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
            Model Specifications &amp; Vocabulary Classes
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
            <span className="text-[10px] text-[#8C827A] uppercase block">Architecture Type</span>
            <span className="font-bold text-[#262220] block mt-1">
              {modelInfo?.model_type || 'Random Forest / LinearSVC'}
            </span>
            <span className="text-[10px] text-[#8C827A] block mt-1">
              Windowed Time-Domain &amp; Frequency Spectral Features
            </span>
          </div>

          <div className="p-3 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
            <span className="text-[10px] text-[#8C827A] uppercase block">Input Vector Size</span>
            <span className="font-bold text-[#262220] block mt-1">
              {modelInfo?.feature_count ? `${modelInfo.feature_count} Dimensions` : '128 Features'}
            </span>
            <span className="text-[10px] text-[#8C827A] block mt-1">
              RMS, MAV, ZCR, WL, Spectral Moments per Channel
            </span>
          </div>

          <div className="p-3 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
            <span className="text-[10px] text-[#8C827A] uppercase block">Inference Protocol</span>
            <span className="font-bold text-[#262220] block mt-1">REST POST /api/predict</span>
            <span className="text-[10px] text-[#8C827A] block mt-1">
              Buffered Streaming WebSocket: /ws/emg
            </span>
          </div>
        </div>

        <div>
          <span className="text-xs font-mono font-bold text-[#262220] block mb-2">
            Target Silent Speech Vocabularies
          </span>
          <div className="flex flex-wrap gap-2">
            {classes.map((clsName) => (
              <span
                key={clsName}
                className="px-3 py-1 rounded bg-[#F5F2EB] border border-[#E5E0D8] text-xs font-mono font-bold text-[#262220]"
              >
                {clsName}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
