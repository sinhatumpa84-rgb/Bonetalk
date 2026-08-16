import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Radio, Activity, Zap, ShieldCheck, X } from 'lucide-react'
import { HARDWARE_COMPONENTS } from '../../lib/constants'
import { TechnicalGrid } from '../layout/TechnicalGrid'
import { SplitLines } from '../ui/SplitText'

interface DetailSpec {
  title: string
  specList: { label: string; value: string }[]
  icon: typeof Cpu
  summary: string
}

const HARDWARE_DETAILS: Record<string, DetailSpec> = {
  emg: {
    title: 'EMG Surface Sensor Array',
    icon: Activity,
    summary: 'Clinical-grade Ag/AgCl differential surface electrode array measuring biopotential muscle activity with low contact impedance.',
    specList: [
      { label: 'Electrodes', value: '3x Gold-Plated Contacts' },
      { label: 'Input Range', value: '±5 mV Differential' },
      { label: 'Bandwidth', value: '10 Hz - 500 Hz' },
      { label: 'Impedance', value: '10 GΩ DC Input' },
    ],
  },
  acquisition: {
    title: 'Analog Front-End (AFE)',
    icon: Zap,
    summary: 'Ultra-low-noise instrumental amplifier with programmable gain (PGA) and integrated 24-bit delta-sigma ADC.',
    specList: [
      { label: 'ADC Resolution', value: '24-Bit Delta-Sigma' },
      { label: 'Sampling Rate', value: '1000 Samples / sec' },
      { label: 'CMRR', value: '-110 dB' },
      { label: 'Noise Floor', value: '1.0 μV RMS' },
    ],
  },
  esp32: {
    title: 'ESP32-S3 Microcontroller',
    icon: Cpu,
    summary: '32-bit Xtensa dual-core LX7 microcontroller running at 240 MHz with vector instructions for TinyML inference.',
    specList: [
      { label: 'Processor', value: 'Dual-Core LX7 @ 240MHz' },
      { label: 'Vector Extensions', value: 'DSP & Neural Accel' },
      { label: 'SRAM / PSRAM', value: '512 KB SRAM + 8MB' },
      { label: 'Power Consumption', value: '< 45 mW Peak' },
    ],
  },
  wireless: {
    title: 'Wireless Telemetry System',
    icon: Radio,
    summary: 'Ultra-low latency Bluetooth 5.0 Low Energy (BLE) and 2.4 GHz Wi-Fi transceivers for continuous real-time streaming.',
    specList: [
      { label: 'Protocol', value: 'BLE 5.0 / 2.4 GHz Wi-Fi' },
      { label: 'Latency', value: '< 12 ms End-to-End' },
      { label: 'Range', value: 'Up to 15 Meters' },
      { label: 'Security', value: 'AES-128 Hardware Enc' },
    ],
  },
  ai: {
    title: 'On-Device TinyML Classifier',
    icon: ShieldCheck,
    summary: 'Quantized neural network model executing real-time feature extraction and gesture pattern classification on embedded hardware.',
    specList: [
      { label: 'Model Size', value: '42 KB INT8 Quantized' },
      { label: 'Inference Speed', value: '3.8 ms / window' },
      { label: 'Features', value: 'RMS, MAV, ZCR, WAMP' },
      { label: 'Accuracy', value: '> 96.4% Calibrated' },
    ],
  },
}

const COMPONENT_POSITIONS = [
  { id: 'emg', x: '50%', y: '15%', label: 'EMG SENSOR' },
  { id: 'acquisition', x: '20%', y: '35%', label: 'SIGNAL ACQUISITION' },
  { id: 'esp32', x: '50%', y: '50%', label: 'ESP32-S3' },
  { id: 'wireless', x: '80%', y: '65%', label: 'WIRELESS' },
  { id: 'ai', x: '50%', y: '82%', label: 'AI PROCESSING' },
]

