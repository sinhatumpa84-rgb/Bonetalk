export type SignalCommand = 'YES' | 'NO' | 'HELP' | 'WATER'

export const SIGNAL_COMMANDS: SignalCommand[] = ['YES', 'NO', 'HELP', 'WATER']

export const SIGNAL_PATTERNS: Record<
  SignalCommand,
  { amplitude: number; frequency: number; burst: number; confidence: number }
> = {
  YES: { amplitude: 0.6, frequency: 2.2, burst: 0.3, confidence: 97.4 },
  NO: { amplitude: 0.85, frequency: 3.8, burst: 0.5, confidence: 95.1 },
  HELP: { amplitude: 1.0, frequency: 1.4, burst: 0.8, confidence: 94.8 },
  WATER: { amplitude: 0.75, frequency: 2.8, burst: 0.6, confidence: 96.2 },
}

export const NAV_LINKS = [
  { label: 'Technology', href: '#technology' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'AI', href: '#ai' },
  { label: 'Hardware', href: '#hardware' },
  { label: 'Vision', href: '#vision' },
] as const

export const PIPELINE_STAGES = [
  {
    id: 'muscle',
    number: '01',
    title: 'MUSCLE',
    description:
      'Voluntary muscle contractions generate electrical activity beneath the skin — the raw language of intent.',
  },
  {
    id: 'emg',
    number: '02',
    title: 'EMG SENSOR',
    description:
      'Surface electrodes capture microvolt-level signals from the forearm with clinical-grade sensitivity.',
  },
  {
    id: 'esp32',
    number: '03',
    title: 'ESP32-S3',
    description:
      'Embedded processing acquires, digitizes, and transmits signal data in real time via wireless communication.',
  },
  {
    id: 'ai',
    number: '04',
    title: 'AI MODEL',
    description:
      'Machine learning classifies unique muscle signatures into trained commands with adaptive confidence scoring.',
  },
  {
    id: 'intent',
    number: '05',
    title: 'INTENT',
    description:
      'Recognized patterns map to meaningful communication — yes, no, help, or custom phrases.',
  },
  {
    id: 'voice',
    number: '06',
    title: 'VOICE',
    description:
      'Intent becomes output — text display and synthesized speech that restore the power of expression.',
  },
] as const

export const HARDWARE_COMPONENTS = [
  { id: 'emg', label: 'EMG SENSOR', detail: 'Surface electrode array' },
  { id: 'acquisition', label: 'SIGNAL ACQUISITION', detail: 'Analog front-end' },
  { id: 'esp32', label: 'ESP32-S3', detail: 'Dual-core MCU' },
  { id: 'wireless', label: 'WIRELESS COMMUNICATION', detail: 'Wi-Fi / BLE' },
  { id: 'ai', label: 'AI PROCESSING', detail: 'Pattern classifier' },
] as const

export const AI_PIPELINE = [
  'RAW EMG',
  'FILTER',
  'FEATURES',
  'PATTERN',
  'CLASSIFIER',
  'INTENT',
] as const

export function generateWaveformPoint(
  x: number,
  time: number,
  amplitude: number,
  frequency: number,
  burst: number
): number {
  const envelope = 0.5 + 0.5 * Math.sin(time * burst * 0.8)
  const base = Math.sin(x * frequency + time * 3) * amplitude * envelope
  const noise = (Math.random() - 0.5) * 0.08 * amplitude
  const spike =
    Math.sin(x * 12 + time * 5) > 0.92 ? amplitude * 0.4 * Math.random() : 0
  return base + noise + spike
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
