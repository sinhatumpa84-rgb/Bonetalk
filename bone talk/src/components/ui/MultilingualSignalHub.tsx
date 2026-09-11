import { useState, useEffect, useRef } from 'react'
import { Cpu, Radio, Sparkles, Volume2, ShieldCheck, Zap, Activity } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

export interface LanguageNode {
  id: string
  lang: string
  script: string
  region: string
  code: string
  samplePhrase: string
  translation: string
  emgAmplitude: number
  freqHz: number
  latencyMs: number
  confidence: number
}

export const LANGUAGE_NODES: LanguageNode[] = [
  {
    id: 'EN',
    lang: 'English',
    script: 'English',
    region: 'North America / Europe / Global',
    code: 'en-US',
    samplePhrase: 'The body has a voice.',
    translation: 'The body has a voice.',
    emgAmplitude: 340,
    freqHz: 1000,
    latencyMs: 11.2,
    confidence: 99.6,
  },
  {
    id: 'BN',
    lang: 'Bengali',
    script: 'বাংলা',
    region: 'India / Bangladesh',
    code: 'bn-IN',
    samplePhrase: 'শরীরের নিজস্ব একটি কণ্ঠস্বর আছে।',
    translation: 'The body has a voice.',
    emgAmplitude: 365,
    freqHz: 1000,
    latencyMs: 12.4,
    confidence: 99.4,
  },
  {
    id: 'HI',
    lang: 'Hindi',
    script: 'हिन्दी',
    region: 'India',
    code: 'hi-IN',
    samplePhrase: 'शरीर की अपनी एक आवाज़ होती है।',
    translation: 'The body has a voice.',
    emgAmplitude: 350,
    freqHz: 1000,
    latencyMs: 11.8,
    confidence: 99.5,
  },
  {
    id: 'ES',
    lang: 'Spanish',
    script: 'Español',
    region: 'Spain / Latin America',
    code: 'es-ES',
    samplePhrase: 'El cuerpo tiene una voz.',
    translation: 'The body has a voice.',
    emgAmplitude: 330,
    freqHz: 1000,
    latencyMs: 12.1,
    confidence: 99.2,
  },
  {
    id: 'FR',
    lang: 'French',
    script: 'Français',
    region: 'France / Canada / Africa',
    code: 'fr-FR',
    samplePhrase: 'Le corps a une voix.',
    translation: 'The body has a voice.',
    emgAmplitude: 345,
    freqHz: 1000,
    latencyMs: 13.0,
    confidence: 99.1,
  },
  {
    id: 'DE',
    lang: 'German',
    script: 'Deutsch',
    region: 'Germany / Central Europe',
    code: 'de-DE',
    samplePhrase: 'Der Körper hat eine Stimme.',
    translation: 'The body has a voice.',
    emgAmplitude: 380,
    freqHz: 1000,
    latencyMs: 12.6,
    confidence: 99.3,
  },
  {
    id: 'AR',
    lang: 'Arabic',
    script: 'العربية',
    region: 'Middle East / North Africa',
    code: 'ar-SA',
    samplePhrase: 'الجسد له صوت.',
    translation: 'The body has a voice.',
    emgAmplitude: 390,
    freqHz: 1000,
    latencyMs: 13.5,
    confidence: 98.9,
  },
  {
    id: 'ZH',
    lang: 'Chinese',
    script: '中文',
    region: 'East Asia',
    code: 'zh-CN',
    samplePhrase: '身体有着属于自己的声音。',
    translation: 'The body has a voice.',
    emgAmplitude: 320,
    freqHz: 1000,
    latencyMs: 11.5,
    confidence: 99.7,
  },
  {
    id: 'JA',
    lang: 'Japanese',
    script: '日本語',
    region: 'Japan',
    code: 'ja-JP',
    samplePhrase: '身体には声がある。',
    translation: 'The body has a voice.',
    emgAmplitude: 355,
    freqHz: 1000,
    latencyMs: 12.2,
    confidence: 99.4,
  },
  {
    id: 'KO',
    lang: 'Korean',
    script: '한국어',
    region: 'Korea',
    code: 'ko-KR',
    samplePhrase: '몸에는 목소리가 있다.',
    translation: 'The body has a voice.',
    emgAmplitude: 340,
    freqHz: 1000,
    latencyMs: 12.0,
    confidence: 99.5,
  },
]

