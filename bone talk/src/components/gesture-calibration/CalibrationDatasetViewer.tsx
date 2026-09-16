import React, { useState } from 'react'
import { Database, CheckCircle2, FileText, Code, Filter } from 'lucide-react'
import { gestureCalibrationSync } from '../../services/gestureCalibrationSync'
import type { SyntheticDataset, SyntheticDatasetSample } from '../../services/gestureCalibrationSync'

interface CalibrationDatasetViewerProps {
  dataset: SyntheticDataset
}

export const CalibrationDatasetViewer: React.FC<CalibrationDatasetViewerProps> = ({ dataset }) => {
  const [filterSplit, setFilterSplit] = useState<'ALL' | 'TRAIN' | 'VALIDATION' | 'TEST'>('ALL')
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null)

  const filteredSamples = dataset.samples.filter((s) => {
    if (filterSplit === 'ALL') return true
    return s.split === filterSplit
  })

  const handleDownloadJson = () => {
    const jsonStr = gestureCalibrationSync.exportDatasetToJson(dataset)
    const filename = `bonetalk_dataset_${dataset.targetPhrase.toLowerCase()}_${Date.now()}.json`
    gestureCalibrationSync.downloadDatasetFile(jsonStr, filename, 'application/json')
    setDownloadSuccess('JSON dataset exported successfully!')
    setTimeout(() => setDownloadSuccess(null), 3000)
  }

  const handleDownloadCsv = () => {
    const csvStr = gestureCalibrationSync.exportDatasetToCsv(dataset)
    const filename = `bonetalk_dataset_${dataset.targetPhrase.toLowerCase()}_${Date.now()}.csv`
    gestureCalibrationSync.downloadDatasetFile(csvStr, filename, 'text/csv')
    setDownloadSuccess('CSV dataset exported successfully!')
    setTimeout(() => setDownloadSuccess(null), 3000)
  }

  return (
    <div className="p-4 sm:p-5 rounded-sm border border-[#E5E0D8] bg-[#FAF8F5] space-y-4 font-mono text-xs select-none">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5E0D8]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-[#41634F]/10 flex items-center justify-center text-[#41634F]">
            <Database size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#262220] uppercase tracking-wider">
              Generated Calibration Dataset
            </h4>
            <p className="text-[10px] text-[#8C827A]">
              Synthetic Multi-Modal Augmentation &bull; Gesture Dynamics + 3-Ch EMG
            </p>
          </div>
        </div>

        {/* Badges & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30 font-bold text-[10px]">
            SYNTHETIC DEMO DATASET
          </span>
          <span className="px-2 py-0.5 rounded bg-[#E8EFEA] text-[#2B382D] border border-[#41634F]/30 font-bold text-[10px]">
            {dataset.totalSamples} SAMPLES
          </span>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="px-2.5 py-1 rounded bg-[#2B382D] text-[#FFFFFF] hover:bg-[#38493B] transition-colors flex items-center gap-1.5 cursor-pointer font-bold text-[11px]"
            title="Download dataset as JSON"
          >
            <Code size={12} />
            <span>EXPORT JSON</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="px-2.5 py-1 rounded border border-[#E5E0D8] bg-[#FFFFFF] text-[#262220] hover:bg-[#F2EFE9] transition-colors flex items-center gap-1.5 cursor-pointer font-bold text-[11px]"
            title="Download dataset as CSV"
          >
            <FileText size={12} />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-2 rounded bg-[#E8EFEA] text-[#2B382D] border border-[#41634F]/30 flex items-center gap-2 text-[11px] font-bold animate-in fade-in duration-150">
          <CheckCircle2 size={13} className="text-[#41634F]" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* ── Dataset Metrics Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2 rounded bg-[#FFFFFF] border border-[#E5E0D8]">
          <span className="text-[9px] text-[#8C827A] uppercase block">Target Gesture</span>
          <span className="font-extrabold text-[#262220] text-sm truncate block">
            {dataset.targetPhrase}
          </span>
        </div>
        <div className="p-2 rounded bg-[#FFFFFF] border border-[#E5E0D8]">
          <span className="text-[9px] text-[#8C827A] uppercase block">Train Split</span>
          <span className="font-bold text-[#41634F] text-xs block">
            {dataset.trainCount} samples (70%)
          </span>
        </div>
        <div className="p-2 rounded bg-[#FFFFFF] border border-[#E5E0D8]">
          <span className="text-[9px] text-[#8C827A] uppercase block">Validation Split</span>
          <span className="font-bold text-[#0369A1] text-xs block">
            {dataset.valCount} samples (20%)
          </span>
        </div>
        <div className="p-2 rounded bg-[#FFFFFF] border border-[#E5E0D8]">
          <span className="text-[9px] text-[#8C827A] uppercase block">Test Split</span>
          <span className="font-bold text-[#D97706] text-xs block">
            {dataset.testCount} samples (10%)
          </span>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          <Filter size={12} className="text-[#8C827A]" />
          <span className="text-[#8C827A] font-bold uppercase">Filter:</span>
          {(['ALL', 'TRAIN', 'VALIDATION', 'TEST'] as const).map((split) => (
            <button
              key={split}
              type="button"
              onClick={() => setFilterSplit(split)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                filterSplit === split
                  ? 'bg-[#2B382D] text-[#FFFFFF] border-[#2B382D]'
                  : 'bg-[#FFFFFF] text-[#5C554E] border-[#E5E0D8] hover:bg-[#F2EFE9]'
              }`}
            >
              {split}
            </button>
          ))}
        </div>

        <span className="text-[10px] text-[#8C827A]">
          Showing {filteredSamples.length} of {dataset.totalSamples} records
        </span>
      </div>

      {/* ── Sample Preview Table (Fixed Height) ── */}
      <div className="border border-[#E5E0D8] rounded-sm overflow-hidden bg-[#FFFFFF]">
        <div className="max-h-[190px] overflow-y-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-[#8C827A] sticky top-0">
              <tr>
                <th className="p-2">Sample ID</th>
                <th className="p-2">Split</th>
                <th className="p-2">Duration</th>
                <th className="p-2">Peak Kinematics</th>
                <th className="p-2">Aspect</th>
                <th className="p-2">M1 / M2 / M3 RMS</th>
                <th className="p-2">SNR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]/60">
              {filteredSamples.map((s: SyntheticDatasetSample) => (
                <tr key={s.sampleId} className="hover:bg-[#FAF8F5]/60 transition-colors">
                  <td className="p-2 font-bold text-[#262220]">{s.sampleId}</td>
                  <td className="p-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                        s.split === 'TRAIN'
                          ? 'bg-[#E8EFEA] text-[#2B382D] border-[#41634F]/30'
                          : s.split === 'VALIDATION'
                          ? 'bg-[#E0F2FE] text-[#0369A1] border-[#38BDF8]/40'
                          : 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/40'
                      }`}
                    >
                      {s.split}
                    </span>
                  </td>
                  <td className="p-2 text-[#5C554E]">{s.durationMs} ms</td>
                  <td className="p-2 text-[#41634F] font-semibold">{s.peakAperture}</td>
                  <td className="p-2 text-[#5C554E]">{s.aspectRatio}</td>
                  <td className="p-2 text-[#736B63]">
                    {s.m1Rms} / {s.m2Rms} / {s.m3Rms} mV
                  </td>
                  <td className="p-2 text-[#41634F]">{s.snrDb} dB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Honest Disclaimer Notice ── */}
      <p className="text-[10px] text-[#8C827A] pt-1">
        * <strong>Notice</strong>: This dataset is synthesized and augmented directly from your 5 multi-modal calibration trials with simulated sensor jitter and variance. Suitable for downstream classifier training and offline benchmarking.
      </p>
    </div>
  )
}

export default CalibrationDatasetViewer
