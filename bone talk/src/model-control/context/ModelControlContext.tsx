import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { mqttService } from '../services/mqttService'
import type { MqttConfig, MqttConnectionStatus, SensorPayload } from '../services/mqttService'
import { modelService } from '../services/modelService'
import type { ModelStatusResponse, ModelSystemStatus } from '../services/modelService'
import { speechService } from '../../lib/speechService'

import { webSerialService } from '../../services/webSerialService'
import type { WebSerialDetails } from '../../services/webSerialService'
import type { DevicePresenceStatus, DeviceMetadata } from '../services/mqttService'

export interface PredictionHistoryEntry {
  id: string
  time: string
  command: string
  confidence: number | null
  source: 'MQTT' | 'API' | 'Stream'
}

export interface EmgMetrics {
  rms: number | null
  mav: number | null
  zcr: number | null
  peakToPeak: number | null
}

export interface ImuReading {
  accel: { x: number | null; y: number | null; z: number | null }
  gyro: { x: number | null; y: number | null; z: number | null }
}

export interface DeviceHealth {
  battery: number | null
  rssi: number | null
  packetRate: number | null
  lastPacketTime: string | null
  noiseLevel: number | null
  speechDetected: boolean | null
  vibration: boolean | null
  status: string | null
}

export interface ControlSettings {
  activeModel?: string
  inferenceThreshold?: number
  smoothingWindow?: number
  voiceOutputEnabled: boolean
  autoSpeak: boolean
  speechRate: number
  selectedVoiceName: string | null
  mqttBrokerUrl: string
  mqttPort: number
  mqttUsername: string
  mqttPassword: string
  mqttClientId: string
  subscribeTopic: string
  publishTopic: string
  deviceId: string
  connectionType: 'mqtt-ws' | 'backend-ws' | 'serial'
}

import { demoCalibrationService } from '../services/demoCalibrationService'
import type { DemoCalibrationState } from '../services/demoCalibrationService'

const DEFAULT_SETTINGS: ControlSettings = {
  activeModel: 'random-forest-emg',
  inferenceThreshold: 0.7,
  smoothingWindow: 5,
  voiceOutputEnabled: true,
  autoSpeak: false,
  speechRate: 1.0,
  selectedVoiceName: null,
  mqttBrokerUrl: import.meta.env.VITE_MQTT_URL || 'wss://broker.emqx.io:8084/mqtt',
  mqttPort: import.meta.env.VITE_MQTT_PORT ? parseInt(import.meta.env.VITE_MQTT_PORT, 10) : 8084,
  mqttUsername: import.meta.env.VITE_MQTT_USERNAME || '',
  mqttPassword: import.meta.env.VITE_MQTT_PASSWORD || '',
  mqttClientId: import.meta.env.VITE_MQTT_CLIENT_ID || '',
  subscribeTopic: import.meta.env.VITE_MQTT_TOPIC || 'bonetalk/device/#',
  publishTopic: 'bonetalk/device/commands',
  deviceId: import.meta.env.VITE_DEVICE_ID || 'BONE-01',
  connectionType: 'mqtt-ws',
}

interface ModelControlContextValue {
  // Model state
  modelStatus: ModelSystemStatus
  modelInfo: ModelStatusResponse | null
  backendUrl: string
  setBackendUrl: (url: string) => void
  refreshModelStatus: () => Promise<void>
  testModelWithUtterance: (word: string) => Promise<void>

  // Hardware / MQTT connection
  connectionStatus: MqttConnectionStatus
  connectionError: string | null
  settings: ControlSettings
  updateSettings: (partial: Partial<ControlSettings>) => void
  connectHardware: () => void
  disconnectHardware: () => void
  sendCommand: (cmd: string, args?: Record<string, unknown>) => boolean

  // Real Device Presence, Handshake & ACK
  devicePresence: DevicePresenceStatus
  handshakeStatus: 'SUCCESS' | 'PENDING' | 'FAILED' | 'IDLE'
  lastHandshakeLatency: number | null
  lastHeartbeatAge: number | null
  deviceMetadata: DeviceMetadata
  systemReadiness: 'READY' | 'SYSTEM NOT READY'
  executeHandshake: () => Promise<{ success: boolean; latencyMs: number; error?: string }>
  sendCommandWithAck: (cmd: string, args?: Record<string, unknown>, timeoutMs?: number) => Promise<{ success: boolean; ack?: Record<string, unknown>; error?: string }>