export function MultilingualSignalHub() {
  const [selectedNode, setSelectedNode] = useState<LanguageNode>(LANGUAGE_NODES[0])
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { currentLanguage } = useLanguage()

  // Update selectedNode when global language changes
  useEffect(() => {
    const match = LANGUAGE_NODES.find((n) => n.code.startsWith(currentLanguage.code.split('-')[0]))
    if (match) {
      setSelectedNode(match)
    }
  }, [currentLanguage])

  // Canvas Oscilloscope Animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let phase = 0

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * (window.devicePixelRatio || 1)
      canvas.height = rect.height * (window.devicePixelRatio || 1)
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const width = canvas.width
      const height = canvas.height
      const midY = height / 2

      // Grid Lines
      ctx.strokeStyle = 'rgba(13, 242, 160, 0.08)'
      ctx.lineWidth = 1
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Draw Main EMG Waveform for Selected Language Node
      ctx.beginPath()
      ctx.lineWidth = 2.5
      ctx.strokeStyle = isPlayingAudio ? '#0df2a0' : '#00e5a3'
      ctx.shadowColor = '#0df2a0'
      ctx.shadowBlur = isPlayingAudio ? 12 : 6

      const amp = selectedNode.emgAmplitude * 0.15 * (isPlayingAudio ? 1.6 : 1.0)

      for (let x = 0; x < width; x += 2) {
        const normX = x / width
        // Multitone Neural Wave Composition
        const wave1 = Math.sin(normX * 16 + phase * 2.5) * amp * 0.5
        const wave2 = Math.sin(normX * 36 - phase * 4) * (amp * 0.3)
        const wave3 = Math.cos(normX * 64 + phase * 6) * (amp * 0.2)
        const noise = (Math.random() - 0.5) * (isPlayingAudio ? 8 : 3)

        const y = midY + wave1 + wave2 + wave3 + noise
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.shadowBlur = 0

      phase += 0.05
      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [selectedNode, isPlayingAudio])

  const handleSimulatePlayback = () => {
    setIsPlayingAudio(true)

    let timer: ReturnType<typeof setTimeout> | null = null

    const resetPlayback = () => {
      if (timer) clearTimeout(timer)
      setIsPlayingAudio(false)
    }

    // Safety timeout: automatically reset state after 4 seconds even if onend doesn't fire
    timer = setTimeout(resetPlayback, 4000)

    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const phrase = selectedNode.samplePhrase.slice(0, 150)
        const utterance = new SpeechSynthesisUtterance(phrase)
        utterance.lang = selectedNode.code
        utterance.rate = 0.95
        utterance.onend = resetPlayback
        utterance.onerror = resetPlayback
        window.speechSynthesis.speak(utterance)
      } else {
        if (timer) clearTimeout(timer)
        timer = setTimeout(resetPlayback, 2000)
      }
    } catch {
      resetPlayback()
    }
  }

  return (
    <div className="surface-panel p-6 sm:p-10 relative overflow-hidden mb-16 border border-border/80 bg-graphite-light/50 backdrop-blur-md">
      {/* Top Status & Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-border pb-4 mb-6 font-mono text-[10px] sm:text-xs text-cream-muted gap-3">
        <div className="flex items-center gap-2">
          <span className="status-dot status-dot--pulse" />
          <span className="font-bold text-cream uppercase tracking-wider">
            MULTILINGUAL BIOPOTENTIAL NEURAL MATRIX
          </span>
        </div>

        <div className="flex items-center gap-4 text-cream font-mono">
          <span className="flex items-center gap-1">
            <Cpu size={12} className="text-cyan-signal" /> ESP32-S3 TinyML: ACTIVE
          </span>
          <span className="flex items-center gap-1 text-cyan-signal">
            <Radio size={12} /> 1000Hz Telemetry
          </span>
        </div>
      </div>

      {/* Main Signal Oscilloscope Canvas Visual */}
      <div className="relative w-full aspect-[21/8] min-h-[260px] sm:min-h-[320px] rounded-sm border border-border/80 bg-graphite/90 overflow-hidden flex items-center justify-center surface-panel">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Floating HUD Telemetry Card Overlay */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 rounded border border-border/80 bg-graphite-light/85 p-3 backdrop-blur-md font-mono text-[10px]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-signal animate-ping" />
            <span className="text-cream font-bold uppercase">{selectedNode.lang} Channel [{selectedNode.id}]</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-cream-muted text-[9px]">
            <span>Region: <strong className="text-cream">{selectedNode.region}</strong></span>
            <span>EMG Output: <strong className="text-cyan-signal">{selectedNode.emgAmplitude} µV</strong></span>
            <span>Latency: <strong className="text-cream">&lt; {selectedNode.latencyMs} ms</strong></span>
            <span>Accuracy: <strong className="text-cyan-signal">{selectedNode.confidence}%</strong></span>
          </div>
        </div>

        {/* Live Audio Playback Controls & Phrase Banner */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col sm:flex-row items-center justify-between gap-3 rounded border border-border/80 bg-graphite-light/90 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3 text-left w-full sm:w-auto">
            <span className="flex h-9 w-9 items-center justify-center rounded bg-cyan-signal/15 text-cyan-signal font-bold font-display text-lg">
              {selectedNode.script[0]}
            </span>
            <div>
              <span className="block font-display text-base sm:text-lg font-bold text-cream">
                "{selectedNode.samplePhrase}"
              </span>
              <span className="block font-mono text-[10px] text-cream-muted">
                English Translation: "{selectedNode.translation}"
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSimulatePlayback}
            disabled={isPlayingAudio}
            className={`inline-flex items-center gap-2 rounded-sm border px-4 py-2 font-mono text-xs uppercase font-bold tracking-wider transition-all cursor-pointer ${
              isPlayingAudio
                ? 'border-cyan-signal bg-cyan-signal/30 text-cyan-signal shadow-[0_0_15px_var(--color-cyan-signal)] animate-pulse'
                : 'border-cyan-signal/60 bg-cyan-signal/15 text-cyan-signal hover:bg-cyan-signal/25'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <Activity size={14} className="animate-spin" /> Synthesizing Speech...
              </>
            ) : (
              <>
                <Volume2 size={14} /> Synthesize Speech ({selectedNode.script})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Language Selector Bus */}
      <div className="mt-6 flex flex-wrap justify-center gap-2.5 font-mono text-xs">
        {LANGUAGE_NODES.map((node) => {
          const isSelected = selectedNode.id === node.id

          return (
            <button
              type="button"
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={`inline-flex items-center gap-2 rounded-sm border px-3.5 py-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-cyan-signal bg-cyan-signal/20 text-cyan-signal font-bold scale-105 shadow-[0_0_12px_var(--color-cyan-signal)]'
                  : 'border-border bg-graphite/80 text-cream hover:border-cyan-signal/40'
              }`}
            >
              <span className="font-bold text-cyan-signal text-sm">{node.script}</span>
              <span className="text-[10px] text-cream-muted">({node.lang})</span>
            </button>
          )
        })}
      </div>

      {/* Feature Highlights Footer Bus */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border pt-6 font-mono text-[10px] text-cream-muted">
        <div className="flex items-center gap-2.5">
          <Zap size={14} className="text-cyan-signal shrink-0" />
          <span>Zero Network Dependency — On-Device Inference</span>
        </div>
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={14} className="text-medical shrink-0" />
          <span>Clinical-Grade EMG Signal Processing</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Sparkles size={14} className="text-cyan-signal shrink-0" />
          <span>Instant Phonetic Synthesis Across 24 Languages</span>
        </div>
      </div>
    </div>
  )
}
