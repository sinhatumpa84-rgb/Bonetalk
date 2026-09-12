import React, { useState, useEffect } from 'react'
import { ModelControlProvider, useModelControl } from './context/ModelControlContext'
import { ModelControlHeader } from './components/layout/ModelControlHeader'
import { ModelControlNav } from './components/layout/ModelControlNav'
import type { ModelControlTab } from './components/layout/ModelControlNav'
import { DashboardOverviewPage } from './pages/DashboardOverviewPage'
import { LiveTelemetryPage } from './pages/LiveTelemetryPage'
import { ModelInferencePage } from './pages/ModelInferencePage'
import { HistoryPage } from './pages/HistoryPage'
import { SystemStatusPage } from './pages/SystemStatusPage'
import { SettingsPage } from './pages/SettingsPage'

const ModelControlInner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ModelControlTab>('dashboard')
  const { predictionHistory, hasSensorData, modelStatus } = useModelControl()

  // Sync tab with URL hash if present (e.g. /model-control#telemetry)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as ModelControlTab
      if (['dashboard', 'telemetry', 'model', 'history', 'system', 'settings'].includes(hash)) {
        setActiveTab(hash)
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const handleSelectTab = (tab: ModelControlTab) => {
    setActiveTab(tab)
    window.location.hash = tab
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#262220] flex flex-col font-sans selection:bg-[#41634F]/20 selection:text-[#2B382D]">
      {/* ── Top Engineering Console Header ── */}
      <ModelControlHeader />

      {/* ── Sub-navigation bar ── */}
      <ModelControlNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        predictionCount={predictionHistory.length}
        hasSensorData={hasSensorData}
        modelReady={modelStatus === 'Ready'}
      />

      {/* ── Main Viewport Container ── */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && <DashboardOverviewPage />}
        {activeTab === 'telemetry' && <LiveTelemetryPage />}
        {activeTab === 'model' && <ModelInferencePage />}
        {activeTab === 'history' && <HistoryPage />}
        {activeTab === 'system' && <SystemStatusPage />}
        {activeTab === 'settings' && <SettingsPage />}
      </main>

      {/* ── Minimal Console Footer ── */}
      <footer className="bg-[#FFFFFF] border-t border-[#E5E0D8] px-4 sm:px-8 py-3 text-[11px] font-mono text-[#8C827A] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[#262220]">BoneTalk Hardware &amp; Neural Console</span>
          <span>•</span>
          <span>v1.0.0-PROD</span>
          <span>•</span>
          <span>UC Berkeley Silent Speech Baseline</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#41634F]" />
          <span>Clinical Wearable Telemetry Standard</span>
        </div>
      </footer>
    </div>
  )
}

export const ModelControlApp: React.FC = () => {
  return (
    <ModelControlProvider>
      <ModelControlInner />
    </ModelControlProvider>
  )
}

export default ModelControlApp