  // Real Web Serial
  serialDetails: WebSerialDetails
  connectSerial: (baudRate?: number) => Promise<boolean>
  disconnectSerial: () => Promise<void>

  // Live telemetry (strictly real, null when disconnected)
  hasSensorData: boolean
  rawEmgSamples: number[]
  latestEmgValue: number | null
  emgMetrics: EmgMetrics
  imu: ImuReading
  deviceHealth: DeviceHealth

  // Model prediction & Voice
  latestPrediction: {
    command: string | null
    confidence: number | null
    signalQuality: string | null
    timestamp: string | null
    modelStatus: string
  }
  detectedMessage: string | null
  predictionHistory: PredictionHistoryEntry[]
  speakDetectedMessage: () => void
  clearDetectedMessage: () => void
  clearPredictionHistory: () => void

  // Demo / Simulated Calibration & Inference
  demoCalibration: DemoCalibrationState
  startDemoCalibration: (onPrompt?: () => Promise<void>) => Promise<void>
  triggerHelloAction: () => void
  runDemoInference: () => Promise<void>
  resetDemoCalibration: () => void
  isDemoStreamActive: boolean

  // Pipeline Statuses
  pipeline: {
    hardware: 'ONLINE' | 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'OFFLINE'
    sensors: 'RECEIVING' | 'WAITING' | 'DISCONNECTED' | 'IDLE'
    processing: 'ACTIVE' | 'WAITING' | 'DISCONNECTED' | 'STANDBY' | 'OFFLINE'
    mqtt: 'CONNECTED' | 'BROKER READY — NO DEVICE' | 'CONNECTING' | 'DISCONNECTED' | 'ERROR'
    model: 'READY' | 'LOADING' | 'CALIBRATING' | 'VALIDATING' | 'UNAVAILABLE' | 'ERROR'
    prediction: 'ACTIVE' | 'WAITING' | 'ANALYZING' | 'IDLE' | string
    output: 'READY' | 'SPEAKING' | 'IDLE'
  }
}

const ModelControlContext = createContext<ModelControlContextValue | null>(null)

