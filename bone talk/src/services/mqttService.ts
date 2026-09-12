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
  | 'ERROR'

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

export type DevicePresenceStatus = 'ONLINE' | 'OFFLINE'

export interface DeviceMetadata {
  firmware?: string
  modelVersion?: string
  lastHeartbeatTimestamp: number | null
  deviceId: string
}

export interface ConnectionDetails {
  status: MqttConnectionStatus
  brokerUrl: string
  subscribedTopics: string[]
  deviceStatus: 'DEVICE ACTIVE' | 'DEVICE OFFLINE'
  devicePresence: DevicePresenceStatus
  lastHeartbeatTime: string | null
  lastConnectionTime: string | null
  lastMessageTime: string | null
  lastMessage: ValidatedDeviceMessage | null
  errorMessage: string | null
  handshakeVerified: boolean
  deviceMetadata: DeviceMetadata
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

  // Real Device Presence & Heartbeat Tracking
  private devicePresence: DevicePresenceStatus = 'OFFLINE'
  private lastHeartbeatTime: string | null = null
  private lastHeartbeatTimestamp: number | null = null
  private heartbeatTimeoutTimer: number | null = null
  private initialDeviceWaitTimer: number | null = null
  private handshakeVerified = false
  private configuredDeviceId: string = import.meta.env.VITE_DEVICE_ID || 'BONE-01'
  private deviceMetadata: DeviceMetadata = {
    firmware: undefined,
    modelVersion: undefined,
    lastHeartbeatTimestamp: null,
    deviceId: import.meta.env.VITE_DEVICE_ID || 'BONE-01',
  }

  // Real Handshake & ACK tracking maps keyed by unique request_id
  private pendingHandshakes = new Map<
    string,
    {
      resolve: (res: { success: boolean; latencyMs: number; error?: string }) => void
      reject: (err: Error) => void
      timeoutTimer: number
      startTime: number
    }
  >()

  private pendingAcks = new Map<
    string,
    {
      resolve: (ack: Record<string, unknown>) => void
      reject: (err: Error) => void
      timeoutTimer: number
    }
  >()

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

  public getDevicePresence(): DevicePresenceStatus {
    return this.devicePresence
  }

  public isHandshakeVerified(): boolean {
    return this.handshakeVerified
  }

  public setConfiguredDeviceId(id: string): void {
    if (id && id.trim()) {
      this.configuredDeviceId = id.trim()
      this.deviceMetadata.deviceId = this.configuredDeviceId
      this.notifyStatusListeners()
    }
  }

  public getDetails(): ConnectionDetails {
    const isDeviceActive = this.devicePresence === 'ONLINE'

    return {
      status: this.status,
      brokerUrl: this.activeConfig?.brokerUrl || '',
      subscribedTopics: Array.from(this.subscribedTopics),
      deviceStatus: isDeviceActive ? 'DEVICE ACTIVE' : 'DEVICE OFFLINE',
      devicePresence: this.devicePresence,
      lastHeartbeatTime: this.lastHeartbeatTime,
      lastConnectionTime: this.lastConnectionTime,
      lastMessageTime: this.lastMessageTime,
      lastMessage: this.lastMessage,
      errorMessage: this.errorMessage,
      handshakeVerified: this.handshakeVerified,
      deviceMetadata: { ...this.deviceMetadata },
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

        // Heartbeat timeout check: If no real ESP32 packet is received within 8 seconds
        // of broker connection, auto-revert / lock devicePresence to OFFLINE
        if (this.initialDeviceWaitTimer) {
          clearTimeout(this.initialDeviceWaitTimer)
        }
        this.initialDeviceWaitTimer = window.setTimeout(() => {
          if (this.devicePresence !== 'ONLINE') {
            this.devicePresence = 'OFFLINE'
            this.handshakeVerified = false
            this.notifyStatusListeners()
          }
        }, 8000)
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
        this.setStatus('ERROR')
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

    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer)
      this.heartbeatTimeoutTimer = null
    }

