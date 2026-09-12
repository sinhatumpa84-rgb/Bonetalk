import { useState, useEffect, useCallback, useRef } from 'react'
import { mqttService, type MqttConnectionStatus, type MqttConfig } from '../lib/mqttService'
import { speechService } from '../lib/speechService'

export interface PredictionHistoryItem {
  id: string
  time: string
  command: string
  confidence?: number // 0-100 or undefined
  status: 'Confirmed' | 'Pending' | 'Rejected'
  source: 'hardware' | 'model' | 'simulation'
}

export interface EmgMetrics {
  currentValue: number
  rms: number
  mav: number
  zcr: number
  peak: number
}

export interface ImuData {
  accel: { x: number; y: number; z: number }
  gyro: { x: number; y: number; z: number }
}

export interface TelemetrySettings {
  voiceEnabled: boolean
  speechRate: number
  autoSpeak: boolean
  bufferSize: number
}

const BACKEND_URL = 'http://localhost:8000'
const WS_URL = 'ws://localhost:8000/ws/emg'

export function useDeviceTelemetry() {
  // MQTT state
  const [mqttStatus, setMqttStatus] = useState<MqttConnectionStatus>(() => mqttService.getStatus())
  const [mqttConfig, setMqttConfig] = useState<MqttConfig>(() => mqttService.getConfig())

  // Backend / Model Status
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking')
  const [modelInfo, setModelInfo] = useState<{
    loaded: boolean
    classes?: string[]
    featureCount?: number
    modelType?: string
  }>({ loaded: false })

  // Real sensor streams
  const [emgBuffer, setEmgBuffer] = useState<number[]>([])
  const [emgMetrics, setEmgMetrics] = useState<EmgMetrics>({
    currentValue: 0,
    rms: 0,
    mav: 0,
    zcr: 0,
    peak: 0,
  })

  const [imu, setImu] = useState<ImuData>({
    accel: { x: 0, y: 0, z: 0 },
    gyro: { x: 0, y: 0, z: 0 },
  })
  const [hasImuData, setHasImuData] = useState(false)
  const [hasEmgData, setHasEmgData] = useState(false)

  // Device telemetry
  const [batteryPct, setBatteryPct] = useState<number | null>(null)
  const [rssi, setRssi] = useState<number | null>(null)
  const [packetRate, setPacketRate] = useState<number>(0)
  const [lastPacketTime, setLastPacketTime] = useState<Date | null>(null)

  // Prediction state & History
  const [detectedMessage, setDetectedMessage] = useState<string | null>(null)
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistoryItem[]>(() => {
    try {
      const saved = sessionStorage.getItem('bonetalk_prediction_history')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Settings
  const [settings, setSettings] = useState<TelemetrySettings>({
    voiceEnabled: true,
    speechRate: 1.0,
    autoSpeak: true,
    bufferSize: 200,
  })

  const packetCountRef = useRef(0)
  const rawBufferRef = useRef<number[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  // Save history to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('bonetalk_prediction_history', JSON.stringify(predictionHistory))
    } catch {
      // ignore
    }
  }, [predictionHistory])

  // Packet rate counter (every 1s)
  useEffect(() => {
    const rateInterval = setInterval(() => {
      setPacketRate(packetCountRef.current)
      packetCountRef.current = 0
    }, 1000)
    return () => clearInterval(rateInterval)
  }, [])

  // Check Backend status
  const checkBackend = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/status`, {
        signal: AbortSignal.timeout(2500),
      })
      if (res.ok) {
        const data = await res.json()
        setBackendStatus(data.model_loaded ? 'online' : 'offline')
        setModelInfo({
          loaded: Boolean(data.model_loaded),
          classes: data.classes,
          featureCount: data.feature_count,
          modelType: data.model_type,
        })
        return
      }
    } catch {
      // Offline
    }
    setBackendStatus('offline')
    setModelInfo({ loaded: false })
  }, [])

  useEffect(() => {
    checkBackend()
    const interval = setInterval(checkBackend, 6000)
    return () => clearInterval(interval)
  }, [checkBackend])

  // Compute mathematical signal metrics from raw EMG buffer
  const computeEmgFeatures = useCallback((samples: number[]) => {
    if (samples.length === 0) {
      return { currentValue: 0, rms: 0, mav: 0, zcr: 0, peak: 0 }
    }

    const n = samples.length
    let sumSq = 0
    let sumAbs = 0
    let zcrCount = 0
    let peakVal = 0

    for (let i = 0; i < n; i++) {
      const val = samples[i]
      const absVal = Math.abs(val)
      sumSq += val * val
      sumAbs += absVal
      if (absVal > peakVal) peakVal = absVal

      if (i > 0) {
        if ((samples[i] >= 0 && samples[i - 1] < 0) || (samples[i] < 0 && samples[i - 1] >= 0)) {
          zcrCount++
        }
      }
    }

    const rms = Math.sqrt(sumSq / n)
    const mav = sumAbs / n
    const zcr = zcrCount / (n - 1 || 1)
    const currentValue = samples[n - 1]

    return {
      currentValue: Math.round(currentValue * 10) / 10,
      rms: Math.round(rms * 10) / 10,
      mav: Math.round(mav * 10) / 10,
      zcr: Math.round(zcr * 1000) / 1000,
      peak: Math.round(peakVal * 10) / 10,
    }
  }, [])

  // Push incoming prediction to history
  const addPrediction = useCallback(
    (command: string, confidence?: number, source: 'hardware' | 'model' | 'simulation' = 'model') => {
      const item: PredictionHistoryItem = {
        id: `pred_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        command: command.toUpperCase(),
        confidence: typeof confidence === 'number' ? Math.round(confidence * 10) / 10 : undefined,
        status: 'Confirmed',
        source,
      }

      setDetectedMessage(item.command)
      setPredictionHistory((prev) => [item, ...prev].slice(0, 50))

      if (settings.voiceEnabled && settings.autoSpeak) {
        speechService.speak(item.command, { rate: settings.speechRate })
      }
    },
    [settings.voiceEnabled, settings.autoSpeak, settings.speechRate]
  )

  // Clear History
  const clearHistory = useCallback(() => {
    setPredictionHistory([])
    try {
      sessionStorage.removeItem('bonetalk_prediction_history')
    } catch {
      // ignore
    }
  }, [])

  // Speak currently detected message
  const speakDetectedMessage = useCallback(() => {
    if (detectedMessage && settings.voiceEnabled) {
      speechService.speak(detectedMessage, { rate: settings.speechRate })
    }
  }, [detectedMessage, settings.voiceEnabled, settings.speechRate])

  // Clear active detected message
  const clearDetectedMessage = useCallback(() => {
    setDetectedMessage(null)
  }, [])

  // MQTT Listeners Setup
  useEffect(() => {
    const unsubStatus = mqttService.on('status', (status) => {
      setMqttStatus(status)
      if (status !== 'connected') {
        setHasEmgData(false)
        setHasImuData(false)
      }
    })

    const unsubEmg = mqttService.on('emg', (packet) => {
      packetCountRef.current++
      setLastPacketTime(new Date())
      setHasEmgData(true)

      const values = packet.channels.length > 0 ? packet.channels : [0]
      const primaryVal = values[0]

      rawBufferRef.current = [...rawBufferRef.current, primaryVal].slice(-settings.bufferSize)
      setEmgBuffer([...rawBufferRef.current])
      setEmgMetrics(computeEmgFeatures(rawBufferRef.current))
    })

    const unsubImu = mqttService.on('imu', (packet) => {
      packetCountRef.current++
      setLastPacketTime(new Date())
      setHasImuData(true)
      setImu(packet)
    })

    const unsubTelemetry = mqttService.on('telemetry', (packet) => {
      if (packet.batteryPct !== undefined) setBatteryPct(packet.batteryPct)
      if (packet.rssi !== undefined) setRssi(packet.rssi)
      setLastPacketTime(new Date())
    })

    const unsubPred = mqttService.on('prediction', (packet) => {
      addPrediction(packet.command, packet.confidence, 'hardware')
    })

    return () => {
      unsubStatus()
      unsubEmg()
      unsubImu()
      unsubTelemetry()
      unsubPred()
    }
  }, [computeEmgFeatures, addPrediction, settings.bufferSize])

  // Connect / Disconnect MQTT helpers
  const connectMqtt = useCallback((customConfig?: Partial<MqttConfig>) => {
    mqttService.connect(customConfig)
  }, [])

  const disconnectMqtt = useCallback(() => {
    mqttService.disconnect()
  }, [])

  // Signal Strength Quality
  const signalQuality: 'Good' | 'Fair' | 'Poor' | 'No Signal' =
    mqttStatus === 'connected'
      ? rssi === null
        ? 'Good'
        : rssi >= -65
        ? 'Good'
        : rssi >= -80
        ? 'Fair'
        : 'Poor'
      : 'No Signal'

  return {
    mqttStatus,
    mqttConfig,
    connectMqtt,
    disconnectMqtt,
    backendStatus,
    modelInfo,
    checkBackend,
    hasEmgData,
    hasImuData,
    emgBuffer,
    emgMetrics,
    imu,
    batteryPct,
    rssi,
    packetRate,
    lastPacketTime,
    signalQuality,
    detectedMessage,
    setDetectedMessage,
    speakDetectedMessage,
    clearDetectedMessage,
    predictionHistory,
    addPrediction,
    clearHistory,
    settings,
    setSettings,
  }
}
