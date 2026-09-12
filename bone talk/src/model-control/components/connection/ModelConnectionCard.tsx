import React, { useState } from 'react'
import { Cpu, RefreshCw, CheckCircle2, XCircle, AlertCircle, Play } from 'lucide-react'
import { useModelControl } from '../../context/ModelControlContext'

export const ModelConnectionCard: React.FC = () => {
  const {
    modelStatus,
    modelInfo,
    backendUrl,
    setBackendUrl,
    refreshModelStatus,
    testModelWithUtterance,
  } = useModelControl()

  const [isEditingUrl, setIsEditingUrl] = useState(false)
  const [urlInput, setUrlInput] = useState(backendUrl)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault()
    setBackendUrl(urlInput)
    setIsEditingUrl(false)
  }

  const handleRunInferenceTest = async (word: string) => {
    setIsTesting(true)
    setTestResult(null)
    try {
      await testModelWithUtterance(word)
      setTestResult(`Inference executed successfully. Check Prediction panel.`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Inference request failed'
      setTestResult(`Error: ${msg}`)
    } finally {
      setIsTesting(false)
    }
  }

  const isReady = modelStatus === 'Ready'

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E0D8]/60">
        <div className="flex items-center gap-2">
          <Cpu size={15} className="text-[#41634F]" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
            Model Connection &amp; Inference Pipeline
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 ${
              isReady
                ? 'bg-[#E8EFEA] text-[#2B382D] border border-[#41634F]/30'
                : modelStatus === 'Loading'
                ? 'bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/40'
                : 'bg-[#FEE2E2] text-[#991B1B] border border-[#EF4444]/40'
            }`}
          >
            {isReady ? (
              <CheckCircle2 size={11} />
            ) : modelStatus === 'Loading' ? (
              <RefreshCw size={11} className="animate-spin" />
            ) : (
              <XCircle size={11} />
            )}
            <span>{modelStatus}</span>
          </span>

          <button
            onClick={refreshModelStatus}
            className="p-1 rounded border border-[#E5E0D8] text-[#736B63] hover:text-[#262220] hover:bg-[#F5F2EB]"
            title="Poll Model Health"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* Connection Endpoint & Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs mb-4">
        <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
          <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">Model Name</span>
          <span className="font-semibold text-[#262220]">BoneTalk ML Model</span>
          <span className="text-[10px] text-[#8C827A] block mt-0.5">
            {modelInfo?.model_type || 'Random Forest / 1D-CNN'}
          </span>
        </div>

        <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
          <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">Backend Endpoint</span>
          <span className="font-semibold text-[#262220] truncate block" title={backendUrl}>
            {backendUrl}
          </span>
          <span className="text-[10px] text-[#8C827A] block mt-0.5">FastAPI REST + WebSocket</span>
        </div>

        <div className="p-2.5 rounded bg-[#FBF9F5] border border-[#E5E0D8]">
          <span className="text-[10px] text-[#8C827A] uppercase tracking-wider block">Class Vocabulary</span>
          <span className="font-semibold text-[#262220]">
            {modelInfo?.classes ? `${modelInfo.classes.length} Labels` : '4 Baseline Classes'}
          </span>
          <span className="text-[10px] text-[#8C827A] block mt-0.5 truncate">
            {modelInfo?.classes?.join(', ') || 'NO, REST, THANK YOU, YES'}
          </span>
        </div>
      </div>

      {/* Backend Offline Diagnostic if not ready */}
      {!isReady && (
        <div className="mb-4 p-3 rounded-sm bg-[#FAF8F5] border border-[#E5E0D8] text-xs font-mono text-[#5C554E]">
          <div className="flex items-center gap-2 font-semibold text-[#262220] mb-1">
            <AlertCircle size={14} className="text-[#8C827A]" />
            <span>Backend Inference Service Offline or Unreachable</span>
          </div>
          <p className="text-[11px] text-[#736B63]">
            The frontend connects to the existing FastAPI model server at{' '}
            <code className="text-[#262220] bg-[#EFECE6] px-1 py-0.5 rounded">{backendUrl}</code>.
            To start the service locally:
          </p>
          <pre className="mt-1.5 p-2 rounded bg-[#F2EFE9] text-[#262220] text-[10px] overflow-x-auto">
            cd backend && uvicorn main:app --reload --port 8000
          </pre>
        </div>
      )}

      {/* Testing Section: Runs a genuine call to /api/predict using actual recorded baseline EMG */}
      <div className="pt-3 border-t border-[#E5E0D8]/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono font-bold text-[#262220] block">
              Inference Pipeline Verification
            </span>
            <span className="text-[11px] font-mono text-[#8C827A]">
              Test real ML inference endpoint with genuine EMG buffer
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleRunInferenceTest('REST')}
              disabled={!isReady || isTesting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono font-semibold bg-[#F5F2EB] border border-[#E5E0D8] text-[#262220] hover:bg-[#EDE8DE] transition-all disabled:opacity-50 cursor-pointer"
            >
              <Play size={11} />
              <span>{isTesting ? 'RUNNING...' : 'TEST INFERENCE'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditingUrl(!isEditingUrl)}
              className="text-[11px] font-mono text-[#5C554E] hover:text-[#262220] underline ml-1"
            >
              {isEditingUrl ? 'Close URL Form' : 'Change Endpoint URL'}
            </button>
          </div>
        </div>

        {testResult && (
          <div className="mt-2 text-[11px] font-mono text-[#41634F] bg-[#E8EFEA] p-2 rounded border border-[#41634F]/20">
            {testResult}
          </div>
        )}

        {isEditingUrl && (
          <form onSubmit={handleSaveUrl} className="mt-3 pt-3 border-t border-[#E5E0D8]/60 flex items-center gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs font-mono rounded border border-[#E5E0D8] bg-[#FFFFFF] text-[#262220] focus:outline-none focus:ring-1 focus:ring-[#41634F]"
              placeholder="http://localhost:8000"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-mono font-semibold rounded bg-[#2B382D] text-[#FFFFFF] hover:bg-[#38493B]"
            >
              Save URL
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
