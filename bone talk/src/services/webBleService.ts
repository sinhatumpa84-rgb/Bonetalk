/**
 * Real Web Bluetooth (BLE) Service for BoneTalk ESP32 Hardware
 * Strictly communicates with physical ESP32 BLE GATT services.
 * ZERO simulation or mock fallback.
 */

export type BleConnectionState =
  | 'DISCONNECTED'
  | 'BLUETOOTH UNAVAILABLE'
  | 'BLUETOOTH PERMISSION REQUIRED'
  | 'SELECT DEVICE'
  | 'CONNECTING TO ESP32'
  | 'DISCOVERING SERVICES'
  | 'VERIFYING DEVICE'
  | 'CONNECTED'
  | 'DATA STREAM ACTIVE'
  | 'CONNECTION LOST'
  | 'CONNECTION ERROR'

export interface BleDeviceDetails {
  id: string | null
  name: string | null
  gattConnected: boolean
  serviceFound: boolean
  serviceUuid: string | null
  txCharFound: boolean
  rxCharFound: boolean
}

export interface BlePacketStats {
  packetCount: number
  lastPacketTime: string | null
  lastPacketTimestamp: number | null
  packetRate: number
  rawPayloadSample: string | null
  connectionDurationSec: number
}

export interface BleSensorData {
  emg: number[] | number | null
  accel: { x: number; y: number; z: number } | null
  gyro: { x: number; y: number; z: number } | null
  battery: number | null
  rssi: number | null
  prediction: string | null
  confidence: number | null
  command: string | null
  timestamp: number | null
}

export interface BleStatusDetails {
  state: BleConnectionState
  isSupported: boolean
  isBluetoothAvailable: boolean
  device: BleDeviceDetails
  stats: BlePacketStats
  sensorData: BleSensorData
  errorMessage: string | null
  verified: boolean
}

// Common ESP32 BLE GATT Service and Characteristic UUIDs
// 1. Nordic UART Service (NUS) - standard for ESP32 BLE serial/streaming
export const NUS_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e'
export const NUS_TX_CHAR_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e' // Notify (ESP32 -> Browser)
export const NUS_RX_CHAR_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e' // Write (Browser -> ESP32)

// 2. Custom BoneTalk Telemetry Service
export const BONETALK_SERVICE_UUID = '0000b01e-0000-1000-8000-00805f9b34fb'
export const BONETALK_TX_CHAR_UUID = '0000b01f-0000-1000-8000-00805f9b34fb'
export const BONETALK_RX_CHAR_UUID = '0000b020-0000-1000-8000-00805f9b34fb'

// 3. Standard ESP32 Sample Service
export const ESP32_SAMPLE_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b'
export const ESP32_SAMPLE_CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8'

// 4. Standard Battery Service
export const BATTERY_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb'
export const BATTERY_LEVEL_CHAR_UUID = '00002a19-0000-1000-8000-00805f9b34fb'

export class WebBleService {
  private device: any = null
  private gattServer: any = null
  private primaryService: any = null
  private txCharacteristic: any = null
  private rxCharacteristic: any = null
  private batteryCharacteristic: any = null

  private state: BleConnectionState = 'DISCONNECTED'
  private isBluetoothAvailable = false
  private errorMessage: string | null = null
  private verified = false
  private connectStartTime: number | null = null

  // Packet statistics
  private packetCount = 0
  private lastPacketTimestamp: number | null = null
  private lastPacketTime: string | null = null
  private recentPacketTimestamps: number[] = []
  private rawPayloadSample: string | null = null

  // Live real sensor data (strictly null when no hardware data received)
  private sensorData: BleSensorData = {
    emg: null,
    accel: null,
    gyro: null,
    battery: null,
    rssi: null,
    prediction: null,
    confidence: null,
    command: null,
    timestamp: null,
  }

  // Text decoding buffer for streaming chunks
  private textBuffer = ''

  // Listeners
  private statusListeners = new Set<(details: BleStatusDetails) => void>()
  private sensorListeners = new Set<(data: BleSensorData) => void>()
  private rawPacketListeners = new Set<(raw: string) => void>()

  constructor() {
    this.checkInitialSupport()
  }

  private getBluetooth(): any {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator
      ? (navigator as any).bluetooth
      : null
  }

  public isSupported(): boolean {
    return Boolean(this.getBluetooth())
  }

