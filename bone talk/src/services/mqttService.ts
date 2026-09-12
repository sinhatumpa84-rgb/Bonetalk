import mqtt from 'mqtt'
import type { MqttClient, IClientOptions } from 'mqtt'

/**
 * Standard 4-State Connection Status
 */
export type MqttConnectionStatus =
  | 'CONNECTED'
  | 'CONNECTING'
  | 'DISCONNECTED'
  | 'RECONNECTING'

/**
 * Unified Device Telemetry & Sensor Message Schema
 * Strictly supports real hardware data (ESP32-S3, MarkusBlue, BoneTalk Wearable)
 */
export interface ValidatedDeviceMessage {
  // Device Identifiers
  device_id: string
  timestamp: number

  // Acoustic & Physical Sensors
  noise_level: number | null
  speech_detected: boolean | null
  vibration: boolean | null
  status: 'active' | 'idle' | 'offline' | 'error' | string

  // Neural / EMG Signals (optional)
  emg?: number[] | number | null
  accel?: { x: number; y: number; z: number } | null
  gyro?: { x: number; y: number; z: number } | null

  // Telemetry Health
  battery?: number | null
  rssi?: number | null
  packetRate?: number

  // ML / Speech Output
  command?: string | null
  prediction?: string | null
  confidence?: number | null

  // Raw topic and payload metadata
  _topic: string
  _rawTime: string
}

/**
 * MQTT Configuration Options
 */
export interface MqttServiceConfig {
  brokerUrl: string
  port?: number
  username?: string
  password?: string
  clientId?: string
  subscribeTopics: string[]
  publishTopic?: string
  qos?: 0 | 1 | 2
  connectTimeout?: number
  keepalive?: number
}

/**
 * Read environment variables safely with fallbacks
 */
export function getDefaultMqttConfig(): MqttServiceConfig {
  const envUrl = import.meta.env.VITE_MQTT_URL || 'wss://broker.emqx.io:8084/mqtt'
  const envPort = import.meta.env.VITE_MQTT_PORT
    ? parseInt(import.meta.env.VITE_MQTT_PORT, 10)
    : 8084
  const envUser = import.meta.env.VITE_MQTT_USERNAME || ''
  const envPass = import.meta.env.VITE_MQTT_PASSWORD || ''
  const envClient = import.meta.env.VITE_MQTT_CLIENT_ID || ''
  const envTopic = import.meta.env.VITE_MQTT_TOPIC || 'bonetalk/device/#'
  const envQos = import.meta.env.VITE_MQTT_QOS
    ? (parseInt(import.meta.env.VITE_MQTT_QOS, 10) as 0 | 1 | 2)
    : 0

  return {
    brokerUrl: envUrl,
    port: envPort,
    username: envUser,
    password: envPass,
    clientId: envClient,
    subscribeTopics: [envTopic, 'markusblue/device/#', 'bonetalk/sensors'],
    publishTopic: 'bonetalk/device/commands',
    qos: envQos,
    connectTimeout: 5000,
    keepalive: 60,
  }
}

/**
 * Sanitize object properties to prevent prototype pollution
 */
function sanitizeObject<T>(obj: unknown): T | null {
  if (typeof obj !== 'object' || obj === null) return null
  const clean: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue
    }
    clean[key] = value
  }
  return clean as T
}

export interface ConnectionDetails {
  status: MqttConnectionStatus
  brokerUrl: string
  subscribedTopics: string[]
  deviceStatus: 'DEVICE ACTIVE' | 'DEVICE OFFLINE'
  lastConnectionTime: string | null
  lastMessageTime: string | null
  lastMessage: ValidatedDeviceMessage | null
  errorMessage: string | null
}

export class MqttService {
  private client: MqttClient | null = null
  private status: MqttConnectionStatus = 'DISCONNECTED'
  private activeConfig: MqttServiceConfig | null = null
  private subscribedTopics = new Set<string>()

  // Connection metadata
  private lastConnectionTime: string | null = null
  private lastMessageTime: string | null = null
  private lastMessage: ValidatedDeviceMessage | null = null
  private errorMessage: string | null = null
  private reconnectAttempt = 0
  private reconnectTimer: number | null = null

  // Listeners
  private statusListeners = new Set<(details: ConnectionDetails) => void>()
  private messageListeners = new Set<(message: ValidatedDeviceMessage) => void>()

  constructor() {
    this.activeConfig = getDefaultMqttConfig()
  }

  // ── Public Accessors ────────────────────────────────────────────────────────

