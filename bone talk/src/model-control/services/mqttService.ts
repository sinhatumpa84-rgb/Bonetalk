import { mqttService as coreMqttService } from '../../services/mqttService'
import type { ValidatedDeviceMessage, ConnectionDetails, MqttServiceConfig } from '../../services/mqttService'

export type { ValidatedDeviceMessage, ConnectionDetails, MqttServiceConfig }

export interface MqttConfig {
  brokerUrl: string
  clientId?: string
  username?: string
  password?: string
  subscribeTopic: string
  publishTopic: string
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
  emg?: number[] | number
  accel?: { x: number; y: number; z: number }
  gyro?: { x: number; y: number; z: number }
  battery?: number
  rssi?: number
  command?: string
  prediction?: string
  confidence?: number
  packetRate?: number
  noise_level?: number
  speech_detected?: boolean
  vibration?: boolean
  status?: string
}

// Convert 4-state uppercase status to legacy string if needed by older components
function toLegacyStatus(status: string, err: string | null): MqttConnectionStatus {
  if (err && status !== 'CONNECTED') return 'Connection Error'
  switch (status) {
    case 'CONNECTED':
      return 'Connected'
    case 'CONNECTING':
      return 'Connecting...'
    case 'RECONNECTING':
      return 'Reconnecting'
    case 'DISCONNECTED':
    default:
      return 'Disconnected'
  }
}

class MqttServiceBridge {
  public getStatus(): MqttConnectionStatus {
    const details = coreMqttService.getDetails()
    return toLegacyStatus(details.status, details.errorMessage)
  }

  public onStatusChange(listener: (status: MqttConnectionStatus, error?: string) => void): () => void {
    return coreMqttService.onStatusChange((details) => {
      listener(toLegacyStatus(details.status, details.errorMessage), details.errorMessage || undefined)
    })
  }

  public onMessage(listener: (topic: string, payload: SensorPayload) => void): () => void {
    return coreMqttService.onMessage((msg: ValidatedDeviceMessage) => {
      const payload: SensorPayload = {
        deviceId: msg.device_id,
        timestamp: msg.timestamp,
        emg: msg.emg ?? undefined,
        accel: msg.accel ? { x: msg.accel.x, y: msg.accel.y, z: msg.accel.z } : undefined,
        gyro: msg.gyro ? { x: msg.gyro.x, y: msg.gyro.y, z: msg.gyro.z } : undefined,
        battery: msg.battery ?? undefined,
        rssi: msg.rssi ?? undefined,
        packetRate: msg.packetRate,
        command: msg.command ?? undefined,
        prediction: msg.prediction ?? undefined,
        confidence: msg.confidence ?? undefined,
        noise_level: msg.noise_level ?? undefined,
        speech_detected: msg.speech_detected ?? undefined,
        vibration: msg.vibration ?? undefined,
        status: msg.status,
      }
      listener(msg._topic, payload)
    })
  }

  public connect(config: MqttConfig): void {
    coreMqttService.connect({
      brokerUrl: config.brokerUrl,
      clientId: config.clientId,
      username: config.username,
      password: config.password,
      subscribeTopics: [config.subscribeTopic, 'markusblue/device/#', 'bonetalk/device/#'],
      publishTopic: config.publishTopic,
    })
  }

  public disconnect(): void {
    coreMqttService.disconnect()
  }

  public publish(topic: string, message: string | object): boolean {
    return coreMqttService.publish(topic, message)
  }

  public sendCommand(commandName: string, extra: Record<string, unknown> = {}): boolean {
    return coreMqttService.sendCommand(commandName, extra)
  }
}

export const mqttService = new MqttServiceBridge()
export default mqttService
