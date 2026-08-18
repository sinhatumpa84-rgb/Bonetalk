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

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] md:mt-16 md:gap-12">
          {/* Exploded Diagram */}
          <div className="relative mx-auto aspect-[4/3] w-full max-w-3xl rounded-sm border border-border bg-graphite-light/40 p-3 backdrop-blur-sm sm:p-6 md:aspect-[16/10]">
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
                    stroke={selectedComp === pos.id || selectedComp === next.id ? 'var(--color-cyan-signal)' : 'var(--signal-line-dim)'}
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
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedComp('emg')}
                className="cursor-pointer"
              >
                <circle
                  cx="300"
                  cy="60"
                  r="30"
                  fill={selectedComp === 'emg' ? 'var(--surface-active-cyan)' : 'var(--surface-elevated)'}
                  stroke={selectedComp === 'emg' ? 'var(--color-cyan-signal)' : 'var(--cyan-stroke-dim)'}
                  strokeWidth={selectedComp === 'emg' ? '2' : '1'}
                />
                <circle cx="288" cy="55" r="4" fill="var(--color-cyan-signal)" />
                <circle cx="300" cy="65" r="4" fill="var(--color-cyan-signal)" />
                <circle cx="312" cy="55" r="4" fill="var(--color-cyan-signal)" />
                <text x="300" y="105" textAnchor="middle" fill={selectedComp === 'emg' ? 'var(--color-cyan-signal)' : 'var(--color-cream-muted)'} fontSize="10" fontFamily="monospace">
                  EMG SENSORS
                </text>
              </motion.g>

              {/* Signal Acquisition AFE */}
              <motion.g
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedComp('acquisition')}
                className="cursor-pointer"
              >
                <rect
                  x="70"
                  y="120"
                  width="100"
                  height="50"
                  rx="4"
                  fill={selectedComp === 'acquisition' ? 'var(--surface-active-cyan)' : 'var(--surface-elevated)'}
                  stroke={selectedComp === 'acquisition' ? 'var(--color-cyan-signal)' : 'var(--cyan-stroke-dim)'}
                  strokeWidth={selectedComp === 'acquisition' ? '2' : '1'}
                />
                <path d="M90 145 L110 135 L130 155 L150 145" stroke="var(--color-cyan-signal)" strokeWidth="1.5" fill="none" />
                <text x="120" y="185" textAnchor="middle" fill={selectedComp === 'acquisition' ? 'var(--color-cyan-signal)' : 'var(--color-cream-muted)'} fontSize="10" fontFamily="monospace">
                  ANALOG FRONT-END
                </text>
              </motion.g>

              {/* ESP32-S3 Processor */}
              <motion.g
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedComp('esp32')}
                className="cursor-pointer"
              >
                <rect
                  x="260"
                  y="170"
                  width="80"
                  height="80"
                  rx="6"
                  fill={selectedComp === 'esp32' ? 'var(--surface-active-cyan)' : 'var(--surface-elevated)'}
                  stroke={selectedComp === 'esp32' ? 'var(--color-cyan-signal)' : 'var(--cyan-stroke-dim)'}
                  strokeWidth={selectedComp === 'esp32' ? '2' : '1'}
                />
                {/* Pins */}
                {[-1, 1].map((side) =>
                  [0, 1, 2, 3].map((i) => (
                    <line
                      key={`${side}-${i}`}
                      x1={side === -1 ? 252 : 340}
                      y1={185 + i * 15}
                      x2={side === -1 ? 260 : 348}
                      y2={185 + i * 15}
                      stroke="var(--color-cyan-signal)"
                      strokeWidth="2"
                    />
                  ))
                )}
                <text x="300" y="210" textAnchor="middle" fill="var(--color-cyan-signal)" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  ESP32
                </text>
                <text x="300" y="224" textAnchor="middle" fill="var(--color-cream-muted)" fontSize="9" fontFamily="monospace">
                  -S3-
                </text>
                <text x="300" y="270" textAnchor="middle" fill={selectedComp === 'esp32' ? 'var(--color-cyan-signal)' : 'var(--color-cream-muted)'} fontSize="10" fontFamily="monospace">
                  MCU &amp; DSP
                </text>
              </motion.g>

              {/* Wireless Telemetry */}
              <motion.g
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedComp('wireless')}
                className="cursor-pointer"
              >
                <rect
                  x="430"
                  y="230"
                  width="100"
                  height="50"
                  rx="4"
                  fill={selectedComp === 'wireless' ? 'var(--surface-active-cyan)' : 'var(--surface-elevated)'}
                  stroke={selectedComp === 'wireless' ? 'var(--color-cyan-signal)' : 'var(--cyan-stroke-dim)'}
                  strokeWidth={selectedComp === 'wireless' ? '2' : '1'}
                />
                {/* Signal arcs */}
                <path d="M470 255 A10 10 0 0 1 490 255" stroke="var(--color-cyan-signal)" strokeWidth="1.5" fill="none" />
                <path d="M465 250 A18 18 0 0 1 495 250" stroke="var(--color-cyan-signal)" strokeWidth="1" fill="none" opacity="0.6" />
                <text x="480" y="295" textAnchor="middle" fill={selectedComp === 'wireless' ? 'var(--color-cyan-signal)' : 'var(--color-cream-muted)'} fontSize="10" fontFamily="monospace">
                  BLE / WI-FI
                </text>
              </motion.g>

              {/* AI Processing */}
              <motion.g
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedComp('ai')}
                className="cursor-pointer"
              >
                <rect
                  x="240"
                  y="310"
                  width="120"
                  height="50"
                  rx="4"
                  fill={selectedComp === 'ai' ? 'var(--surface-active-ai)' : 'var(--surface-elevated)'}
                  stroke={selectedComp === 'ai' ? 'var(--color-medical)' : 'var(--medical-stroke-dim)'}
                  strokeWidth={selectedComp === 'ai' ? '2' : '1'}
                />
                {[0, 1, 2, 3, 4].map((i) => (
                  <rect
                    key={i}
                    x={250 + i * 22}
                    y="325"
                    width="14"
                    height="20"
                    fill="var(--color-medical)"
                    opacity={0.3 + i * 0.15}
                  />
                ))}
                <text x="300" y="380" textAnchor="middle" fill={selectedComp === 'ai' ? 'var(--color-medical)' : 'var(--color-cream-muted)'} fontSize="10" fontFamily="monospace">
                  AI PROCESSING
                </text>
              </motion.g>
            </svg>
          </div>

          {/* Interactive Specification Inspector Drawer */}
          <div className="flex flex-col justify-between rounded-sm border border-border bg-graphite-light/60 p-4 backdrop-blur-sm sm:p-6">
            <AnimatePresence mode="wait">
              {detail && (
                <motion.div
                  key={selectedComp}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 sm:space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-border pb-3 sm:pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-cyan-signal/30 bg-cyan-signal/[0.08] text-cyan-signal">
                        <IconComponent size={18} />
                      </div>
                      <div>
                        <span className="font-mono text-[9px] tracking-[0.2em] text-cyan-signal uppercase">
                          Technical Spec
                        </span>
                        <h3 className="font-display text-sm sm:text-base font-bold text-cream">
                          {detail.title}
                        </h3>
                      </div>
                    </div>
                    {selectedComp && (
                      <button
                        type="button"
                        onClick={() => setSelectedComp(null)}
                        className="text-cream-muted transition-colors hover:text-cream p-1"
                        aria-label="Close details"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <p className="text-xs leading-relaxed text-cream-muted">
                    {detail.summary}
                  </p>

                  <div className="space-y-2 sm:space-y-3">
                    <span className="font-mono text-[9px] tracking-[0.2em] text-cream-muted uppercase">
                      Hardware Parameters
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {detail.specList.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 rounded-sm border border-border/60 bg-graphite/60 px-3 py-2 font-mono text-[11px] sm:text-xs"
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

            <div className="mt-4 border-t border-border pt-3 text-center font-mono text-[9px] sm:text-[10px] text-cream-muted/60 sm:mt-6 sm:pt-4">
              Click elements in diagram to inspect sub-system
            </div>
          </div>
        </div>

        {/* Quick Component Cards */}
        <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5 md:gap-6 md:mt-12">
          {HARDWARE_COMPONENTS.map((comp) => {
            const isSelected = selectedComp === comp.id
            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => setSelectedComp(comp.id)}
                className={`border p-3 text-left transition-all duration-200 sm:p-4 min-h-[44px] ${isSelected
                    ? 'border-cyan-signal/60 bg-cyan-signal/[0.08] shadow-[0_0_12px_var(--accent-glow-soft)]'
                    : 'border-border bg-glass hover:border-cream/30 hover:bg-cream/[0.03]'
                  }`}
              >
                <span className="font-mono text-[8px] sm:text-[9px] tracking-[0.2em] text-cyan-signal uppercase block">
                  {comp.label}
                </span>
                <p className="mt-1 text-[11px] sm:text-xs text-cream-muted leading-tight">{comp.detail}</p>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
