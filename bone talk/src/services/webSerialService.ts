/**
 * Real Web Serial Service for BoneTalk ESP32 Hardware Integration
 * Strictly communicates with physical USB COM port via browser navigator.serial API.
 * ZERO simulation or mock fallback.
 */

export type WebSerialStatus =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'NOT_SUPPORTED'
  | 'ERROR'

export interface WebSerialDetails {
  status: WebSerialStatus
  isSupported: boolean
  portInfo: string | null
  baudRate: number
  lastReceivedTime: string | null
  lastReceivedLine: string | null
  errorMessage: string | null
}

export class WebSerialService {
  private port: any = null
  private reader: any = null
  private writer: any = null
  private readableStreamClosed: Promise<void> | null = null
  private writableStreamClosed: Promise<void> | null = null

  private status: WebSerialStatus = 'DISCONNECTED'
  private baudRate = 115200
  private portInfo: string | null = null
  private lastReceivedTime: string | null = null
  private lastReceivedLine: string | null = null
  private errorMessage: string | null = null

  private statusListeners = new Set<(details: WebSerialDetails) => void>()
  private lineListeners = new Set<(line: string) => void>()

  constructor() {
    if (!this.isSupported()) {
      this.status = 'NOT_SUPPORTED'
    }
  }

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator
  }

  public getStatus(): WebSerialStatus {
    return this.status
  }

  public getDetails(): WebSerialDetails {
    return {
      status: this.status,
      isSupported: this.isSupported(),
      portInfo: this.portInfo,
      baudRate: this.baudRate,
      lastReceivedTime: this.lastReceivedTime,
      lastReceivedLine: this.lastReceivedLine,
      errorMessage: this.errorMessage,
    }
  }

  public onStatusChange(listener: (details: WebSerialDetails) => void): () => void {
    this.statusListeners.add(listener)
    listener(this.getDetails())
    return () => {
      this.statusListeners.delete(listener)
    }
  }

  public onLine(listener: (line: string) => void): () => void {
    this.lineListeners.add(listener)
    return () => {
      this.lineListeners.delete(listener)
    }
  }

  public async connect(baudRate = 115200): Promise<boolean> {
    if (!this.isSupported()) {
      this.status = 'NOT_SUPPORTED'
      this.errorMessage = 'Web Serial API is not supported by this browser. Use Chrome, Edge, or an MQTT WebSocket connection.'
      this.notifyStatusListeners()
      return false
    }

    if (this.status === 'CONNECTED' && this.port) {
      return true
    }

    this.baudRate = baudRate
    this.setStatus('CONNECTING')
    this.errorMessage = null

    try {
      // Prompt user to select physical device COM port
      // @ts-expect-error Web Serial API types
      this.port = await navigator.serial.requestPort()
      await this.port.open({ baudRate: this.baudRate })

      const info = this.port.getInfo?.()
      this.portInfo = info?.usbVendorId ? `USB VID: ${info.usbVendorId} PID: ${info.usbProductId}` : 'Serial Port (Connected)'

      this.setStatus('CONNECTED')
      this.startReading()
      return true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Web Serial connection failed'
      console.warn('[WebSerial Error]:', msg)
      this.errorMessage = msg
      this.port = null
      this.setStatus('ERROR')
      return false
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.port) {
      this.setStatus('DISCONNECTED')
      return
    }

    try {
      if (this.reader) {
        await this.reader.cancel()
        await this.readableStreamClosed?.catch(() => {})
        this.reader = null
      }

      if (this.writer) {
        await this.writer.close()
        await this.writableStreamClosed?.catch(() => {})
        this.writer = null
      }

      if (this.port) {
        await this.port.close()
        this.port = null
      }
    } catch (err) {
      console.warn('[WebSerial Close Warning]:', err)
    } finally {
      this.portInfo = null
      this.setStatus('DISCONNECTED')
    }
  }

  public async send(line: string): Promise<boolean> {
    if (!this.port || this.status !== 'CONNECTED') {
      return false
    }

    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(line.endsWith('\n') ? line : `${line}\n`)
      const writer = this.port.writable.getWriter()
      await writer.write(data)
      writer.releaseLock()
      return true
    } catch (err) {
      console.error('[WebSerial Send Error]:', err)
      return false
    }
  }

  private async startReading(): Promise<void> {
    while (this.port && this.port.readable && this.status === 'CONNECTED') {
      try {
        const textDecoder = new TextDecoderStream()
        this.readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable)
        const reader = textDecoder.readable.getReader()
        this.reader = reader

        let buffer = ''
        while (true) {
          const { value, done } = await reader.read()
          if (done) {
            break
          }
          if (value) {
            buffer += value
            const lines = buffer.split(/\r?\n/)
            buffer = lines.pop() || ''

            for (const line of lines) {
              const trimmed = line.trim()
              if (trimmed) {
                this.lastReceivedLine = trimmed
                this.lastReceivedTime = new Date().toLocaleTimeString()
                this.lineListeners.forEach((l) => l(trimmed))
              }
            }
          }
        }
      } catch (err) {
        if (this.status === 'CONNECTED') {
          console.warn('[WebSerial Read Error]:', err)
        }
        break
      }
    }

    if (this.status === 'CONNECTED') {
      await this.disconnect()
    }
  }

  private setStatus(newStatus: WebSerialStatus): void {
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
        console.error('[WebSerial Status Listener Error]:', err)
      }
    })
  }
}

export const webSerialService = new WebSerialService()
export default webSerialService
