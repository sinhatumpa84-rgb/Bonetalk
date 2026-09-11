import { useState, useCallback } from 'react'
import { Volume2, Cpu, Check, Wifi, WifiOff } from 'lucide-react'
import {
  SIGNAL_COMMANDS,
  SIGNAL_PATTERNS,
  type SignalCommand,
} from '../../lib/constants'
import { EMGWaveform } from '../ui/EMGWaveform'
import { useBoneTalkLive } from '../../hooks/useBoneTalkLive'

export function TechnologySection() {
  const [selected, setSelected] = useState<SignalCommand | null>('YES')
  const [confidence, setConfidence] = useState(97.4)
  const { isLive, setIsLive, backendOnline, livePrediction } = useBoneTalkLive()

  // When live prediction arrives, update the display
  const displayCmd = isLive && livePrediction
    ? (livePrediction.prediction as SignalCommand)
    : selected
  const displayConf = isLive && livePrediction
    ? Math.round(livePrediction.confidence * 1000) / 10
    : confidence

  const speakPhrase = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.pitch = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }, [])

  const handleSelect = (cmd: SignalCommand) => {
    if (isLive) return // in live mode, predictions come from hardware
    setSelected(cmd)
    const target = SIGNAL_PATTERNS[cmd].confidence
    setConfidence(target)
    speakPhrase(cmd)
  }

  return (
    <section id="technology" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="max-w-3xl mb-16">
          <span className="text-sm font-semibold tracking-wider text-emerald-700 uppercase">
            Biomedical Signal & Hardware Platform
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 leading-tight">
            Interactive Signal Telemetry
          </h2>
          <p className="mt-4 text-lg text-zinc-600 leading-relaxed font-normal">
            Test real-time EMG pattern recognition below. Click any command to simulate muscle contraction and voice synthesis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Signal Oscilloscope Card */}
          <div className="lg:col-span-8 rounded-2xl bg-zinc-900 p-6 md:p-8 text-white shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${isLive && backendOnline ? 'bg-blue-500' : 'bg-emerald-500'} animate-pulse`} />
                <span className="font-mono text-sm font-medium text-zinc-300">
                  {isLive ? (backendOnline ? 'Live Hardware Stream' : 'Backend Offline') : 'Live EMG Stream (1000 Hz)'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsLive(!isLive)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                    isLive
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {isLive ? <Wifi size={12} /> : <WifiOff size={12} />}
                  {isLive ? 'Live' : 'Simulated'}
                </button>
                <div className="font-mono text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
                  ACTIVE PATTERN: {displayCmd || 'IDLE'}
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-black/60 p-4 border border-zinc-800">
              <EMGWaveform
                width={700}
                height={180}
                command={selected}
                intensity={selected ? 1.2 : 0.6}
                color="#10b981"
                className="w-full"
                showGrid={true}
              />
            </div>

            {displayCmd && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-zinc-800 text-sm">
                <div>
                  <span className="block text-xs font-mono text-zinc-400 uppercase">Confidence</span>
                  <span className="text-xl font-bold text-emerald-400 font-mono">{displayConf}%</span>
                </div>
                <div>
                  <span className="block text-xs font-mono text-zinc-400 uppercase">Intent Output</span>
                  <span className="text-xl font-bold text-white font-mono">{displayCmd}</span>
                </div>
                <div>
                  <span className="block text-xs font-mono text-zinc-400 uppercase">Latency</span>
                  <span className="text-xl font-bold text-zinc-300 font-mono">12.4 ms</span>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => selected && speakPhrase(selected)}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                  >
                    <Volume2 size={14} /> Replay Voice
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Command Selector Buttons */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-1">
              Select Muscle Command
            </h3>
            {SIGNAL_COMMANDS.map((cmd) => {
              const isSelected = selected === cmd
              return (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => handleSelect(cmd)}
                  className={`flex items-center justify-between p-5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-600'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'
                  }`}
                >
                  <div>
                    <span className="font-bold text-lg text-zinc-900 block">
                      {cmd}
                    </span>
                    <span className="text-xs text-zinc-500 mt-0.5 block">
                      {cmd === 'YES' && 'Single Neck Extensor Flex'}
                      {cmd === 'NO' && 'Double Rapid Twitch'}
                      {cmd === 'HELP' && 'Sustained Isometric Contraction'}
                      {cmd === 'WATER' && 'Sequential Dual Burst'}
                    </span>
                  </div>
                  {isSelected ? (
                    <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                      <Check size={14} />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full border border-zinc-300" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Hardware Specs Table */}
        <div className="mt-20 rounded-2xl bg-zinc-50 border border-zinc-200 p-8">
          <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <Cpu className="text-emerald-600" size={20} />
            Hardware & Protocol Specifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="bg-white p-5 rounded-xl border border-zinc-200">
              <span className="font-mono text-xs font-bold text-emerald-700 uppercase block mb-1">Microcontroller</span>
              <p className="font-bold text-zinc-900 text-base">ESP32-S3 (240MHz Dual-Core)</p>
              <p className="text-zinc-600 text-xs mt-1">Vector instructions for local TinyML neural inference</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-zinc-200">
              <span className="font-mono text-xs font-bold text-emerald-700 uppercase block mb-1">Analog Front-End</span>
              <p className="font-bold text-zinc-900 text-base">24-Bit Delta-Sigma ADC</p>
              <p className="text-zinc-600 text-xs mt-1">±5mV differential input with clinical noise floor</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-zinc-200">
              <span className="font-mono text-xs font-bold text-emerald-700 uppercase block mb-1">Telemetry Protocol</span>
              <p className="font-bold text-zinc-900 text-base">MQTT Protocol over Wi-Fi / BLE</p>
              <p className="text-zinc-600 text-xs mt-1">Ultra-low latency streaming for live hardware telemetry</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
