import mqtt from 'mqtt'
import type { MqttClient } from 'mqtt'

export interface MqttConfig {
  brokerUrl: string // e.g. ws://broker.emqx.io:8083/mqtt or ws://localhost:9001
  clientId?: string
  username?: string
  password?: string
  subscribeTopic: string // e.g. bonetalk/sensors
  publishTopic: string // e.g. bonetalk/commands
}

export type MqttConnectionStatus =
  | 'Disconnected'
  | 'Connecting...'
  | 'Connected'
  | 'Reconnecting'
  | 'Connection Error'

export interface SensorPayload {
  deviceId?: string
  timestamp?: number | string
  emg?: number[] | number // single value or multi-channel array
  accel?: { x: number; y: number; z: number }
  gyro?: { x: number; y: number; z: number }
  battery?: number
  rssi?: number
  command?: string
  prediction?: string
  confidence?: number
  packetRate?: number
}

class MqttService {
  private client: MqttClient | null = null
  private status: MqttConnectionStatus = 'Disconnected'
  private statusListeners: Array<(status: MqttConnectionStatus, error?: string) => void> = []
  private messageListeners: Array<(topic: string, payload: SensorPayload) => void> = []
  private activeConfig: MqttConfig | null = null

  public getStatus(): MqttConnectionStatus {
    return this.status
  }

  public onStatusChange(listener: (status: MqttConnectionStatus, error?: string) => void): () => void {
    this.statusListeners.push(listener)
    listener(this.status)
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener)
    }
  }

  public onMessage(listener: (topic: string, payload: SensorPayload) => void): () => void {
    this.messageListeners.push(listener)
    return () => {
      this.messageListeners = this.messageListeners.filter((l) => l !== listener)
    }
  }

  private setStatus(newStatus: MqttConnectionStatus, error?: string) {
    this.status = newStatus
    this.statusListeners.forEach((l) => l(newStatus, error))
  }

  public connect(config: MqttConfig): void {
    this.disconnect()

    this.activeConfig = config
    this.setStatus('Connecting...')

    try {
      const clientId = config.clientId || `bonetalk_web_${Math.random().toString(16).substring(2, 8)}`
      
      const options: mqtt.IClientOptions = {
        clientId,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 3000,
      }

      if (config.username) options.username = config.username
      if (config.password) options.password = config.password

      this.client = mqtt.connect(config.brokerUrl, options)

      this.client.on('connect', () => {
        this.setStatus('Connected')
        if (this.client && config.subscribeTopic) {
          this.client.subscribe(config.subscribeTopic, (err) => {
            if (err) {
              console.warn(`[MQTT] Subscription error on ${config.subscribeTopic}:`, err)
            }
          })
        }
      })

      this.client.on('reconnect', () => {
        this.setStatus('Reconnecting')
      })

      this.client.on('error', (err) => {
        console.warn('[MQTT] Connection error:', err)
        this.setStatus('Connection Error', err.message || 'MQTT Connection Failed')
      })

      this.client.on('close', () => {
        if (this.status !== 'Connection Error') {
          this.setStatus('Disconnected')
        }
      })

      this.client.on('message', (topic, rawMessage) => {
        try {
          const text = rawMessage.toString('utf-8')
          const parsed = JSON.parse(text)
          this.messageListeners.forEach((l) => l(topic, parsed))
        } catch {
          // Non-JSON raw string
          const text = rawMessage.toString('utf-8')
          this.messageListeners.forEach((l) =>
            l(topic, {
              command: text,
              timestamp: Date.now(),
            })
          )
        }
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown MQTT initialization failure'
      this.setStatus('Connection Error', msg)
    }
  }

  public disconnect(): void {
    if (this.client) {
      try {
        this.client.end(true)
      } catch {
        // ignore disconnect exceptions
      }
      this.client = null
    }
    this.setStatus('Disconnected')
  }

  public publish(topic: string, message: string | object): boolean {
    if (!this.client || this.status !== 'Connected') {
      return false
    }

    const payload = typeof message === 'string' ? message : JSON.stringify(message)
    this.client.publish(topic, payload)
    return true
  }

  public sendCommand(commandName: string, extra: Record<string, unknown> = {}): boolean {
    if (!this.activeConfig?.publishTopic) return false
    return this.publish(this.activeConfig.publishTopic, {
      command: commandName,
      timestamp: Date.now(),
      ...extra,
    })
  }
}

export const mqttService = new MqttService()