export function HardwareSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [selectedComp, setSelectedComp] = useState<string | null>('esp32')

  const detail = selectedComp ? HARDWARE_DETAILS[selectedComp] : null
  const IconComponent = detail?.icon || Cpu

  return (
    <section
      ref={sectionRef}
      id="hardware"
      className="relative py-24 md:py-40"
      aria-label="Hardware showcase"
    >
      <TechnicalGrid variant="hardware" />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="font-mono text-[10px] tracking-[0.35em] text-cyan-signal uppercase">
              Embedded Hardware Architecture
            </span>
            <SplitLines
              lines={['THE HARDWARE', 'BEHIND THE VOICE.']}
              className="mt-2"
              lineClassName="font-display text-[clamp(2rem,5vw,4rem)] font-bold leading-[1] tracking-[-0.02em] text-cream"
            />
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-cream-muted md:text-sm">
            Clinical-grade analog front-end integrated with high-efficiency embedded AI hardware.
            Click any component to inspect technical specifications.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
          {/* Exploded Diagram */}
          <div className="relative mx-auto aspect-[4/3] w-full max-w-3xl rounded-sm border border-border bg-graphite-light/40 p-6 backdrop-blur-sm md:aspect-[16/10]">
            <svg
              viewBox="0 0 600 400"
              className="h-full w-full"
              aria-label="BoneTalk hardware exploded view diagram"
            >
              {/* Connection lines */}
              {COMPONENT_POSITIONS.slice(0, -1).map((pos, i) => {
                const next = COMPONENT_POSITIONS[i + 1]
                return (
                  <motion.line
                    key={`line-${i}`}
                    x1={pos.x}
                    y1={pos.y}
                    x2={next.x}
                    y2={next.y}
                    stroke={selectedComp === pos.id || selectedComp === next.id ? '#22d3ee' : 'rgba(34,211,238,0.2)'}
                    strokeWidth={selectedComp === pos.id || selectedComp === next.id ? '1.5' : '1'}
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.15 }}
                  />
                )
              })}

              {/* EMG Sensor */}
              <motion.g
                onClick={() => setSelectedComp('emg')}
                className="cursor-pointer"
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <rect
                  x="240"
                  y="30"
                  width="120"
                  height="60"
                  rx="4"
                  fill={selectedComp === 'emg' ? '#1c2830' : '#18181b'}
                  stroke={selectedComp === 'emg' ? '#22d3ee' : 'rgba(245,242,235,0.2)'}
                  strokeWidth={selectedComp === 'emg' ? '2' : '1'}
                />
                <circle cx="270" cy="60" r="8" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
                <circle cx="300" cy="60" r="8" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
                <circle cx="330" cy="60" r="8" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
                <text x="300" y="110" textAnchor="middle" fill={selectedComp === 'emg' ? '#22d3ee' : '#a8a49c'} fontSize="10" fontFamily="monospace" fontWeight={selectedComp === 'emg' ? 'bold' : 'normal'}>
                  EMG SENSOR
                </text>
              </motion.g>

              {/* Signal Acquisition */}
              <motion.g
                onClick={() => setSelectedComp('acquisition')}
                className="cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <rect
                  x="60"
                  y="120"
                  width="110"
                  height="50"
                  rx="4"
                  fill={selectedComp === 'acquisition' ? '#1c2830' : '#18181b'}
                  stroke={selectedComp === 'acquisition' ? '#22d3ee' : 'rgba(245,242,235,0.2)'}
                  strokeWidth={selectedComp === 'acquisition' ? '2' : '1'}
                />
                <path d="M70 145 L90 135 L110 150 L130 130" stroke="#22d3ee" strokeWidth="1.5" fill="none" />
                <text x="115" y="190" textAnchor="middle" fill={selectedComp === 'acquisition' ? '#22d3ee' : '#a8a49c'} fontSize="9" fontFamily="monospace">
                  SIGNAL ACQ.
                </text>
              </motion.g>

              {/* ESP32-S3 */}
              <motion.g
                onClick={() => setSelectedComp('esp32')}
                className="cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                data-cursor="EXPLORE"
              >
                <rect
                  x="220"
                  y="170"
                  width="160"
                  height="100"
                  rx="4"
                  fill={selectedComp === 'esp32' ? '#0f2430' : '#111113'}
                  stroke={selectedComp === 'esp32' ? '#22d3ee' : 'rgba(34,211,238,0.4)'}
                  strokeWidth={selectedComp === 'esp32' ? '2.5' : '1.5'}
                />
                <rect x="240" y="190" width="30" height="20" rx="2" fill="#1c1c1e" stroke="#22d3ee" strokeWidth="0.5" />
                <rect x="280" y="190" width="30" height="20" rx="2" fill="#1c1c1e" stroke="#22d3ee" strokeWidth="0.5" />
                <rect x="320" y="190" width="30" height="20" rx="2" fill="#1c1c1e" stroke="#22d3ee" strokeWidth="0.5" />
                <circle cx="300" cy="240" r="6" fill="#4ade80" className="animate-pulse" />
                <text x="300" y="290" textAnchor="middle" fill={selectedComp === 'esp32' ? '#22d3ee' : '#f5f2eb'} fontSize="11" fontFamily="monospace" fontWeight="bold">
                  ESP32-S3
                </text>
              </motion.g>

              {/* Wireless */}
              <motion.g
                onClick={() => setSelectedComp('wireless')}
                className="cursor-pointer"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <path
                  d="M440 240 Q480 220 520 240 Q480 260 440 240"
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth={selectedComp === 'wireless' ? '2' : '1'}
                  opacity={selectedComp === 'wireless' ? '0.9' : '0.5'}
                />
                <circle cx="480" cy="240" r="5" fill="#22d3ee" />
                <text x="480" y="280" textAnchor="middle" fill={selectedComp === 'wireless' ? '#22d3ee' : '#a8a49c'} fontSize="9" fontFamily="monospace">
                  WIRELESS
                </text>
              </motion.g>

              {/* AI Processing */}
              <motion.g
                onClick={() => setSelectedComp('ai')}
                className="cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <rect
                  x="230"
                  y="310"
                  width="140"
                  height="50"
                  rx="4"
                  fill={selectedComp === 'ai' ? '#162b20' : '#18181b'}
                  stroke={selectedComp === 'ai' ? '#4ade80' : 'rgba(74,222,128,0.3)'}
                  strokeWidth={selectedComp === 'ai' ? '2' : '1'}
                />
                {[0, 1, 2, 3, 4].map((i) => (
                  <rect
                    key={i}
                    x={250 + i * 22}
                    y="325"
                    width="14"
                    height="20"
                    fill="#4ade80"
                    opacity={0.3 + i * 0.15}
                  />
                ))}
                <text x="300" y="380" textAnchor="middle" fill={selectedComp === 'ai' ? '#4ade80' : '#a8a49c'} fontSize="10" fontFamily="monospace">
                  AI PROCESSING
                </text>
              </motion.g>
            </svg>
          </div>

          {/* Interactive Specification Inspector Drawer */}
          <div className="flex flex-col justify-between rounded-sm border border-border bg-graphite-light/60 p-6 backdrop-blur-sm">
            <AnimatePresence mode="wait">
              {detail && (
                <motion.div
                  key={selectedComp}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-cyan-signal/30 bg-cyan-signal/[0.08] text-cyan-signal">
                        <IconComponent size={18} />
                      </div>
                      <div>
                        <span className="font-mono text-[9px] tracking-[0.2em] text-cyan-signal uppercase">
                          Technical Spec
                        </span>
                        <h3 className="font-display text-base font-bold text-cream">
                          {detail.title}
                        </h3>
                      </div>
                    </div>
                    {selectedComp && (
                      <button
                        type="button"
                        onClick={() => setSelectedComp(null)}
                        className="text-cream-muted transition-colors hover:text-cream"
                        aria-label="Close details"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <p className="text-xs leading-relaxed text-cream-muted">
                    {detail.summary}
                  </p>

                  <div className="space-y-3">
                    <span className="font-mono text-[9px] tracking-[0.2em] text-cream-muted uppercase">
                      Hardware Parameters
                    </span>
                    <div className="grid grid-cols-1 gap-2.5">
                      {detail.specList.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-sm border border-border/60 bg-graphite/60 px-3 py-2 font-mono text-xs"
                        >
                          <span className="text-cream-muted/70">{item.label}</span>
                          <span className="font-medium text-cream">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 border-t border-border pt-4 text-center font-mono text-[10px] text-cream-muted/60">
              Click elements in diagram to inspect sub-system
            </div>
          </div>
        </div>

        {/* Quick Component Cards */}
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-6">
          {HARDWARE_COMPONENTS.map((comp) => {
            const isSelected = selectedComp === comp.id
            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => setSelectedComp(comp.id)}
                className={`border p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-cyan-signal/60 bg-cyan-signal/[0.08] shadow-[0_0_12px_rgba(34,211,238,0.12)]'
                    : 'border-border bg-glass hover:border-cream/30 hover:bg-cream/[0.03]'
                }`}
              >
                <span className="font-mono text-[9px] tracking-[0.2em] text-cyan-signal uppercase">
                  {comp.label}
                </span>
                <p className="mt-2 text-xs text-cream-muted">{comp.detail}</p>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

