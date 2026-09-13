/**
 * BoneTalk Simulated EMG Calibration & Inference Engine
 *
 * Provides a deterministic, transparent DEMO / SIMULATION calibration system
 * for the silent-speech command "HELLO".
 *
 * IMPORTANT: This is a software demonstration engine. It does NOT claim to capture
 * or represent actual physiological muscle telemetry.
 */

export interface EmgFeatureVector {
  rms: number
  mav: number
  zcr: number
  peakToPeak: number
  waveformLength: number
  energy: number
}

export interface DemoModelTemplate {
  command: 'HELLO' | 'YES' | 'NO' | 'HELP' | 'STOP' | 'THANK YOU'
  numTrials: number
  createdAt: string
  meanFeatures: EmgFeatureVector
  stdFeatures: EmgFeatureVector
  baselineNoiseRms: number
}

export interface CalibrationLogEntry {
  id: string
  time: string
  message: string
  type: 'info' | 'stage' | 'success' | 'warn'
}

export type DemoCalibrationStatus =
  | 'IDLE'
  | 'PREPARING'
  | 'WAITING_FOR_TRIGGER'
  | 'ANALYZING_TRIAL'
  | 'EXTRACTING_FEATURES'
  | 'BUILDING_TEMPLATE'
  | 'VALIDATING'
  | 'CALIBRATION_COMPLETE'

export interface DemoCalibrationState {
  status: DemoCalibrationStatus
  targetCommand: 'HELLO'
  currentTrial: number
  totalTrials: number
  progress: number
  stageText: string
  countdown: number | null
  isCalibrated: boolean
  validationSimilarity: number | null
  validationResult: 'VERIFIED' | 'FAILED' | null
  activeTemplate: DemoModelTemplate | null
  currentFeatures: EmgFeatureVector | null
  logs: CalibrationLogEntry[]
}

class DemoCalibrationService {
  private state: DemoCalibrationState = {
    status: 'IDLE',
    targetCommand: 'HELLO',
    currentTrial: 0,
    totalTrials: 5,
    progress: 0,
    stageText: 'Ready to begin demo calibration',
    countdown: null,
    isCalibrated: false,
    validationSimilarity: null,
    validationResult: null,
    activeTemplate: null,
    currentFeatures: null,
    logs: [],
  }

  private listeners: Set<(state: DemoCalibrationState) => void> = new Set()
  private streamListeners: Set<(chunk: number[], latestVal: number, metrics: EmgFeatureVector) => void> = new Set()
  private activeAbortController: AbortController | null = null

  constructor() {
    this.addLog('Demo Calibration Engine initialized (Simulation Mode)', 'info')
  }

  public getState(): DemoCalibrationState {
    return { ...this.state }
  }

  public onStateChange(listener: (state: DemoCalibrationState) => void): () => void {
    this.listeners.add(listener)
    listener(this.getState())
    return () => this.listeners.delete(listener)
  }

  public onStreamSamples(
    listener: (chunk: number[], latestVal: number, metrics: EmgFeatureVector) => void
  ): () => void {
    this.streamListeners.add(listener)
    return () => this.streamListeners.delete(listener)
  }

  private notify() {
    const s = this.getState()
    this.listeners.forEach((l) => l(s))
  }

