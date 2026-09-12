import React from 'react'
import { Settings, Volume2, VolumeX, Sliders, Zap, Database } from 'lucide-react'
import type { TelemetrySettings } from '../../../hooks/useDeviceTelemetry'

interface DashboardSettingsProps {
  settings: TelemetrySettings
  onUpdateSettings: (newSettings: Partial<TelemetrySettings>) => void
}

export const DashboardSettingsSection: React.FC<DashboardSettingsProps> = ({
  settings,
  onUpdateSettings,
}) => {
  return (
    <div className="rounded-sm border border-border/80 bg-graphite-light/50 p-5 backdrop-blur-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-cyan-signal" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-cyan-signal font-semibold">
            Telemetry & Speech Engine Settings
          </span>
        </div>
        <span className="font-mono text-[10px] text-cream-muted uppercase">SYSTEM CONFIG</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-mono text-xs">
        {/* 1. Voice Output Toggle */}
        <div className="rounded-sm border border-border bg-graphite-elevated/70 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-cream flex items-center gap-2">
              {settings.voiceEnabled ? (
                <Volume2 size={16} className="text-cyan-signal" />
              ) : (
                <VolumeX size={16} className="text-zinc-500" />
              )}
              Voice Output Engine
            </span>
            <button
              type="button"
              onClick={() => onUpdateSettings({ voiceEnabled: !settings.voiceEnabled })}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.voiceEnabled ? 'bg-cyan-signal' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-graphite transition duration-200 ease-in-out ${
                  settings.voiceEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <p className="text-[10px] text-cream-muted/70 leading-relaxed">
            Enable synthesized verbal speech output via browser Web Speech API upon intent detection.
          </p>
        </div>

        {/* 2. Auto-Speak on Prediction */}
        <div className="rounded-sm border border-border bg-graphite-elevated/70 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-cream flex items-center gap-2">
              <Zap size={16} className="text-cyan-signal" />
              Auto-Speak Predictions
            </span>
            <button
              type="button"
              onClick={() => onUpdateSettings({ autoSpeak: !settings.autoSpeak })}
              disabled={!settings.voiceEnabled}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-40 ${
                settings.autoSpeak && settings.voiceEnabled ? 'bg-cyan-signal' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-graphite transition duration-200 ease-in-out ${
                  settings.autoSpeak && settings.voiceEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <p className="text-[10px] text-cream-muted/70 leading-relaxed">
            Automatically vocalize incoming confirmed muscle gesture commands without requiring manual click.
          </p>
        </div>

        {/* 3. Speech Rate Slider */}
        <div className="rounded-sm border border-border bg-graphite-elevated/70 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-cream flex items-center gap-2">
              <Sliders size={16} className="text-cyan-signal" />
              Speech Rate
            </span>
            <span className="text-cyan-signal font-bold">{settings.speechRate.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={settings.speechRate}
            disabled={!settings.voiceEnabled}
            onChange={(e) => onUpdateSettings({ speechRate: parseFloat(e.target.value) })}
            className="w-full accent-cyan-signal cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-cream-muted/60">
            <span>0.5x (Slow)</span>
            <span>1.0x (Normal)</span>
            <span>1.5x (Fast)</span>
          </div>
        </div>

        {/* 4. Telemetry Buffer Size */}
        <div className="rounded-sm border border-border bg-graphite-elevated/70 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-cream flex items-center gap-2">
              <Database size={16} className="text-cyan-signal" />
              Oscilloscope Buffer
            </span>
            <span className="text-cyan-signal font-bold">{settings.bufferSize} pts</span>
          </div>
          <input
            type="range"
            min="100"
            max="500"
            step="50"
            value={settings.bufferSize}
            onChange={(e) => onUpdateSettings({ bufferSize: parseInt(e.target.value, 10) })}
            className="w-full accent-cyan-signal cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-cream-muted/60">
            <span>100 samples (Fast)</span>
            <span>200 (Standard)</span>
            <span>500 (Detailed)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