  public async checkBluetoothAvailability(): Promise<boolean> {
    const bt = this.getBluetooth()
    if (!bt) {
      this.isBluetoothAvailable = false
      return false
    }

    try {
      if ('getAvailability' in bt) {
        const available = await bt.getAvailability()
        this.isBluetoothAvailable = Boolean(available)
        if (!available && this.state === 'DISCONNECTED') {
          this.setState('BLUETOOTH UNAVAILABLE')
          this.errorMessage =
            'Bluetooth is turned off or unavailable. Turn on Bluetooth on your computer and try again.'
        }
        return this.isBluetoothAvailable
      }
      this.isBluetoothAvailable = true
      return true
    } catch (err) {
      console.warn('[BLE] Could not check Bluetooth availability:', err)
      this.isBluetoothAvailable = true // Fall back to optimistic true if browser doesn't expose getAvailability
      return true
    }
  }

  private async checkInitialSupport() {
    if (!this.isSupported()) {
      this.state = 'BLUETOOTH UNAVAILABLE'
      this.errorMessage =
        'Web Bluetooth is not supported in this browser. Use Chrome or Edge on a compatible device.'
    } else {
      await this.checkBluetoothAvailability()
    }
  }

  public getState(): BleConnectionState {
    return this.state
  }

  public getDetails(): BleStatusDetails {
    // Calculate current packet rate (packets in last 2 seconds)
    const now = Date.now()
    this.recentPacketTimestamps = this.recentPacketTimestamps.filter((t) => now - t <= 2000)
    const packetRate = Math.round((this.recentPacketTimestamps.length / 2) * 10) / 10

    const connectionDurationSec =
      this.connectStartTime && (this.state === 'CONNECTED' || this.state === 'DATA STREAM ACTIVE')
        ? Math.round((now - this.connectStartTime) / 1000)
        : 0

    return {
      state: this.state,
      isSupported: this.isSupported(),
      isBluetoothAvailable: this.isBluetoothAvailable,
      device: {
        id: this.device?.id || null,
        name: this.device?.name || null,
        gattConnected: Boolean(this.gattServer?.connected),
        serviceFound: Boolean(this.primaryService),
        serviceUuid: this.primaryService?.uuid || null,
        txCharFound: Boolean(this.txCharacteristic),
        rxCharFound: Boolean(this.rxCharacteristic),
      },
      stats: {
        packetCount: this.packetCount,
        lastPacketTime: this.lastPacketTime,
        lastPacketTimestamp: this.lastPacketTimestamp,
        packetRate,
        rawPayloadSample: this.rawPayloadSample,
        connectionDurationSec,
      },
      sensorData: { ...this.sensorData },
      errorMessage: this.errorMessage,
      verified: this.verified,
    }
  }

  public onStatusChange(listener: (details: BleStatusDetails) => void): () => void {
    this.statusListeners.add(listener)
    listener(this.getDetails())
    return () => {
      this.statusListeners.delete(listener)
    }
  }

  public onSensorData(listener: (data: BleSensorData) => void): () => void {
    this.sensorListeners.add(listener)
    return () => {
      this.sensorListeners.delete(listener)
    }
  }

  public onRawPacket(listener: (raw: string) => void): () => void {
    this.rawPacketListeners.add(listener)
    return () => {
      this.rawPacketListeners.delete(listener)
    }
  }