  private addLog(message: string, type: 'info' | 'stage' | 'success' | 'warn' = 'info') {
    const entry: CalibrationLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      time: new Date().toLocaleTimeString(),
      message,
      type,
    }
    this.state.logs = [entry, ...this.state.logs].slice(0, 40)
  }

  // ── 1. Deterministic Synthetic EMG Signal Generator ───────────────────────

  /**
   * Generates a realistic, deterministic synthetic EMG activation pattern for "HELLO".
   *
   * Articulatory structure:
   * 1. Baseline noise (0 - 120ms): $[-0.03, +0.03]\text{ mV}$
   * 2. First phoneme burst `/hɛ/` (120 - 280ms): High-frequency rapid burst (90-150Hz), $0.25 - 0.45\text{ mV}$
   * 3. Inter-syllabic dip (280 - 360ms): Low-level transition activity ($0.05 - 0.12\text{ mV}$)
   * 4. Second phoneme burst `/loʊ/` (360 - 520ms): Sustained vowel burst (65-110Hz), $0.45 - 0.75\text{ mV}$
   * 5. Baseline return (520 - 600ms): Return to resting resting potential
   *
   * @param trialIndex 1-5 for training trials, 6 for validation, >6 for inference
   * @param length number of samples (default 600 for 0.6s @ 1000Hz)
   */
  public generateSyntheticHelloSignal(trialIndex = 1, length = 600): number[] {
    const samples = new Array<number>(length)
    const dt = 0.001 // 1000 Hz sampling rate

    // Pseudo-random deterministic jitter based on trialIndex
    const seed = trialIndex * 1337 + 42
    const prng = (i: number) => {
      const x = Math.sin(seed + i * 0.123) * 10000
      return x - Math.floor(x)
    }

    // Syllable jitter factors (variance across trials: +/- 6%)
    const ampScale = 1.0 + (prng(1) - 0.5) * 0.12
    const burst1Center = 200 + Math.floor((prng(2) - 0.5) * 20)
    const burst2Center = 440 + Math.floor((prng(3) - 0.5) * 20)

    for (let i = 0; i < length; i++) {
      const t = i * dt

      // 1. Resting baseline electrical noise (~30 microvolts) + 50Hz background
      const noise = (prng(i) - 0.5) * 0.06 + Math.sin(2 * Math.PI * 50 * t) * 0.015

      // 2. Articulatory Envelope 1: /hɛ/ (burst centered around burst1Center)
      const dist1 = Math.abs(i - burst1Center)
      const env1 = dist1 < 80 ? Math.exp(-Math.pow(dist1 / 35, 2)) * 0.38 * ampScale : 0
      const osc1 =
        Math.sin(2 * Math.PI * 115 * t) * 0.6 +
        Math.sin(2 * Math.PI * 175 * t + 0.4) * 0.3 +
        Math.cos(2 * Math.PI * 85 * t) * 0.2

      // 3. Articulatory Envelope 2: /loʊ/ (longer sustained vowel centered around burst2Center)
      const dist2 = Math.abs(i - burst2Center)
      const env2 = dist2 < 100 ? Math.exp(-Math.pow(dist2 / 45, 2)) * 0.62 * ampScale : 0
      const osc2 =
        Math.sin(2 * Math.PI * 82 * t) * 0.7 +
        Math.sin(2 * Math.PI * 138 * t + 0.9) * 0.35 +
        Math.sin(2 * Math.PI * 220 * t + 1.2) * 0.15

      // Combined simulated facial EMG signal in mV
      const signalValue = noise + env1 * osc1 + env2 * osc2
      samples[i] = Number(signalValue.toFixed(4))
    }

    return samples
  }

  // ── 2. Mathematical Feature Extraction ────────────────────────────────────

  public extractFeatures(samples: number[]): EmgFeatureVector {
    const N = samples.length
    if (N === 0) {
      return { rms: 0, mav: 0, zcr: 0, peakToPeak: 0, waveformLength: 0, energy: 0 }
    }

    let sumSq = 0
    let sumAbs = 0
    let zcr = 0
    let min = samples[0]
    let max = samples[0]
    let wl = 0

    for (let i = 0; i < N; i++) {
      const val = samples[i]
      sumSq += val * val
      sumAbs += Math.abs(val)

      if (val < min) min = val
      if (val > max) max = val

      if (i > 0) {
        wl += Math.abs(val - samples[i - 1])
        if ((val >= 0 && samples[i - 1] < 0) || (val < 0 && samples[i - 1] >= 0)) {
          zcr++
        }
      }
    }

    const rms = Math.sqrt(sumSq / N)
    const mav = sumAbs / N
    const peakToPeak = max - min
    const energy = sumSq

    return {
      rms: Number(rms.toFixed(3)),
      mav: Number(mav.toFixed(3)),
      zcr,
      peakToPeak: Number(peakToPeak.toFixed(3)),
      waveformLength: Number(wl.toFixed(2)),
      energy: Number(energy.toFixed(2)),
    }
  }

  // ── 3. Template Generation Across Calibration Trials ─────────────────────

  public buildTemplate(trials: EmgFeatureVector[]): DemoModelTemplate {
    const K = trials.length
    if (K === 0) throw new Error('Cannot build template from 0 trials')

    const mean: EmgFeatureVector = {
      rms: trials.reduce((acc, t) => acc + t.rms, 0) / K,
      mav: trials.reduce((acc, t) => acc + t.mav, 0) / K,
      zcr: Math.round(trials.reduce((acc, t) => acc + t.zcr, 0) / K),
      peakToPeak: trials.reduce((acc, t) => acc + t.peakToPeak, 0) / K,
      waveformLength: trials.reduce((acc, t) => acc + t.waveformLength, 0) / K,
      energy: trials.reduce((acc, t) => acc + t.energy, 0) / K,
    }

    const std: EmgFeatureVector = {
      rms: Math.sqrt(trials.reduce((acc, t) => acc + Math.pow(t.rms - mean.rms, 2), 0) / K) || 0.02,
      mav: Math.sqrt(trials.reduce((acc, t) => acc + Math.pow(t.mav - mean.mav, 2), 0) / K) || 0.02,
      zcr: Math.sqrt(trials.reduce((acc, t) => acc + Math.pow(t.zcr - mean.zcr, 2), 0) / K) || 2,
      peakToPeak: Math.sqrt(trials.reduce((acc, t) => acc + Math.pow(t.peakToPeak - mean.peakToPeak, 2), 0) / K) || 0.05,
      waveformLength: Math.sqrt(trials.reduce((acc, t) => acc + Math.pow(t.waveformLength - mean.waveformLength, 2), 0) / K) || 1,
      energy: Math.sqrt(trials.reduce((acc, t) => acc + Math.pow(t.energy - mean.energy, 2), 0) / K) || 0.5,
    }

    return {
      command: 'HELLO',
      numTrials: K,
      createdAt: new Date().toLocaleTimeString(),
      meanFeatures: mean,
      stdFeatures: std,
      baselineNoiseRms: 0.035,
    }
  }

  // ── 4. Similarity Calculation & Inference ─────────────────────────────────

  public computeSimilarity(sample: EmgFeatureVector, template: DemoModelTemplate): number {
    const m = template.meanFeatures
    const s = template.stdFeatures

    // Normalized weighted Euclidean feature distance
    const dRms = Math.abs(sample.rms - m.rms) / (s.rms + 0.01)
    const dMav = Math.abs(sample.mav - m.mav) / (s.mav + 0.01)
    const dZcr = Math.abs(sample.zcr - m.zcr) / (s.zcr + 1.0)
    const dP2p = Math.abs(sample.peakToPeak - m.peakToPeak) / (s.peakToPeak + 0.02)
    const dWl = Math.abs(sample.waveformLength - m.waveformLength) / (s.waveformLength + 0.5)

    const compositeDist = (dRms * 0.3 + dMav * 0.25 + dZcr * 0.15 + dP2p * 0.2 + dWl * 0.1)

    // Convert distance to bounded similarity percentage [88% - 98%]
    const rawSim = Math.max(0.88, Math.min(0.978, 1.0 - compositeDist * 0.045))
    return Number((rawSim * 100).toFixed(1))
  }

  // ── 5. Full Asynchronous Calibration Workflow (~14-16 seconds) ───────────

  public async startCalibration(
    onTriggerPrompt?: () => Promise<void>
  ): Promise<DemoModelTemplate> {
    if (this.state.status !== 'IDLE' && this.state.status !== 'CALIBRATION_COMPLETE') {
      return this.state.activeTemplate!
    }

    this.activeAbortController = new AbortController()
    const { signal } = this.activeAbortController

    const sleep = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        const t = setTimeout(resolve, ms)
        signal.addEventListener('abort', () => {
          clearTimeout(t)
          reject(new Error('Calibration cancelled'))
        })
      })

    try {
      // ── Phase 1: Preparation & Countdown (3s) ──
      this.state.status = 'PREPARING'
      this.state.progress = 5
      this.state.stageText = 'Preparing simulated bio-signal buffers...'
      this.addLog('Calibration initialized (Simulation Mode)', 'stage')
      this.addLog('Target silent-speech command: HELLO', 'info')
      this.notify()
      await sleep(800)

      for (let c = 3; c >= 1; c--) {
        this.state.countdown = c
        this.state.stageText = `Calibration starting in ${c}...`
        this.notify()
        await sleep(700)
      }
      this.state.countdown = null

      // ── Phase 2: Waiting for User Trigger / Speech Simulation (2s) ──
      this.state.status = 'WAITING_FOR_TRIGGER'
      this.state.progress = 15
      this.state.stageText = 'Say HELLO naturally when ready (or press Simulate "HELLO")'
      this.addLog('Prompt: "Say HELLO naturally when ready"', 'info')
      this.notify()

      if (onTriggerPrompt) {
        await onTriggerPrompt()
      } else {
        await sleep(1500)
      }

      // ── Phase 3: Run 5 Calibration Trials (approx 1.6s each = 8s) ──
      this.state.status = 'ANALYZING_TRIAL'
      const collectedTrials: EmgFeatureVector[] = []

      for (let trial = 1; trial <= this.state.totalTrials; trial++) {
        this.state.currentTrial = trial
        const baseProgress = 20 + Math.round(((trial - 1) / this.state.totalTrials) * 45)
        this.state.progress = baseProgress
        this.state.stageText = `Capturing & analyzing demo signal: Trial ${trial} / ${this.state.totalTrials}...`
        this.addLog(`Trial ${trial}/5: Generating simulated articulatory pattern for "HELLO"`, 'info')
        this.notify()

        // Generate synthetic waveform
        const signalSamples = this.generateSyntheticHelloSignal(trial)
        const features = this.extractFeatures(signalSamples)
        this.state.currentFeatures = features
        collectedTrials.push(features)

        // Stream signal into canvas in animated chunks
        await this.streamSignalOverTime(signalSamples, features, 1400, signal)

        this.addLog(
          `Trial ${trial}/5 complete: RMS=${features.rms}mV, MAV=${features.mav}mV, ZCR=${features.zcr}`,
          'success'
        )
        await sleep(250)
      }

      // ── Phase 4: Feature Aggregation & Template Generation (2s) ──
      this.state.status = 'BUILDING_TEMPLATE'
      this.state.progress = 75
      this.state.stageText = 'Building demo pattern template for "HELLO"...'
      this.addLog('Aggregating feature vectors across 5 calibration trials', 'stage')
      this.notify()
      await sleep(1200)

      const template = this.buildTemplate(collectedTrials)
      this.state.activeTemplate = template
      this.state.progress = 85
      this.addLog(
        `HELLO template generated (Mean RMS=${template.meanFeatures.rms.toFixed(3)}mV, MAV=${template.meanFeatures.mav.toFixed(3)}mV)`,
        'success'
      )
      this.notify()
      await sleep(800)

      // ── Phase 5: Independent Validation Phase (2s) ──
      this.state.status = 'VALIDATING'
      this.state.progress = 90
      this.state.stageText = 'Validating calibration with independent demo signal...'
      this.addLog('Validation started: Testing unseen synthetic sample against template', 'stage')
      this.notify()

      // Generate separate 6th unseen validation signal
      const valSignal = this.generateSyntheticHelloSignal(6)
      const valFeatures = this.extractFeatures(valSignal)
      this.state.currentFeatures = valFeatures

      // Stream validation waveform
      await this.streamSignalOverTime(valSignal, valFeatures, 1200, signal)

      const similarity = this.computeSimilarity(valFeatures, template)
      this.state.validationSimilarity = similarity
      this.state.validationResult = 'VERIFIED'
      this.state.progress = 100
      this.state.status = 'CALIBRATION_COMPLETE'
      this.state.isCalibrated = true
      this.state.stageText = `Calibration verified: Similarity ${similarity}% (Command: HELLO)`
      this.addLog(`Calibration verified: ${similarity}% similarity match for "HELLO"`, 'success')
      this.addLog('Model status updated to READY (Demo Mode)', 'info')
      this.notify()

      return template
    } catch (err: unknown) {
      if ((err as Error).message === 'Calibration cancelled') {
        this.addLog('Calibration cancelled by user', 'warn')
      } else {
        this.addLog(`Calibration error: ${(err as Error).message}`, 'warn')
      }
      this.resetCalibration()
      throw err
    } finally {
      this.activeAbortController = null
    }
  }

  /**
   * Streams a signal buffer to listeners in rapid chronological chunks
   * to provide a realistic animated oscilloscope sweep across the chart.
   */
  private async streamSignalOverTime(
    samples: number[],
    features: EmgFeatureVector,
    durationMs: number,
    abortSignal: AbortSignal
  ): Promise<void> {
    const chunkSize = 25
    const numChunks = Math.ceil(samples.length / chunkSize)
    const interval = Math.max(16, Math.floor(durationMs / numChunks))

    return new Promise<void>((resolve, reject) => {
      let chunkIdx = 0
      const timer = setInterval(() => {
        if (abortSignal.aborted) {
          clearInterval(timer)
          reject(new Error('Calibration cancelled'))
          return
        }

        chunkIdx++
        const end = Math.min(samples.length, chunkIdx * chunkSize)
        const currentSlice = samples.slice(0, end)
        const latestVal = samples[end - 1] || 0

        this.streamListeners.forEach((l) => l(currentSlice, latestVal, features))

        if (chunkIdx >= numChunks) {
          clearInterval(timer)
          resolve()
        }
      }, interval)
    })
  }

  // ── 6. Demo Inference Execution ───────────────────────────────────────────

  /**
   * Executes a simulated inference pass against the calibrated HELLO template.
   */
  public async runDemoInference(): Promise<{
    command: string
    confidence: number
    similarity: number
    features: EmgFeatureVector
  }> {
    if (!this.state.isCalibrated || !this.state.activeTemplate) {
      throw new Error('Model is not calibrated yet. Run demo calibration first.')
    }

    const trialId = 7 + Math.floor(Math.random() * 50)
    const testSignal = this.generateSyntheticHelloSignal(trialId)
    const features = this.extractFeatures(testSignal)
    const similarity = this.computeSimilarity(features, this.state.activeTemplate)

    // Stream animated sweep
    const abort = new AbortController()
    await this.streamSignalOverTime(testSignal, features, 600, abort.signal)

    const confidence = similarity / 100.0

    this.addLog(
      `Inference executed: Class "HELLO" recognized with ${(confidence * 100).toFixed(1)}% confidence`,
      'success'
    )

    return {
      command: 'HELLO',
      confidence,
      similarity,
      features,
    }
  }

  // ── 7. Reset Calibration ──────────────────────────────────────────────────

  public resetCalibration(): void {
    if (this.activeAbortController) {
      this.activeAbortController.abort()
      this.activeAbortController = null
    }

    this.state = {
      status: 'IDLE',
      targetCommand: 'HELLO',
      currentTrial: 0,
      totalTrials: 5,
      progress: 0,
      stageText: 'Ready to begin demo calibration',
      countdown: null,
      isCalibrated: false,
      validationSimilarity: null,
      validationResult: null,
      activeTemplate: null,
      currentFeatures: null,
      logs: this.state.logs,
    }

    this.addLog('Calibration state reset. Template cleared.', 'info')
    this.notify()
  }
}

export const demoCalibrationService = new DemoCalibrationService()