    if (this.initialDeviceWaitTimer) {
      clearTimeout(this.initialDeviceWaitTimer)
      this.initialDeviceWaitTimer = null
    }

    this.devicePresence = 'OFFLINE'
    this.handshakeVerified = false

    // Reject all pending handshakes and ACKs
    this.pendingHandshakes.forEach((h) => {
      clearTimeout(h.timeoutTimer)
      h.reject(new Error('MQTT disconnected'))
    })
    this.pendingHandshakes.clear()

    this.pendingAcks.forEach((a) => {
      clearTimeout(a.timeoutTimer)
      a.reject(new Error('MQTT disconnected'))
    })
    this.pendingAcks.clear()

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

  // ── Real Device Heartbeat & Presence Ingestion ───────────────────────────────

  private markDeviceHeartbeatReceived(
    deviceId: string,
    extra?: { firmware?: string; modelVersion?: string; status?: string }
  ): void {
    const wasOffline = this.devicePresence !== 'ONLINE'
    this.devicePresence = 'ONLINE'
    this.lastHeartbeatTime = new Date().toLocaleTimeString()
    this.lastHeartbeatTimestamp = Date.now()

    if (deviceId && deviceId !== 'UNKNOWN-DEVICE') {
      this.deviceMetadata.deviceId = deviceId
    }
    this.deviceMetadata.lastHeartbeatTimestamp = this.lastHeartbeatTimestamp
    if (extra?.firmware) this.deviceMetadata.firmware = extra.firmware
    if (extra?.modelVersion) this.deviceMetadata.modelVersion = extra.modelVersion

    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer)
    }

    if (this.initialDeviceWaitTimer) {
      clearTimeout(this.initialDeviceWaitTimer)
      this.initialDeviceWaitTimer = null
    }

    // 12-second sliding window for genuine physical presence
    this.heartbeatTimeoutTimer = window.setTimeout(() => {
      this.devicePresence = 'OFFLINE'
      this.handshakeVerified = false
      this.notifyStatusListeners()
    }, 12000)

    if (wasOffline) {
      this.notifyStatusListeners()
    }
  }

  // ── Real Device Handshake Protocol (Ping-Pong) ───────────────────────────────

  public async handshake(
    deviceId?: string,
    timeoutMs = 5000
  ): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    if (!this.client || this.status !== 'CONNECTED') {
      return { success: false, latencyMs: 0, error: 'MQTT Broker not connected' }
    }

    const targetId = deviceId || this.configuredDeviceId
    const requestId = `ping_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    const startTime = Date.now()

    return new Promise((resolve) => {
      const timer = window.setTimeout(() => {
        this.pendingHandshakes.delete(requestId)
        resolve({
          success: false,
          latencyMs: Date.now() - startTime,
          error: `Handshake timed out after ${timeoutMs}ms. Device "${targetId}" did not respond with device_pong.`,
        })
      }, timeoutMs)

      this.pendingHandshakes.set(requestId, {
        resolve: (res) => {
          clearTimeout(timer)
          this.pendingHandshakes.delete(requestId)
          this.handshakeVerified = true
          this.markDeviceHeartbeatReceived(targetId)
          this.notifyStatusListeners()
          resolve(res)
        },
        reject: (err) => {
          clearTimeout(timer)
          this.pendingHandshakes.delete(requestId)
          resolve({
            success: false,
            latencyMs: Date.now() - startTime,
            error: err.message,
          })
        },
        timeoutTimer: timer,
        startTime,
      })

      const topic = this.activeConfig?.publishTopic || 'bonetalk/device/commands'
      const published = this.publish(topic, {
        command: 'device_ping',
        device_id: targetId,
        request_id: requestId,
        timestamp: Date.now(),
      })

      if (!published) {
        clearTimeout(timer)
        this.pendingHandshakes.delete(requestId)
        resolve({
          success: false,
          latencyMs: 0,
          error: 'Failed to publish device_ping command to broker',
        })
      }
    })
  }

  // ── Real Command Transmission with Acknowledgement (ACK) ───────────────────

  public async sendCommandWithAck(
    commandName: string,
    extra: Record<string, unknown> = {},
    timeoutMs = 5000
  ): Promise<{ success: boolean; ack?: Record<string, unknown>; error?: string }> {
    if (!this.client || this.status !== 'CONNECTED') {
      return { success: false, error: 'MQTT Broker not connected' }
    }

    const requestId = `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    const targetId = (extra.device_id as string) || this.configuredDeviceId

    return new Promise((resolve) => {
      const timer = window.setTimeout(() => {
        this.pendingAcks.delete(requestId)
        resolve({
          success: false,
          error: `Command "${commandName}" timed out after ${timeoutMs}ms without ACK response from hardware.`,
        })
      }, timeoutMs)

      this.pendingAcks.set(requestId, {
        resolve: (ack) => {
          clearTimeout(timer)
          this.pendingAcks.delete(requestId)
          this.markDeviceHeartbeatReceived(targetId)
          resolve({ success: true, ack })
        },
        reject: (err) => {
          clearTimeout(timer)
          this.pendingAcks.delete(requestId)
          resolve({ success: false, error: err.message })
        },
        timeoutTimer: timer,
      })

      const topic = this.activeConfig?.publishTopic || 'bonetalk/device/commands'
      const published = this.publish(topic, {
        command: commandName,
        device_id: targetId,
        request_id: requestId,
        timestamp: Date.now(),
        ...extra,
      })

      if (!published) {
        clearTimeout(timer)
        this.pendingAcks.delete(requestId)
        resolve({ success: false, error: 'Failed to publish command to MQTT broker' })
      }
    })
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

      // 1. Check for real device handshake pong
      if (
        cleanObj.type === 'device_pong' ||
        cleanObj.command === 'device_pong' ||
        cleanObj.response === 'device_pong'
      ) {
        const reqId = String(cleanObj.request_id || cleanObj.requestId || '')
        if (reqId && this.pendingHandshakes.has(reqId)) {
          const pending = this.pendingHandshakes.get(reqId)!
          const latency = Date.now() - pending.startTime
          pending.resolve({ success: true, latencyMs: latency })
        }
        this.markDeviceHeartbeatReceived(
          (cleanObj.device_id as string) || this.configuredDeviceId,
          {
            firmware: cleanObj.firmware as string | undefined,
            modelVersion: (cleanObj.model_version || cleanObj.modelVersion) as string | undefined,
            status: cleanObj.status as string | undefined,
          }
        )
      }

      // 2. Check for real command ACK
      if (cleanObj.type === 'ack' || cleanObj.ack === true) {
        const reqId = String(cleanObj.request_id || cleanObj.requestId || '')
        if (reqId && this.pendingAcks.has(reqId)) {
          const pending = this.pendingAcks.get(reqId)!
          pending.resolve(cleanObj)
        }
        this.markDeviceHeartbeatReceived((cleanObj.device_id as string) || this.configuredDeviceId)
      }

      // 3. Check for real device heartbeat packet
      if (cleanObj.type === 'heartbeat' || cleanObj.status === 'heartbeat') {
        this.markDeviceHeartbeatReceived(
          (cleanObj.device_id as string) || this.configuredDeviceId,
          {
            firmware: cleanObj.firmware as string | undefined,
            modelVersion: (cleanObj.model_version || cleanObj.modelVersion) as string | undefined,
            status: cleanObj.status as string | undefined,
          }
        )
      }

      // Validate required and optional fields strictly
      const validated = this.validatePayload(topic, cleanObj)
      if (validated) {
        this.lastMessage = validated
        this.lastMessageTime = new Date().toLocaleTimeString()

        // Valid telemetry also confirms active device presence
        this.markDeviceHeartbeatReceived(validated.device_id)

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
            success: false,
            step: 'BROKER_REACHABLE_NO_DEVICE_DETECTED',
            details: `Connected to MQTT broker service (${this.activeConfig?.brokerUrl}) in ${Date.now() - startTime}ms. However, NO physical ESP32-S3 hardware was detected on topics. Awaiting real device transmission.`,
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