  /**
   * Connect to Physical BoneTalk ESP32 Device via Web Bluetooth
   * STRICT: Invoked ONLY upon explicit user gesture (button click).
   */
  public async connect(): Promise<boolean> {
    const bt = this.getBluetooth()
    if (!bt) {
      this.setState('BLUETOOTH UNAVAILABLE')
      this.errorMessage =
        'Web Bluetooth is not supported in this browser. Use Chrome or Edge on a compatible device.'
      this.notifyListeners()
      return false
    }

    // Check availability first
    const isAvail = await this.checkBluetoothAvailability()
    if (!isAvail) {
      this.setState('BLUETOOTH UNAVAILABLE')
      this.errorMessage =
        'Bluetooth is turned off or unavailable. Turn on Bluetooth on your computer and try again.'
      this.notifyListeners()
      return false
    }

    this.errorMessage = null
    this.setState('BLUETOOTH PERMISSION REQUIRED')

    try {
      this.setState('SELECT DEVICE')

      // Request device with BoneTalk name filters or accept all devices with target services
      this.device = await bt.requestDevice({
        filters: [
          { namePrefix: 'BoneTalk' },
          { namePrefix: 'bonetalk' },
          { namePrefix: 'ESP32' },
          { namePrefix: 'esp32' },
          { namePrefix: 'BONE' },
          { namePrefix: 'MarkusBlue' },
        ],
        optionalServices: [
          NUS_SERVICE_UUID,
          BONETALK_SERVICE_UUID,
          ESP32_SAMPLE_SERVICE_UUID,
          BATTERY_SERVICE_UUID,
        ],
      })

      if (!this.device) {
        throw new Error('No device was selected.')
      }

      // Verify that device is an ESP32 or BoneTalk device
      const devName = this.device.name || ''
      const isRecognizedDevice =
        devName.toLowerCase().includes('bonetalk') ||
        devName.toLowerCase().includes('esp32') ||
        devName.toLowerCase().includes('bone') ||
        devName.toLowerCase().includes('markus')

      if (!isRecognizedDevice && devName.length > 0) {
        console.warn(`[BLE] Selected device "${devName}" - verifying BoneTalk GATT service...`)
      }

      // Register disconnect listener
      this.device.removeEventListener('gattserverdisconnected', this.handleGattDisconnected)
      this.device.addEventListener('gattserverdisconnected', this.handleGattDisconnected)

      // Connect to GATT Server
      this.setState('CONNECTING TO ESP32')
      this.gattServer = await this.device.gatt.connect()

      if (!this.gattServer.connected) {
        throw new Error('Could not establish GATT connection to ESP32.')
      }

      // Discover GATT Services
      this.setState('DISCOVERING SERVICES')
      const discovered = await this.discoverBoneTalkServices()

      if (!discovered) {
        throw new Error('ESP32 connected, but BoneTalk service/characteristic was not found.')
      }

      // Start listening to real BLE notifications
      this.setState('VERIFYING DEVICE')
      this.connectStartTime = Date.now()
      await this.startNotifications()

      return true
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error('[BLE Connection Error]:', errorMsg)

      if (
        errorMsg.includes('User cancelled') ||
        errorMsg.includes('User denied') ||
        errorMsg.includes('Chooser cancelled')
      ) {
        this.setState('DISCONNECTED')
        this.errorMessage = 'Device selection was cancelled. Click Connect ESP32 to try again.'
      } else if (
        errorMsg.includes('Bluetooth adapter not available') ||
        errorMsg.includes('Bluetooth is powered off')
      ) {
        this.setState('BLUETOOTH UNAVAILABLE')
        this.errorMessage =
          'Bluetooth is turned off or unavailable. Turn on Bluetooth on your computer and try again.'
      } else if (errorMsg.includes('service/characteristic was not found')) {
        this.setState('CONNECTION ERROR')
        this.errorMessage = 'ESP32 connected, but BoneTalk service/characteristic was not found.'
      } else {
        this.setState('CONNECTION ERROR')
        this.errorMessage = errorMsg
      }

      this.cleanup()
      return false
    }
  }

  /**
   * Discover BoneTalk or NUS GATT Service and Characteristics
   */
  private async discoverBoneTalkServices(): Promise<boolean> {
    if (!this.gattServer || !this.gattServer.connected) return false

    // Try Nordic UART Service first (Standard for ESP32 BLE streaming)
    try {
      this.primaryService = await this.gattServer.getPrimaryService(NUS_SERVICE_UUID)
      if (this.primaryService) {
        try {
          this.txCharacteristic = await this.primaryService.getCharacteristic(NUS_TX_CHAR_UUID)
        } catch {}
        try {
          this.rxCharacteristic = await this.primaryService.getCharacteristic(NUS_RX_CHAR_UUID)
        } catch {}
        if (this.txCharacteristic) return true
      }
    } catch {}

    // Try Custom BoneTalk Service
    try {
      this.primaryService = await this.gattServer.getPrimaryService(BONETALK_SERVICE_UUID)
      if (this.primaryService) {
        try {
          this.txCharacteristic = await this.primaryService.getCharacteristic(BONETALK_TX_CHAR_UUID)
        } catch {}
        try {
          this.rxCharacteristic = await this.primaryService.getCharacteristic(BONETALK_RX_CHAR_UUID)
        } catch {}
        if (this.txCharacteristic) return true
      }
    } catch {}

    // Try ESP32 Sample Service
    try {
      this.primaryService = await this.gattServer.getPrimaryService(ESP32_SAMPLE_SERVICE_UUID)
      if (this.primaryService) {
        try {
          this.txCharacteristic = await this.primaryService.getCharacteristic(ESP32_SAMPLE_CHAR_UUID)
        } catch {}
        if (this.txCharacteristic) return true
      }
    } catch {}

    // Try Battery Service as companion
    try {
      const batService = await this.gattServer.getPrimaryService(BATTERY_SERVICE_UUID)
      if (batService) {
        this.batteryCharacteristic = await batService.getCharacteristic(BATTERY_LEVEL_CHAR_UUID)
        await this.readBatteryLevel()
      }
    } catch {}

    return Boolean(this.primaryService && this.txCharacteristic)
  }

