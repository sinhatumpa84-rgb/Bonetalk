import React, { useState, useEffect } from 'react'

/**
 * BoneTalkAssist Component
 *
 * Provides a native, unobtrusive entry point for the BoneTalk Assist EMG communication panel.
 * Designed for modularity: encapsulates UI, status, and future EMG sensor/model hooks.
 */

// Architecture placeholder for future EMG hardware & inference connection:
export interface EMGModelInterface {
  sensorConnected: boolean
  modelReady: boolean
  startListening: () => void
  prediction: string | null
  confidence: number | null
}

export const BoneTalkAssist: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [listeningNotice, setListeningNotice] = useState<string | null>(null)

  // Status state (Initial state: strictly unsimulated placeholders)
  const sensorStatus = 'Not Connected'
  const modelStatus = 'Ready'
  const prediction = '—'
  const confidence = '—'

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setListeningNotice(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleStartListening = () => {
    // Phase 7 rule: strictly display coming soon message, no fake AI or random data
    setListeningNotice('EMG model connection coming soon.')
  }

  const handleClose = () => {
    setIsOpen(false)
    setListeningNotice(null)
  }

  return (
    <aside aria-label="BoneTalk Assist" className="fixed bottom-6 right-6 z-40 sm:bottom-6 sm:right-6">
      {/* ── Modal / Panel Overlay & Container ── */}
      {isOpen && (
        <>
          {/* Backdrop on small viewports */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs sm:hidden"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Panel Window */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="bonetalk-assist-title"
            className="absolute bottom-12 right-0 w-[calc(100vw-2rem)] sm:w-80 max-w-sm rounded-sm bg-[#0A0E17]/95 backdrop-blur-xl border border-emerald-500/30 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(45,212,191,0.08)] animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-3 mb-4">
              <div>
                <h3
                  id="bonetalk-assist-title"
                  className="font-mono text-sm font-semibold text-white tracking-wider uppercase flex items-center gap-2"
                >
                  <span className="text-emerald-400">🎙</span>
                  <span>BoneTalk Assist</span>
                </h3>
                <p className="font-mono text-[11px] text-neutral-400 tracking-wide mt-0.5">
                  EMG Communication
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-6 h-6 flex items-center justify-center rounded-sm border border-white/10 hover:border-emerald-400 text-neutral-400 hover:text-white font-mono text-xs transition-colors cursor-pointer"
                aria-label="Close BoneTalk Assist panel"
              >
                ✕
              </button>
            </div>

            {/* Status Grid */}
            <div className="space-y-2 font-mono text-xs mb-5 bg-white/[0.02] p-3 rounded-sm border border-white/[0.05]">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Sensor:</span>
                <span className="inline-flex items-center gap-1.5 text-neutral-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />
                  <span>{sensorStatus}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Model:</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{modelStatus}</span>
                </span>
              </div>
            </div>

            {/* Action Section */}
            <div className="mb-5 text-center">
              <button
                type="button"
                onClick={handleStartListening}
                className="w-full py-2.5 px-4 rounded-sm border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-mono text-xs uppercase tracking-widest transition-colors font-medium cursor-pointer"
              >
                [ Start Listening ]
              </button>

              {listeningNotice && (
                <p className="mt-2.5 font-mono text-[11px] text-emerald-400/90 animate-in fade-in duration-150">
                  {listeningNotice}
                </p>
              )}
            </div>

            {/* Output Diagnostics */}
            <div className="border-t border-white/[0.08] pt-3.5 space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Prediction:</span>
                <span className="text-neutral-300 font-semibold">{prediction}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Confidence:</span>
                <span className="text-neutral-300 font-semibold">{confidence}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── BoneTalk Assist Trigger Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="group relative flex items-center gap-2 rounded-sm border border-white/15 bg-[#0A0E17]/95 backdrop-blur-md px-3 py-2 sm:px-3.5 sm:py-2 text-xs font-mono tracking-wider text-neutral-300 hover:text-white hover:border-emerald-400/60 shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition-all duration-200 cursor-pointer"
      >
        <span className="text-emerald-400 group-hover:scale-110 transition-transform duration-200">🎙</span>
        <span className="font-medium uppercase tracking-wider">BoneTalk Assist</span>
      </button>
    </aside>
  )
}