  public getStatus(): MqttConnectionStatus {
    return this.status
  }

  public getDetails(): ConnectionDetails {
    const isDeviceActive =
      this.status === 'CONNECTED' &&
      this.lastMessage !== null &&
      Date.now() - (this.lastMessage.timestamp > 1e12 ? this.lastMessage.timestamp : this.lastMessage.timestamp * 1000) < 15000

    return {
      status: this.status,
      brokerUrl: this.activeConfig?.brokerUrl || '',
      subscribedTopics: Array.from(this.subscribedTopics),
      deviceStatus: isDeviceActive ? 'DEVICE ACTIVE' : 'DEVICE OFFLINE',
      lastConnectionTime: this.lastConnectionTime,
      lastMessageTime: this.lastMessageTime,
      lastMessage: this.lastMessage,
      errorMessage: this.errorMessage,
    }
  }

  public onStatusChange(listener: (details: ConnectionDetails) => void): () => void {
    this.statusListeners.add(listener)
    listener(this.getDetails())
    return () => {
      this.statusListeners.delete(listener)
    }
  }

  public onMessage(listener: (message: ValidatedDeviceMessage) => void): () => void {
    this.messageListeners.add(listener)
    return () => {
      this.messageListeners.delete(listener)
    }
  }

  // ── Connection Lifecycle ────────────────────────────────────────────────────

