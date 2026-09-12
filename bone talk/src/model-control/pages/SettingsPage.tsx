import React, { useState } from 'react'
import { Volume2, Radio, Sliders, Check } from 'lucide-react'
import { useModelControl } from '../context/ModelControlContext'
import { speechService } from '../../lib/speechService'

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, backendUrl, setBackendUrl } = useModelControl()

  const [savedSuccess, setSavedSuccess] = useState(false)
  const [form, setForm] = useState({
    voiceOutputEnabled: settings.voiceOutputEnabled,
    autoSpeak: settings.autoSpeak,
    speechRate: settings.speechRate,
    mqttBrokerUrl: settings.mqttBrokerUrl,
    mqttPort: settings.mqttPort,
    mqttUsername: settings.mqttUsername,
    mqttPassword: settings.mqttPassword,
    subscribeTopic: settings.subscribeTopic,
    publishTopic: settings.publishTopic,
    deviceId: settings.deviceId,
    backendUrl: backendUrl,
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings({
      voiceOutputEnabled: form.voiceOutputEnabled,
      autoSpeak: form.autoSpeak,
      speechRate: form.speechRate,
      mqttBrokerUrl: form.mqttBrokerUrl,
      mqttPort: Number(form.mqttPort),
      mqttUsername: form.mqttUsername,
      mqttPassword: form.mqttPassword,
      subscribeTopic: form.subscribeTopic,
      publishTopic: form.publishTopic,
      deviceId: form.deviceId,
    })
    setBackendUrl(form.backendUrl)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  const handleTestVoice = () => {
    speechService.speak('BoneTalk speech synthesis operational.', { rate: form.speechRate })
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-mono font-bold text-[#262220] uppercase tracking-wider">
            Model Control Preferences &amp; Config
          </h2>
          <p className="text-xs font-mono text-[#8C827A] mt-0.5">
            Hardware networking, speech engine parameters, and backend endpoint configuration
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#2B382D] bg-[#E8EFEA] border border-[#41634F]/30 px-3 py-1 rounded">
            <Check size={12} />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 font-mono text-xs">
        {/* ── Section 1: Voice & Audio Output ── */}
        <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E0D8]/60">
            <Volume2 size={15} className="text-[#41634F]" />
            <h3 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
              Speech Synthesis &amp; Audio Output
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#262220] block">Voice Output</span>
                <span className="text-[11px] text-[#8C827A]">
                  Enable browser Web Speech API for voice playback of predictions
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.voiceOutputEnabled}
                  onChange={(e) => setForm({ ...form, voiceOutputEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#E5E0D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2B382D]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#262220] block">Auto-Speak</span>
                <span className="text-[11px] text-[#8C827A]">
                  Automatically vocalize new model predictions immediately upon classification
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.autoSpeak}
                  onChange={(e) => setForm({ ...form, autoSpeak: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#E5E0D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2B382D]"></div>
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#262220]">Speech Rate</span>
                <span className="text-xs text-[#5C554E]">{form.speechRate}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.75"
                step="0.05"
                value={form.speechRate}
                onChange={(e) => setForm({ ...form, speechRate: parseFloat(e.target.value) })}
                className="w-full accent-[#2B382D] cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-[#8C827A] mt-1">
                <span>0.5x (Slow)</span>
                <button
                  type="button"
                  onClick={handleTestVoice}
                  className="text-[#41634F] underline hover:text-[#2B382D]"
                >
                  Test Voice Rate
                </button>
                <span>1.75x (Fast)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 2: Hardware & MQTT Configuration ── */}
        <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E0D8]/60">
            <Radio size={15} className="text-[#41634F]" />
            <h3 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
              MQTT Broker &amp; Network Configuration
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-[#736B63] uppercase tracking-wider mb-1">
                Device Identifier
              </label>
              <input
                type="text"
                value={form.deviceId}
                onChange={(e) => setForm({ ...form, deviceId: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-[#E5E0D8] bg-[#FFFFFF] text-[#262220] focus:outline-none focus:ring-1 focus:ring-[#41634F]"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#736B63] uppercase tracking-wider mb-1">
                MQTT Broker URL (WebSocket)
              </label>
              <input
                type="text"
                value={form.mqttBrokerUrl}
                onChange={(e) => setForm({ ...form, mqttBrokerUrl: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-[#E5E0D8] bg-[#FFFFFF] text-[#262220] focus:outline-none focus:ring-1 focus:ring-[#41634F]"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#736B63] uppercase tracking-wider mb-1">
                Telemetry Subscribe Topic
              </label>
              <input
                type="text"
                value={form.subscribeTopic}
                onChange={(e) => setForm({ ...form, subscribeTopic: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-[#E5E0D8] bg-[#FFFFFF] text-[#262220] focus:outline-none focus:ring-1 focus:ring-[#41634F]"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#736B63] uppercase tracking-wider mb-1">
                Command Publish Topic
              </label>
              <input
                type="text"
                value={form.publishTopic}
                onChange={(e) => setForm({ ...form, publishTopic: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-[#E5E0D8] bg-[#FFFFFF] text-[#262220] focus:outline-none focus:ring-1 focus:ring-[#41634F]"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#736B63] uppercase tracking-wider mb-1">
                Broker Username (Optional)
              </label>
              <input
                type="text"
                value={form.mqttUsername}
                onChange={(e) => setForm({ ...form, mqttUsername: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-[#E5E0D8] bg-[#FFFFFF] text-[#262220] focus:outline-none focus:ring-1 focus:ring-[#41634F]"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#736B63] uppercase tracking-wider mb-1">
                Broker Password (Optional)
              </label>
              <input
                type="password"
                value={form.mqttPassword}
                onChange={(e) => setForm({ ...form, mqttPassword: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-[#E5E0D8] bg-[#FFFFFF] text-[#262220] focus:outline-none focus:ring-1 focus:ring-[#41634F]"
              />
            </div>
          </div>
        </div>

        {/* ── Section 3: Model Backend Endpoint ── */}
        <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-sm p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E0D8]/60">
            <Sliders size={15} className="text-[#41634F]" />
            <h3 className="text-xs font-mono font-bold tracking-wider text-[#262220] uppercase">
              Backend Inference Server
            </h3>
          </div>

          <div>
            <label className="block text-[10px] text-[#736B63] uppercase tracking-wider mb-1">
              FastAPI Endpoint URL
            </label>
            <input
              type="text"
              value={form.backendUrl}
              onChange={(e) => setForm({ ...form, backendUrl: e.target.value })}
              className="w-full px-3 py-1.5 rounded border border-[#E5E0D8] bg-[#FFFFFF] text-[#262220] focus:outline-none focus:ring-1 focus:ring-[#41634F]"
              placeholder="http://localhost:8000"
            />
            <span className="text-[10px] text-[#8C827A] mt-1 block">
              Default: http://localhost:8000 (FastAPI backend providing /api/status and /api/predict)
            </span>
          </div>
        </div>

        {/* ── Save Action ── */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-sm bg-[#2B382D] text-[#FFFFFF] hover:bg-[#38493B] font-semibold text-xs tracking-wider transition-all shadow-xs cursor-pointer"
          >
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  )
}