  /**
   * Subscribe to characteristic notifications
   */
  private async startNotifications(): Promise<void> {
    if (!this.txCharacteristic) return

    await this.txCharacteristic.startNotifications()
    this.txCharacteristic.addEventListener(
      'characteristicvaluechanged',
      this.handleCharacteristicValueChanged
    )
  }

  /**
   * Process incoming real BLE packet from physical ESP32
   */
  private handleCharacteristicValueChanged = (event: any) => {
    const value: DataView = event.target.value
    if (!value || value.byteLength === 0) return

    const now = Date.now()
    this.packetCount++
    this.lastPacketTimestamp = now
    this.lastPacketTime = new Date().toLocaleTimeString()
    this.recentPacketTimestamps.push(now)

    // Decode byte buffer to text
    const decoder = new TextDecoder('utf-8')
    const chunk = decoder.decode(value.buffer)
    this.textBuffer += chunk

    // If packets are newline delimited
    const lines = this.textBuffer.split(/\r?\n/)
    this.textBuffer = lines.pop() || ''

    let parsedAny = false

    if (lines.length > 0) {
      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed) {
          this.rawPayloadSample = trimmed.slice(0, 100)
          this.rawPacketListeners.forEach((l) => l(trimmed))
          this.parsePacketLine(trimmed)
          parsedAny = true
        }
      }
    } else if (this.textBuffer.length > 0) {
      // Attempt to parse single chunk if it looks like complete JSON
      const trimmed = this.textBuffer.trim()
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        this.rawPayloadSample = trimmed.slice(0, 100)
        this.rawPacketListeners.forEach((l) => l(trimmed))
        this.parsePacketLine(trimmed)
        this.textBuffer = ''
        parsedAny = true
      }
    }

    // Mark verified on first real valid data packet
    if (!this.verified && parsedAny) {
      this.verified = true
      this.setState('CONNECTED')
      setTimeout(() => {
        if (this.state === 'CONNECTED') {
          this.setState('DATA STREAM ACTIVE')
        }
      }, 500)
    } else if (this.state === 'CONNECTED' && parsedAny) {
      this.setState('DATA STREAM ACTIVE')
    }

    this.notifySensorListeners()
    this.notifyListeners()
  }

  /**
   * Parse real packet line (JSON, CSV, or Key-Value)
   */
  private parsePacketLine(line: string): void {
    // 1. Try JSON parsing
    if (line.startsWith('{')) {
      try {
        const obj = JSON.parse(line)

        // EMG
        if (Array.isArray(obj.emg)) {
          this.sensorData.emg = obj.emg.filter(
            (v: unknown): v is number => typeof v === 'number' && isFinite(v)
          )
        } else if (typeof obj.emg === 'number' && isFinite(obj.emg)) {
          this.sensorData.emg = obj.emg
        }

        // Accel
        if (obj.accel && typeof obj.accel === 'object') {
          const a = obj.accel
          if (typeof a.x === 'number' && typeof a.y === 'number' && typeof a.z === 'number') {
            this.sensorData.accel = { x: a.x, y: a.y, z: a.z }
          }
        }

        // Gyro
        if (obj.gyro && typeof obj.gyro === 'object') {
          const g = obj.gyro
          if (typeof g.x === 'number' && typeof g.y === 'number' && typeof g.z === 'number') {
            this.sensorData.gyro = { x: g.x, y: g.y, z: g.z }
          }
        }

        // Battery
        if (typeof obj.battery === 'number' && isFinite(obj.battery)) {
          this.sensorData.battery = Math.min(100, Math.max(0, Math.round(obj.battery)))
        }

        // RSSI
        if (typeof obj.rssi === 'number' && isFinite(obj.rssi)) {
          this.sensorData.rssi = Math.round(obj.rssi)
        }

        // Prediction & Confidence
        if (typeof obj.prediction === 'string') {
          this.sensorData.prediction = obj.prediction
        }
        if (typeof obj.confidence === 'number' && isFinite(obj.confidence)) {
          this.sensorData.confidence = obj.confidence
        }

        // Command
        if (typeof obj.command === 'string') {
          this.sensorData.command = obj.command
        }

        this.sensorData.timestamp = Date.now()
        return
      } catch {
        // Fall through to CSV parsing
      }
    }

    // 2. Try CSV or Key-Value format (e.g. "EMG:512,AX:0.02,AY:-0.98,AZ:0.12")
    const parts = line.split(/[,;\t]/)
    for (const part of parts) {
      const kv = part.split(/[:=]/)
      if (kv.length === 2) {
        const key = kv[0].trim().toUpperCase()
        const val = kv[1].trim()

        if (key === 'EMG') {
          const num = parseFloat(val)
          if (!isNaN(num)) this.sensorData.emg = num
        } else if (key === 'BAT' || key === 'BATTERY') {
          const num = parseInt(val, 10)
          if (!isNaN(num)) this.sensorData.battery = num
        } else if (key === 'PRED' || key === 'PREDICTION') {
          this.sensorData.prediction = val
        } else if (key === 'CONF') {
          const num = parseFloat(val)
          if (!isNaN(num)) this.sensorData.confidence = num
        }
      }
    }
    this.sensorData.timestamp = Date.now()
  }

  /**
   * Read standard battery level if service present
   */
  private async readBatteryLevel(): Promise<void> {
    if (!this.batteryCharacteristic) return
    try {
      const dataView = await this.batteryCharacteristic.readValue()
      const level = dataView.getUint8(0)
      this.sensorData.battery = level
      this.notifyListeners()
    } catch (err) {
      console.warn('[BLE] Could not read battery level:', err)
    }
  }

  /**
   * Handle GATT disconnection (physical device turned off or out of range)
   */
  private handleGattDisconnected = () => {
    console.warn('[BLE] ESP32 GATT server disconnected.')
    this.setState('CONNECTION LOST')
    this.errorMessage = 'ESP32 connection lost. Please verify device power and reconnect.'
    this.cleanupListeners()
    this.notifyListeners()
  }

  /**
   * Send data/command to physical ESP32
   */
  public async send(line: string): Promise<boolean> {
    if (!this.rxCharacteristic || !this.gattServer?.connected) {
      console.warn('[BLE] Cannot send: RX characteristic not available or GATT not connected.')
      return false
    }

    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(line.endsWith('\n') ? line : `${line}\n`)
      if ('writeValueWithoutResponse' in this.rxCharacteristic) {
        await this.rxCharacteristic.writeValueWithoutResponse(data)
      } else {
        await this.rxCharacteristic.writeValue(data)
      }
      return true
    } catch (err) {
      console.error('[BLE Send Error]:', err)
      return false
    }
  }

  /**
   * Explicit Disconnect clicked by user
   */
  public async disconnect(): Promise<void> {
    this.cleanup()
    this.setState('DISCONNECTED')
    this.errorMessage = null
    this.notifyListeners()
  }

  private cleanupListeners() {
    if (this.txCharacteristic) {
      try {
        this.txCharacteristic.removeEventListener(
          'characteristicvaluechanged',
          this.handleCharacteristicValueChanged
        )
        this.txCharacteristic.stopNotifications?.().catch(() => {})
      } catch (err) {
        console.warn('[BLE] Error stopping notifications:', err)
      }
    }
  }

  private cleanup(): void {
    this.cleanupListeners()

    if (this.device) {
      this.device.removeEventListener('gattserverdisconnected', this.handleGattDisconnected)
    }

    if (this.gattServer && this.gattServer.connected) {
      try {
        this.gattServer.disconnect()
      } catch (err) {
        console.warn('[BLE] Error disconnecting GATT:', err)
      }
    }

    this.device = null
    this.gattServer = null
    this.primaryService = null
    this.txCharacteristic = null
    this.rxCharacteristic = null
    this.batteryCharacteristic = null
    this.verified = false
    this.textBuffer = ''
    this.connectStartTime = null

    // Reset live sensors (strictly no leftover fake values)
    this.sensorData = {
      emg: null,
      accel: null,
      gyro: null,
      battery: null,
      rssi: null,
      prediction: null,
      confidence: null,
      command: null,
      timestamp: null,
    }
  }

  private setState(newState: BleConnectionState): void {
    if (this.state !== newState) {
      this.state = newState
      this.notifyListeners()
    }
  }

  private notifyListeners(): void {
    const details = this.getDetails()
    this.statusListeners.forEach((l) => {
      try {
        l(details)
      } catch (err) {
        console.error('[BLE Listener Error]:', err)
      }
    })
  }

  private notifySensorListeners(): void {
    const data = { ...this.sensorData }
    this.sensorListeners.forEach((l) => {
      try {
        l(data)
      } catch (err) {
        console.error('[BLE Sensor Listener Error]:', err)
      }
    })
  }
}

export const webBleService = new WebBleService()
export default webBleService
