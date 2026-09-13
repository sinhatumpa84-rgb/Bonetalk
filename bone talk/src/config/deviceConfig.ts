/**
 * BoneTalk Centralized Device Hardware Configuration
 * Target Board: Arduino UNO R4 WiFi (containing internal ESP32-S3 connectivity module)
 */

export interface DeviceConfig {
  /** Internal hardware identifier type */
  readonly type: string
  /** Official full product name */
  readonly name: string
  /** Compact display name for high-density cards & buttons */
  readonly shortName: string
  /** Unique Device ID assigned to unit */
  readonly id: string
  /** Primary communication transport layer */
  readonly transport: 'wifi' | 'mqtt' | 'ble' | 'serial'
  /** Networking protocol */
  readonly protocol: 'mqtt' | 'websocket' | 'gatt'
  /** Internal connectivity co-processor specifications */
  readonly internalModule: string
  /** Main microcontroller unit */
  readonly mcu: string
  /** Analog frontend specifications */
  readonly adcResolution: string
  /** Default MQTT base topic */
  readonly baseTopic: string
}

export const DEVICE_CONFIG: DeviceConfig = {
  type: 'arduino_uno_r4_wifi',
  name: 'Arduino UNO R4 WiFi',
  shortName: 'Arduino UNO R4Y5',
  id: 'BONE-01',
  transport: 'wifi',
  protocol: 'mqtt',
  internalModule: 'ESP32-S3 WiFi/BLE Gateway (Internal)',
  mcu: 'Renesas RA4M1 32-bit Cortex-M4 (48MHz)',
  adcResolution: '14-bit (0-16383)',
  baseTopic: 'bonetalk/device/BONE-01',
} as const
