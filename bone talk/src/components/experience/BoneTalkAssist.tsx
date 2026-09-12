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
            className="absolute bottom-12 right-0 w-[calc(100vw-2rem)] sm:w-80 max-w-sm rounded-sm bg-graphite-elevated/95 backdrop-blur-xl border border-cyan-signal/30 p-5 shadow-[var(--shadow-level-3)] animate-in fade-in zoom-in-95 duration-200 transition-colors duration-300"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-3 mb-4">
              <div>
                <h3
                  id="bonetalk-assist-title"
                  className="font-mono text-sm font-semibold text-cream tracking-wider uppercase flex items-center gap-2"
                >
                  <span className="text-cyan-signal">🎙</span>
                  <span>BoneTalk Assist</span>
                </h3>
                <p className="font-mono text-[11px] text-cream-muted tracking-wide mt-0.5">
                  EMG Communication
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-6 h-6 flex items-center justify-center rounded-sm border border-border hover:border-cyan-signal text-cream-muted hover:text-cream font-mono text-xs transition-colors cursor-pointer"
                aria-label="Close BoneTalk Assist panel"
              >
                ✕
              </button>
            </div>

            {/* Status Grid */}
            <div className="space-y-2 font-mono text-xs mb-5 bg-graphite p-3 rounded-sm border border-border">
              <div className="flex items-center justify-between">
                <span className="text-cream-muted">Sensor:</span>
                <span className="inline-flex items-center gap-1.5 text-cream font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />
                  <span>{sensorStatus}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cream-muted">Model:</span>
                <span className="inline-flex items-center gap-1.5 text-cyan-signal font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-signal animate-pulse" />
                  <span>{modelStatus}</span>
                </span>
              </div>
            </div>

            {/* Action Section */}
            <div className="mb-5 text-center">
              <button
                type="button"
                onClick={handleStartListening}
                className="w-full py-2.5 px-4 rounded-sm border border-cyan-signal/40 bg-cyan-signal/10 hover:bg-cyan-signal/20 text-cyan-signal font-mono text-xs uppercase tracking-widest transition-colors font-medium cursor-pointer"
              >
                [ Start Listening ]
              </button>

              {listeningNotice && (
                <p className="mt-2.5 font-mono text-[11px] text-cyan-signal animate-in fade-in duration-150">
                  {listeningNotice}
                </p>
              )}
            </div>

            {/* Output Diagnostics */}
            <div className="border-t border-border pt-3.5 space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-cream-muted">Prediction:</span>
                <span className="text-cream font-semibold">{prediction}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cream-muted">Confidence:</span>
                <span className="text-cream font-semibold">{confidence}</span>
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
        className="group relative flex items-center gap-2 rounded-sm border border-border bg-graphite-elevated/95 backdrop-blur-md px-3 py-2 sm:px-3.5 sm:py-2 text-xs font-mono tracking-wider text-cream-muted hover:text-cream hover:border-cyan-signal shadow-[var(--shadow-level-2)] transition-all duration-200 cursor-pointer"
      >
        <span className="text-cyan-signal group-hover:scale-110 transition-transform duration-200">🎙</span>
        <span className="font-medium uppercase tracking-wider text-cream">BoneTalk Assist</span>
      </button>
    </aside>
  )
}
