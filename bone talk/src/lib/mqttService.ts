import mqtt, { type MqttClient } from 'mqtt'

export interface MqttConfig {
  brokerUrl: string
  port?: number
  clientId?: string
  username?: string
  password?: string
  emgTopic: string
  imuTopic?: string
  telemetryTopic?: string
  predictionTopic?: string
}

export type MqttConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error'

export interface EmgPacket {
  timestamp: number
  channels: number[]
  samplingRate?: number
}

export interface ImuPacket {
  timestamp: number
  accel: { x: number; y: number; z: number }
  gyro: { x: number; y: number; z: number }
}

export interface DeviceTelemetryPacket {
  timestamp: number
  batteryPct?: number
  rssi?: number
  packetRate?: number
  deviceId?: string
}

export interface PredictionPacket {
  timestamp: string
  command: string
  confidence?: number
}

type EventCallback<T = unknown> = (data: T) => void

export const DEFAULT_MQTT_CONFIG: MqttConfig = {
  brokerUrl: 'ws://localhost:9001',
  emgTopic: 'bonetalk/emg',
  imuTopic: 'bonetalk/imu',
  telemetryTopic: 'bonetalk/telemetry',
  predictionTopic: 'bonetalk/predictions',
}

class MqttService {
  private client: MqttClient | null = null
  private status: MqttConnectionStatus = 'disconnected'
  private config: MqttConfig = { ...DEFAULT_MQTT_CONFIG }
  private listeners: Map<string, Set<EventCallback<any>>> = new Map()

  public getStatus(): MqttConnectionStatus {
    return this.status
  }

  public getConfig(): MqttConfig {
    return { ...this.config }
  }

  public on(event: 'status', cb: EventCallback<MqttConnectionStatus>): () => void
  public on(event: 'emg', cb: EventCallback<EmgPacket>): () => void
  public on(event: 'imu', cb: EventCallback<ImuPacket>): () => void
  public on(event: 'telemetry', cb: EventCallback<DeviceTelemetryPacket>): () => void
  public on(event: 'prediction', cb: EventCallback<PredictionPacket>): () => void
  public on(event: string, cb: EventCallback<any>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(cb)
    return () => this.listeners.get(event)?.delete(cb)
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((cb) => {
      try {
        cb(data)
      } catch (err) {
        console.error(`[MqttService] Error in listener for ${event}:`, err)
      }
    })
  }

  private setStatus(newStatus: MqttConnectionStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus
      this.emit('status', newStatus)
    }
  }

  public connect(customConfig?: Partial<MqttConfig>) {
    if (this.client) {
      this.disconnect()
    }

    this.config = { ...this.config, ...customConfig }
    this.setStatus('connecting')

    try {
      const clientId =
        this.config.clientId ||
        `bonetalk_web_${Math.random().toString(16).substring(2, 8)}`

      this.client = mqtt.connect(this.config.brokerUrl, {
        clientId,
        username: this.config.username,
        password: this.config.password,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 4000,
      })

      this.client.on('connect', () => {
        this.setStatus('connected')
        const topics = [
          this.config.emgTopic,
          this.config.imuTopic,
          this.config.telemetryTopic,
          this.config.predictionTopic,
        ].filter(Boolean) as string[]

        this.client?.subscribe(topics, (err) => {
          if (err) {
            console.warn('[MqttService] Subscribe error:', err)
          }
        })
      })

      this.client.on('reconnect', () => {
        this.setStatus('reconnecting')
      })

      this.client.on('error', (err) => {
        console.warn('[MqttService] Connection error:', err.message)
        this.setStatus('error')
      })

      this.client.on('close', () => {
        if (this.status !== 'disconnected') {
          this.setStatus('disconnected')
        }
      })

      this.client.on('message', (topic, payload) => {
        this.handleIncomingMessage(topic, payload.toString())
      })
    } catch (err) {
      console.error('[MqttService] Failed to initialize client:', err)
      this.setStatus('error')
    }
  }

  public disconnect() {
    if (this.client) {
      try {
        this.client.end(true)
      } catch {
        // ignore close error
      }
      this.client = null
    }
    this.setStatus('disconnected')
  }

  private handleIncomingMessage(topic: string, messageStr: string) {
    try {
      const parsed = JSON.parse(messageStr)

      if (topic === this.config.emgTopic) {
        if (Array.isArray(parsed)) {
          this.emit('emg', { timestamp: Date.now(), channels: parsed })
        } else if (parsed && typeof parsed === 'object') {
          this.emit('emg', {
            timestamp: parsed.timestamp || Date.now(),
            channels: parsed.channels || parsed.emg || parsed.data || [],
            samplingRate: parsed.samplingRate || parsed.fs,
          })
        }
      } else if (topic === this.config.imuTopic) {
        this.emit('imu', {
          timestamp: parsed.timestamp || Date.now(),
          accel: parsed.accel || { x: parsed.ax || 0, y: parsed.ay || 0, z: parsed.az || 0 },
          gyro: parsed.gyro || { x: parsed.gx || 0, y: parsed.gy || 0, z: parsed.gz || 0 },
        })
      } else if (topic === this.config.telemetryTopic) {
        this.emit('telemetry', {
          timestamp: parsed.timestamp || Date.now(),
          batteryPct: parsed.batteryPct ?? parsed.battery,
          rssi: parsed.rssi,
          packetRate: parsed.packetRate ?? parsed.hz,
          deviceId: parsed.deviceId || 'BoneTalk-ESP32-S3',
        })
      } else if (topic === this.config.predictionTopic) {
        this.emit('prediction', {
          timestamp: parsed.timestamp || new Date().toLocaleTimeString(),
          command: parsed.command || parsed.prediction || 'UNKNOWN',
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : undefined,
        })
      }
    } catch {
      // Non-JSON message: ignore
    }
  }
}

export const mqttService = new MqttService()