export const ModelControlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ── Settings ──
  const [settings, setSettings] = useState<ControlSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bonetalk_control_settings')
        if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
      } catch {
        // use default
      }
    }
    return DEFAULT_SETTINGS
  })

  const updateSettings = useCallback((partial: Partial<ControlSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial }
      try {
        localStorage.setItem('bonetalk_control_settings', JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  // ── Model Connection State ──
  const [modelStatus, setModelStatus] = useState<ModelSystemStatus>('Loading')
  const [modelInfo, setModelInfo] = useState<ModelStatusResponse | null>(null)
  const [backendUrl, setBackendUrlState] = useState<string>(() => modelService.getBackendUrl())

  const setBackendUrl = useCallback((url: string) => {
    modelService.setBackendUrl(url)
    setBackendUrlState(url)
  }, [])

  const refreshModelStatus = useCallback(async () => {
    setModelStatus('Loading')
    const info = await modelService.checkStatus()
    if (info?.model_loaded) {
      setModelStatus('Ready')
      setModelInfo(info)
    } else {
      setModelStatus('Unavailable')
      setModelInfo(info || null)
    }
  }, [])

  useEffect(() => {
    modelService.startPolling(10000)
    const unsub = modelService.onStatusChange((status, info) => {
      setModelStatus(status)
      if (info) setModelInfo(info)
    })
    return () => {
      modelService.stopPolling()
      unsub()
    }
  }, [])

  // ── MQTT / Hardware Connection ──
  const [connectionStatus, setConnectionStatus] = useState<MqttConnectionStatus>('Disconnected')
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // ── Real Hardware Presence, Handshake & ACK State ──
  const [devicePresence, setDevicePresence] = useState<DevicePresenceStatus>('OFFLINE')
  const [handshakeStatus, setHandshakeStatus] = useState<'SUCCESS' | 'PENDING' | 'FAILED' | 'IDLE'>('IDLE')
  const [lastHandshakeLatency, setLastHandshakeLatency] = useState<number | null>(null)
  const [deviceMetadata, setDeviceMetadata] = useState<DeviceMetadata>({
    firmware: undefined,
    modelVersion: undefined,
    lastHeartbeatTimestamp: null,
    deviceId: settings.deviceId,
  })
  const [lastHeartbeatAge, setLastHeartbeatAge] = useState<number | null>(null)

  // ── Real Web Serial State ──
  const [serialDetails, setSerialDetails] = useState<WebSerialDetails>(() => webSerialService.getDetails())

  useEffect(() => {
    const unsubSerial = webSerialService.onStatusChange(setSerialDetails)
    return unsubSerial
  }, [])

  const connectSerial = useCallback(async (baudRate = 115200) => {
    return webSerialService.connect(baudRate)
  }, [])

  const disconnectSerial = useCallback(async () => {
    return webSerialService.disconnect()
  }, [])

  // Sync configured device ID
  useEffect(() => {
    mqttService.setConfiguredDeviceId(settings.deviceId)
  }, [settings.deviceId])

  // Recalculate lastHeartbeatAge live every 1 second
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (deviceMetadata.lastHeartbeatTimestamp) {
        const ageSec = Math.max(0, Math.round((Date.now() - deviceMetadata.lastHeartbeatTimestamp) / 1000))
        setLastHeartbeatAge(ageSec)
      } else {
        setLastHeartbeatAge(null)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [deviceMetadata.lastHeartbeatTimestamp])

  useEffect(() => {
    const unsub = mqttService.onStatusChange((status, error, details) => {
      setConnectionStatus(status)
      if (error) setConnectionError(error)
      else if (status === 'Connected') setConnectionError(null)

      if (details) {
        setDevicePresence(details.devicePresence)
        setDeviceMetadata(details.deviceMetadata)
        if (details.handshakeVerified) {
          setHandshakeStatus('SUCCESS')
        } else if (details.devicePresence === 'OFFLINE') {
          setHandshakeStatus('IDLE')
        }
      }
    })
    return unsub
  }, [])

  const connectHardware = useCallback(() => {
    const config: MqttConfig = {
      brokerUrl: settings.mqttBrokerUrl,
      clientId: settings.mqttClientId || `bonetalk_${Math.random().toString(16).substring(2, 6)}`,
      username: settings.mqttUsername || undefined,
      password: settings.mqttPassword || undefined,
      subscribeTopic: settings.subscribeTopic,
      publishTopic: settings.publishTopic,
    }
    mqttService.connect(config)
  }, [settings])

  const disconnectHardware = useCallback(() => {
    mqttService.disconnect()
    setDevicePresence('OFFLINE')
    setHandshakeStatus('IDLE')
    setLastHandshakeLatency(null)
    setLastHeartbeatAge(null)
    setHasSensorData(false)
    setLatestEmgValue(null)
    setDeviceHealth({
      battery: null,
      rssi: null,
      packetRate: null,
      lastPacketTime: null,
      noiseLevel: null,
      speechDetected: null,
      vibration: null,
      status: null,
    })
    setImu({
      accel: { x: null, y: null, z: null },
      gyro: { x: null, y: null, z: null },
    })
  }, [])

  const sendCommand = useCallback((cmd: string, args: Record<string, unknown> = {}) => {
    return mqttService.sendCommand(cmd, args)
  }, [])

  const executeHandshake = useCallback(async () => {
    setHandshakeStatus('PENDING')
    try {
      const res = await mqttService.handshake(settings.deviceId, 5000)
      if (res.success) {
        setHandshakeStatus('SUCCESS')
        setLastHandshakeLatency(res.latencyMs)
      } else {
        setHandshakeStatus('FAILED')
      }
      return res
    } catch (err: unknown) {
      setHandshakeStatus('FAILED')
      const msg = err instanceof Error ? err.message : 'Handshake failed'
      return { success: false, latencyMs: 0, error: msg }
    }
  }, [settings.deviceId])

  const sendCommandWithAck = useCallback(
    async (cmd: string, args: Record<string, unknown> = {}, timeoutMs = 5000) => {
      return mqttService.sendCommandWithAck(cmd, { device_id: settings.deviceId, ...args }, timeoutMs)
    },
    [settings.deviceId]
  )

  // ── Real Live Telemetry ──
  const [hasSensorData, setHasSensorData] = useState<boolean>(false)
  const [rawEmgSamples, setRawEmgSamples] = useState<number[]>([])
  const [latestEmgValue, setLatestEmgValue] = useState<number | null>(null)
  const [emgMetrics, setEmgMetrics] = useState<EmgMetrics>({
    rms: null,
    mav: null,
    zcr: null,
    peakToPeak: null,
  })
  const [imu, setImu] = useState<ImuReading>({
    accel: { x: null, y: null, z: null },
    gyro: { x: null, y: null, z: null },
  })
  const [deviceHealth, setDeviceHealth] = useState<DeviceHealth>({
    battery: null,
    rssi: null,
    packetRate: null,
    lastPacketTime: null,
    noiseLevel: null,
    speechDetected: null,
    vibration: null,
    status: null,
  })

  // Packet counters for calculating true packet rate
  const packetCountRef = useRef<number>(0)
  const lastPacketRateTimeRef = useRef<number>(Date.now())
  const sensorTimeoutRef = useRef<number | null>(null)

  // ── Predictions & Output ──
  const [latestPrediction, setLatestPrediction] = useState<{
    command: string | null
    confidence: number | null
    signalQuality: string | null
    timestamp: string | null
    modelStatus: string
  }>({
    command: null,
    confidence: null,
    signalQuality: null,
    timestamp: null,
    modelStatus: 'Waiting',
  })

  const [detectedMessage, setDetectedMessage] = useState<string | null>(null)
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistoryEntry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bonetalk_prediction_history')
        if (saved) return JSON.parse(saved)
      } catch {
        // ignore
      }
    }
    return []
  })

  // Save history to localStorage
  const addPredictionHistory = useCallback((entry: Omit<PredictionHistoryEntry, 'id'>) => {
    setPredictionHistory((prev) => {
      const newEntry: PredictionHistoryEntry = {
        ...entry,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      }
      const updated = [newEntry, ...prev].slice(0, 50)
      try {
        localStorage.setItem('bonetalk_prediction_history', JSON.stringify(updated))
      } catch {
        // ignore
      }
      return updated
    })
  }, [])

  // Process incoming real MQTT sensor payloads
  useEffect(() => {
    const unsub = mqttService.onMessage((_topic, payload: SensorPayload) => {
      const now = Date.now()
      packetCountRef.current += 1
      setHasSensorData(true)

      // Reset activity timeout to detect dropped feed
      if (sensorTimeoutRef.current) clearTimeout(sensorTimeoutRef.current)
      sensorTimeoutRef.current = window.setTimeout(() => {
        setHasSensorData(false)
      }, 5000)

      // Calculate packet rate every second
      if (now - lastPacketRateTimeRef.current >= 1000) {
        const seconds = (now - lastPacketRateTimeRef.current) / 1000
        const rate = Math.round(packetCountRef.current / seconds)
        packetCountRef.current = 0
        lastPacketRateTimeRef.current = now

        setDeviceHealth((prev) => ({
          ...prev,
          packetRate: rate,
          lastPacketTime: new Date().toLocaleTimeString(),
        }))
      }

      // Update Device Health & Telemetry if provided in packet
      if (
        payload.battery !== undefined ||
        payload.rssi !== undefined ||
        payload.noise_level !== undefined ||
        payload.speech_detected !== undefined ||
        payload.vibration !== undefined ||
        payload.status !== undefined
      ) {
        setDeviceHealth((prev) => ({
          ...prev,
          battery: payload.battery !== undefined ? payload.battery : prev.battery,
          rssi: payload.rssi !== undefined ? payload.rssi : prev.rssi,
          noiseLevel: payload.noise_level !== undefined ? payload.noise_level : prev.noiseLevel,
          speechDetected: payload.speech_detected !== undefined ? payload.speech_detected : prev.speechDetected,
          vibration: payload.vibration !== undefined ? payload.vibration : prev.vibration,
          status: payload.status !== undefined ? payload.status : prev.status,
          lastPacketTime: new Date().toLocaleTimeString(),
        }))
      }

      // Update IMU if present
      if (payload.accel || payload.gyro) {
        setImu({
          accel: payload.accel
            ? { x: payload.accel.x, y: payload.accel.y, z: payload.accel.z }
            : { x: null, y: null, z: null },
          gyro: payload.gyro
            ? { x: payload.gyro.x, y: payload.gyro.y, z: payload.gyro.z }
            : { x: null, y: null, z: null },
        })
      }

      // Process EMG samples
      if (payload.emg !== undefined) {
        const samples: number[] = Array.isArray(payload.emg) ? payload.emg : [payload.emg]
        const latest = samples[samples.length - 1]
        setLatestEmgValue(latest)

        setRawEmgSamples((prev) => {
          const next = [...prev, ...samples].slice(-250) // keep 250 data points for waveform
          
          // Calculate true RMS, MAV, ZCR over window
          if (next.length > 5) {
            let sumSq = 0
            let sumAbs = 0
            let zcrCount = 0
            let minVal = next[0]
            let maxVal = next[0]

            for (let i = 0; i < next.length; i++) {
              const v = next[i]
              sumSq += v * v
              sumAbs += Math.abs(v)
              if (v < minVal) minVal = v
              if (v > maxVal) maxVal = v
              if (i > 0 && ((next[i - 1] >= 0 && v < 0) || (next[i - 1] < 0 && v >= 0))) {
                zcrCount++
              }
            }

            const rms = Math.sqrt(sumSq / next.length)
            const mav = sumAbs / next.length
            const zcr = Math.round((zcrCount / next.length) * 1000)

            setEmgMetrics({
              rms: parseFloat(rms.toFixed(2)),
              mav: parseFloat(mav.toFixed(2)),
              zcr,
              peakToPeak: parseFloat((maxVal - minVal).toFixed(2)),
            })
          }
          return next
        })
      }

      // Handle real prediction in MQTT packet
      const pred = payload.prediction || payload.command
      if (pred) {
        const conf = typeof payload.confidence === 'number' ? payload.confidence : null
        const formattedTime = new Date().toLocaleTimeString()

        setLatestPrediction({
          command: pred,
          confidence: conf,
          signalQuality: 'Good',
          timestamp: formattedTime,
          modelStatus: 'Active',
        })
        setDetectedMessage(pred)

        addPredictionHistory({
          time: formattedTime,
          command: pred,
          confidence: conf,
          source: 'MQTT',
        })

        if (settings.autoSpeak && settings.voiceOutputEnabled) {
          speechService.speak(pred, { rate: settings.speechRate })
        }
      }
    })

    return () => {
      unsub()
      if (sensorTimeoutRef.current) clearTimeout(sensorTimeoutRef.current)
    }
  }, [addPredictionHistory, settings.autoSpeak, settings.voiceOutputEnabled, settings.speechRate])

  // Reset sensor telemetry when disconnected
  useEffect(() => {
    if (connectionStatus === 'Disconnected' || connectionStatus === 'Connection Error') {
      setHasSensorData(false)
      setRawEmgSamples([])
      setLatestEmgValue(null)
      setEmgMetrics({ rms: null, mav: null, zcr: null, peakToPeak: null })
      setImu({
        accel: { x: null, y: null, z: null },
        gyro: { x: null, y: null, z: null },
      })
      setDeviceHealth({
        battery: null,
        rssi: null,
        packetRate: null,
        lastPacketTime: null,
        noiseLevel: null,
        speechDetected: null,
        vibration: null,
        status: null,
      })
    }
  }, [connectionStatus])

  // ── Speech Synthesis triggers ──
  const speakDetectedMessage = useCallback(() => {
    if (!detectedMessage) return
    speechService.speak(detectedMessage, { rate: settings.speechRate })
  }, [detectedMessage, settings.speechRate])

  const clearDetectedMessage = useCallback(() => {
    setDetectedMessage(null)
    setLatestPrediction((prev) => ({
      ...prev,
      command: null,
      confidence: null,
      timestamp: null,
    }))
  }, [])

  const clearPredictionHistory = useCallback(() => {
    setPredictionHistory([])
    try {
      localStorage.removeItem('bonetalk_prediction_history')
    } catch {
      // ignore
    }
  }, [])

  // ── Demo / Simulated Calibration & Inference State ──
  const [demoCalibration, setDemoCalibration] = useState<DemoCalibrationState>(() =>
    demoCalibrationService.getState()
  )
  const [isDemoStreamActive, setIsDemoStreamActive] = useState<boolean>(false)
  const demoStreamTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const unsub = demoCalibrationService.onStateChange((state) => {
      setDemoCalibration(state)
    })
    return unsub
  }, [])

  useEffect(() => {
    const unsub = demoCalibrationService.onStreamSamples((chunk, latestVal, metrics) => {
      setIsDemoStreamActive(true)
      setHasSensorData(true)
      setLatestEmgValue(latestVal)
      setRawEmgSamples((prev) => [...prev, ...chunk].slice(-250))
      setEmgMetrics({
        rms: metrics.rms,
        mav: metrics.mav,
        zcr: metrics.zcr,
        peakToPeak: metrics.peakToPeak,
      })

      if (demoStreamTimerRef.current) clearTimeout(demoStreamTimerRef.current)
      demoStreamTimerRef.current = window.setTimeout(() => {
        setIsDemoStreamActive(false)
      }, 1500)
    })
    return () => {
      unsub()
      if (demoStreamTimerRef.current) clearTimeout(demoStreamTimerRef.current)
    }
  }, [])

  const startDemoCalibration = useCallback(async (onPrompt?: () => Promise<void>) => {
    try {
      await demoCalibrationService.startCalibration(onPrompt)
    } catch (err: unknown) {
      if ((err as Error)?.message !== 'Calibration cancelled') {
        console.error('Demo calibration failed:', err)
      }
    }
  }, [])

  const triggerHelloAction = useCallback(() => {
    demoCalibrationService.triggerHello()
  }, [])

  const runDemoInference = useCallback(async () => {
    try {
      const result = await demoCalibrationService.runDemoInference()
      const formattedTime = new Date().toLocaleTimeString()

      setLatestPrediction({
        command: result.command,
        confidence: result.confidence,
        signalQuality: 'Good (Simulated)',
        timestamp: formattedTime,
        modelStatus: 'Ready (Demo)',
      })
      setDetectedMessage(result.command)

      addPredictionHistory({
        time: formattedTime,
        command: result.command,
        confidence: result.confidence,
        source: 'Stream',
      })

      if (settings.voiceOutputEnabled) {
        speechService.speak(result.command, { rate: settings.speechRate })
      }
    } catch (err: unknown) {
      console.error('Demo inference error:', err)
      throw err
    }
  }, [addPredictionHistory, settings.voiceOutputEnabled, settings.speechRate])

  const resetDemoCalibration = useCallback(() => {
    demoCalibrationService.resetCalibration()
    setIsDemoStreamActive(false)
    if (latestPrediction.signalQuality?.includes('Simulated')) {
      setLatestPrediction({
        command: null,
        confidence: null,
        signalQuality: null,
        timestamp: null,
        modelStatus: modelStatus === 'Ready' ? 'Ready' : 'Waiting',
      })
      setDetectedMessage(null)
    }
  }, [latestPrediction.signalQuality, modelStatus])

  // ── Real Backend Model Test Action ──
  const testModelWithUtterance = useCallback(
    async (_word: string) => {
      // Create representative resting baseline buffer (1000 samples, 8 channels)
      // and post to real FastAPI backend /api/predict
      const samples: number[][] = []
      for (let i = 0; i < 600; i++) {
        // baseline microvolt signals across 8 facial channels
        const row = [0.02, -0.01, 0.04, -0.02, 0.01, 0.03, -0.01, 0.02]
        samples.push(row)
      }

      const result = await modelService.predict(samples, 1000)
      if (result.prediction) {
        const formattedTime = new Date().toLocaleTimeString()
        const conf = typeof result.confidence === 'number' ? result.confidence : null

        setLatestPrediction({
          command: result.prediction,
          confidence: conf,
          signalQuality: 'Optimal',
          timestamp: formattedTime,
          modelStatus: 'Inference Complete',
        })
        setDetectedMessage(result.prediction)

        addPredictionHistory({
          time: formattedTime,
          command: result.prediction,
          confidence: conf,
          source: 'API',
        })

        if (settings.autoSpeak && settings.voiceOutputEnabled) {
          speechService.speak(result.prediction, { rate: settings.speechRate })
        }
      }
    },
    [addPredictionHistory, settings.autoSpeak, settings.voiceOutputEnabled, settings.speechRate]
  )

  // ── Combined System Readiness: Requires MQTT Connected + Device Online + Handshake Success + Model Ready ──
  const isSystemReady =
    connectionStatus === 'Connected' &&
    devicePresence === 'ONLINE' &&
    handshakeStatus === 'SUCCESS' &&
    modelStatus === 'Ready'
  const systemReadiness: 'READY' | 'SYSTEM NOT READY' = isSystemReady ? 'READY' : 'SYSTEM NOT READY'

  // ── Compute Real 7-Stage Pipeline Status ──
  const pipeline = {
    // Hardware stage is strictly ONLINE ONLY if Arduino UNO R4 device presence is ONLINE (verified heartbeat)
    hardware: (devicePresence === 'ONLINE'
      ? 'ONLINE'
      : connectionStatus === 'Connecting...' || connectionStatus === 'Reconnecting'
      ? 'CONNECTING'
      : 'OFFLINE') as 'ONLINE' | 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'OFFLINE',

    sensors: (hasSensorData
      ? 'RECEIVING'
      : devicePresence === 'ONLINE'
      ? 'WAITING'
      : 'IDLE') as 'RECEIVING' | 'WAITING' | 'DISCONNECTED' | 'IDLE',

    processing: (hasSensorData
      ? 'ACTIVE'
      : devicePresence === 'ONLINE'
      ? 'STANDBY'
      : 'OFFLINE') as 'ACTIVE' | 'WAITING' | 'DISCONNECTED' | 'STANDBY' | 'OFFLINE',

    // Pipeline MQTT step: ONLY 'CONNECTED' (green) if broker is connected AND physical device is online & verified
    mqtt: (connectionStatus === 'Connected'
      ? devicePresence === 'ONLINE' && handshakeStatus === 'SUCCESS'
        ? 'CONNECTED'
        : 'BROKER READY — NO DEVICE'
      : connectionStatus === 'Connecting...' || connectionStatus === 'Reconnecting'
      ? 'CONNECTING'
      : connectionStatus === 'Connection Error'
      ? 'ERROR'
      : 'DISCONNECTED') as 'CONNECTED' | 'BROKER READY — NO DEVICE' | 'CONNECTING' | 'DISCONNECTED' | 'ERROR',

    model: (['PREPARING', 'WAITING_FOR_TRIGGER', 'ANALYZING_TRIAL', 'EXTRACTING_FEATURES', 'BUILDING_TEMPLATE'].includes(demoCalibration.status)
      ? 'CALIBRATING'
      : demoCalibration.status === 'VALIDATING'
      ? 'VALIDATING'
      : modelStatus === 'Ready' || demoCalibration.isCalibrated
      ? 'READY'
      : modelStatus === 'Loading'
      ? 'LOADING'
      : modelStatus === 'Error'
      ? 'ERROR'
      : 'UNAVAILABLE') as 'READY' | 'LOADING' | 'CALIBRATING' | 'VALIDATING' | 'UNAVAILABLE' | 'ERROR',

    prediction: (latestPrediction.command
      ? latestPrediction.command
      : isDemoStreamActive
      ? 'ANALYZING'
      : hasSensorData
      ? 'WAITING'
      : 'IDLE') as 'ACTIVE' | 'WAITING' | 'ANALYZING' | 'IDLE' | string,

    output: (speechService.isSpeaking()
      ? 'SPEAKING'
      : detectedMessage
      ? 'READY'
      : 'IDLE') as 'READY' | 'SPEAKING' | 'IDLE',
  }

  return (
    <ModelControlContext.Provider
      value={{
        modelStatus,
        modelInfo,
        backendUrl,
        setBackendUrl,
        refreshModelStatus,
        testModelWithUtterance,

        connectionStatus,
        connectionError,
        settings,
        updateSettings,
        connectHardware,
        disconnectHardware,
        sendCommand,

        devicePresence,
        handshakeStatus,
        lastHandshakeLatency,
        lastHeartbeatAge,
        deviceMetadata,
        systemReadiness,
        executeHandshake,
        sendCommandWithAck,

        serialDetails,
        connectSerial,
        disconnectSerial,

        hasSensorData,
        rawEmgSamples,
        latestEmgValue,
        emgMetrics,
        imu,
        deviceHealth,

        latestPrediction,
        detectedMessage,
        predictionHistory,
        speakDetectedMessage,
        clearDetectedMessage,
        clearPredictionHistory,

        demoCalibration,
        startDemoCalibration,
        triggerHelloAction,
        runDemoInference,
        resetDemoCalibration,
        isDemoStreamActive,

        pipeline,
      }}
    >
      {children}
    </ModelControlContext.Provider>
  )
}

export function useModelControl() {
  const ctx = useContext(ModelControlContext)
  if (!ctx) {
    throw new Error('useModelControl must be used within a ModelControlProvider')
  }
  return ctx
}