  public connect(customConfig?: Partial<MqttServiceConfig>): void {
    // 1. Prevent duplicate concurrent connections
    if (this.client && (this.status === 'CONNECTED' || this.status === 'CONNECTING')) {
      console.info('[MQTT] Connection already active or in progress. Skipping duplicate connect.')
      return
    }

    this.disconnect()

    const config: MqttServiceConfig = {
      ...getDefaultMqttConfig(),
      ...(customConfig || {}),
    }
    this.activeConfig = config

    this.setStatus('CONNECTING')
    this.errorMessage = null

    try {
      const generatedClientId =
        config.clientId || `bonetalk_web_${Math.random().toString(36).substring(2, 8)}`

      const options: IClientOptions = {
        clientId: generatedClientId,
        clean: true,
        connectTimeout: config.connectTimeout || 5000,
        keepalive: config.keepalive || 60,
        reconnectPeriod: 0, // Managed manually with exponential backoff
      }

      if (config.username) options.username = config.username
      if (config.password) options.password = config.password

      this.client = mqtt.connect(config.brokerUrl, options)

      // ── Event: Connect ──────────────────────────────────────────────────────
      this.client.on('connect', () => {
        this.reconnectAttempt = 0
        this.lastConnectionTime = new Date().toLocaleTimeString()
        this.errorMessage = null
        this.setStatus('CONNECTED')

        // Restore / register topic subscriptions
        this.subscribedTopics.clear()
        const topics = config.subscribeTopics.length > 0 ? config.subscribeTopics : ['bonetalk/device/#']
        
        topics.forEach((t) => {
          this.subscribe(t, config.qos || 0)
        })
      })

      // ── Event: Reconnect ────────────────────────────────────────────────────
      this.client.on('reconnect', () => {
        this.setStatus('RECONNECTING')
      })

      // ── Event: Error ────────────────────────────────────────────────────────
      this.client.on('error', (err) => {
        const msg = err?.message || 'MQTT Connection Error'
        console.warn('[MQTT Client Error]:', msg)
        this.errorMessage = msg
        this.handleReconnect()
      })

      // ── Event: Close ────────────────────────────────────────────────────────
      this.client.on('close', () => {
        if (this.status === 'CONNECTED') {
          this.handleReconnect()
        }
      })

      // ── Event: Message Received ─────────────────────────────────────────────
      this.client.on('message', (topic, rawPayload) => {
        this.processIncomingMessage(topic, rawPayload)
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'MQTT initialization failed'
      console.error('[MQTT Init Error]:', msg)
      this.errorMessage = msg
      this.setStatus('DISCONNECTED')
    }
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.client) {
      try {
        this.client.removeAllListeners()
        this.client.end(true)
      } catch (err) {
        console.warn('[MQTT Disconnect Error]:', err)
      }
      this.client = null
    }

    this.subscribedTopics.clear()
    this.setStatus('DISCONNECTED')
  }

  // ── Reconnection with Exponential Backoff ───────────────────────────────────

  private handleReconnect(): void {
    if (this.reconnectTimer) return
    this.setStatus('RECONNECTING')

    this.reconnectAttempt++
    // Exponential backoff: 1s, 1.5s, 2.25s, ... max 30s + 15% jitter
    const baseDelay = 1000
    const backoff = Math.min(30000, baseDelay * Math.pow(1.5, this.reconnectAttempt))
    const jitter = backoff * (0.85 + Math.random() * 0.3)

    console.info(`[MQTT] Reconnecting in ${Math.round(jitter)}ms (Attempt #${this.reconnectAttempt})...`)

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null
      if (this.activeConfig) {
        this.connect(this.activeConfig)
      }
    }, jitter)
  }

  // ── Topic Subscription ──────────────────────────────────────────────────────

  public subscribe(topic: string, qos: 0 | 1 | 2 = 0): boolean {
    if (!this.client || this.status !== 'CONNECTED') {
      this.subscribedTopics.add(topic) // Queue for subscription on connect
      return false
    }

    this.client.subscribe(topic, { qos }, (err) => {
      if (err) {
        console.warn(`[MQTT] Failed to subscribe to topic "${topic}":`, err.message)
      } else {
        this.subscribedTopics.add(topic)
        this.notifyStatusListeners()
      }
    })
    return true
  }

  public unsubscribe(topic: string): void {
    this.subscribedTopics.delete(topic)
    if (this.client && this.status === 'CONNECTED') {
      this.client.unsubscribe(topic)
    }
    this.notifyStatusListeners()
  }

  // ── Message Publishing ──────────────────────────────────────────────────────

  public publish(topic: string, message: string | object, qos: 0 | 1 | 2 = 0): boolean {
    if (!this.client || this.status !== 'CONNECTED') {
      return false
    }

    const payload = typeof message === 'string' ? message : JSON.stringify(message)
    this.client.publish(topic, payload, { qos })
    return true
  }

  public sendCommand(commandName: string, extra: Record<string, unknown> = {}): boolean {
    const topic = this.activeConfig?.publishTopic || 'bonetalk/device/commands'
    return this.publish(topic, {
      command: commandName,
      timestamp: Date.now(),
      ...extra,
    })
  }

  // ── Real Message Validation & Processing ────────────────────────────────────

  private processIncomingMessage(topic: string, rawPayload: Buffer | Uint8Array): void {
    try {
      const text = new TextDecoder('utf-8').decode(rawPayload)
      let parsed: Record<string, unknown>

      try {
        parsed = JSON.parse(text)
      } catch {
        // Plain string message (e.g. status or command ping)
        parsed = {
          command: text.trim(),
          timestamp: Date.now(),
          status: 'active',
        }
      }

      const cleanObj = sanitizeObject<Record<string, unknown>>(parsed)
      if (!cleanObj) return

      // Validate required and optional fields strictly
      const validated = this.validatePayload(topic, cleanObj)
      if (validated) {
        this.lastMessage = validated
        this.lastMessageTime = new Date().toLocaleTimeString()

        // Dispatch to all message subscribers
        this.messageListeners.forEach((listener) => {
          try {
            listener(validated)
          } catch (err) {
            console.error('[MQTT Listener Error]:', err)
          }
        })

        this.notifyStatusListeners()
      }
    } catch (err) {
      console.warn('[MQTT Payload Ingestion Error]:', err instanceof Error ? err.message : err)
    }
  }

  private validatePayload(topic: string, data: Record<string, unknown>): ValidatedDeviceMessage | null {
    // 1. Device ID validation
    const deviceIdRaw = data.device_id || data.deviceId || data.id
    const device_id = typeof deviceIdRaw === 'string' && deviceIdRaw.trim().length > 0
      ? deviceIdRaw.trim()
      : 'UNKNOWN-DEVICE'

    // 2. Timestamp validation (normalize to ms)
    let timestamp = Date.now()
    if (typeof data.timestamp === 'number') {
      timestamp = data.timestamp < 1e11 ? data.timestamp * 1000 : data.timestamp
    } else if (typeof data.timestamp === 'string') {
      const parsedTime = Date.parse(data.timestamp)
      if (!isNaN(parsedTime)) timestamp = parsedTime
    }

    // 3. Sensor fields validation
    const noise_level = typeof data.noise_level === 'number' && isFinite(data.noise_level)
      ? Math.round(data.noise_level)
      : null

    const speech_detected = typeof data.speech_detected === 'boolean'
      ? data.speech_detected
      : null

    const vibration = typeof data.vibration === 'boolean'
      ? data.vibration
      : null

    const status = typeof data.status === 'string' && data.status.trim().length > 0
      ? data.status.trim()
      : 'active'

    // 4. Neural / EMG Signal validation (strictly numbers)
    let emg: number[] | number | null = null
    if (Array.isArray(data.emg)) {
      emg = data.emg.filter((v): v is number => typeof v === 'number' && isFinite(v))
    } else if (typeof data.emg === 'number' && isFinite(data.emg)) {
      emg = data.emg
    }

    // 5. IMU acceleration & gyroscope
    let accel: { x: number; y: number; z: number } | null = null
    if (typeof data.accel === 'object' && data.accel !== null) {
      const a = data.accel as Record<string, unknown>
      if (typeof a.x === 'number' && typeof a.y === 'number' && typeof a.z === 'number') {
        accel = { x: a.x, y: a.y, z: a.z }
      }
    }

    let gyro: { x: number; y: number; z: number } | null = null
    if (typeof data.gyro === 'object' && data.gyro !== null) {
      const g = data.gyro as Record<string, unknown>
      if (typeof g.x === 'number' && typeof g.y === 'number' && typeof g.z === 'number') {
        gyro = { x: g.x, y: g.y, z: g.z }
      }
    }

    // 6. Battery & RSSI
    const battery = typeof data.battery === 'number' && isFinite(data.battery)
      ? Math.min(100, Math.max(0, Math.round(data.battery)))
      : null

    const rssi = typeof data.rssi === 'number' && isFinite(data.rssi)
      ? Math.round(data.rssi)
      : null

    // 7. Prediction & Command
    const command = typeof data.command === 'string' ? data.command : null
    const prediction = typeof data.prediction === 'string' ? data.prediction : null
    const confidence = typeof data.confidence === 'number' && isFinite(data.confidence)
      ? parseFloat(data.confidence.toFixed(3))
      : null

    return {
      device_id,
      timestamp,
      noise_level,
      speech_detected,
      vibration,
      status,
      emg,
      accel,
      gyro,
      battery,
      rssi,
      command,
      prediction,
      confidence,
      _topic: topic,
      _rawTime: new Date(timestamp).toLocaleTimeString(),
    }
  }

  // ── Connection Diagnostic Test ──────────────────────────────────────────────

  public async testConnection(timeoutMs = 6000): Promise<{
    success: boolean
    step: string
    details: string
    deviceStatus: 'DEVICE ACTIVE' | 'DEVICE OFFLINE'
  }> {
    return new Promise((resolve) => {
      const startTime = Date.now()
      const timer = setTimeout(() => {
        cleanup()
        const currentDetails = this.getDetails()
        if (this.status === 'CONNECTED') {
          resolve({
            success: true,
            step: 'BROKER_CONNECTED_WAITING_FOR_DEVICE',
            details: `Connected to broker (${this.activeConfig?.brokerUrl}) in ${Date.now() - startTime}ms. Awaiting real device packet.`,
            deviceStatus: currentDetails.deviceStatus,
          })
        } else {
          resolve({
            success: false,
            step: 'TIMEOUT',
            details: `Connection test timed out after ${timeoutMs}ms. Broker unreachable at ${this.activeConfig?.brokerUrl}.`,
            deviceStatus: 'DEVICE OFFLINE',
          })
        }
      }, timeoutMs)

      const cleanup = () => {
        clearTimeout(timer)
        unsubStatus()
        unsubMsg()
      }

      const unsubStatus = this.onStatusChange((details) => {
        if (details.errorMessage) {
          cleanup()
          resolve({
            success: false,
            step: 'ERROR',
            details: details.errorMessage,
            deviceStatus: 'DEVICE OFFLINE',
          })
        }
      })

      const unsubMsg = this.onMessage((msg) => {
        cleanup()
        resolve({
          success: true,
          step: 'TELEMETRY_RECEIVED',
          details: `Active device packet received from "${msg.device_id}" on topic "${msg._topic}".`,
          deviceStatus: 'DEVICE ACTIVE',
        })
      })

      // If disconnected, trigger connect
      if (this.status !== 'CONNECTED') {
        this.connect()
      }
    })
  }

  private setStatus(newStatus: MqttConnectionStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus
      this.notifyStatusListeners()
    }
  }

  private notifyStatusListeners(): void {
    const details = this.getDetails()
    this.statusListeners.forEach((l) => {
      try {
        l(details)
      } catch (err) {
        console.error('[MQTT Status Listener Error]:', err)
      }
    })
  }
}

export const mqttService = new MqttService()
export default mqttService
