/**
 * Standard WebSocket Connection Status
 */
export type WebSocketConnectionStatus =
  | 'CONNECTED'
  | 'CONNECTING'
  | 'DISCONNECTED'
  | 'RECONNECTING'

export interface WebSocketMessage {
  type?: string
  prediction?: string
  confidence?: number
  timestamp?: string | number
  status?: string
  data?: unknown
  error?: string
}

export interface WebSocketServiceDetails {
  status: WebSocketConnectionStatus
  url: string
  lastConnectionTime: string | null
  lastMessageTime: string | null
  lastMessage: WebSocketMessage | null
  errorMessage: string | null
}

export class WebSocketService {
  private socket: WebSocket | null = null
  private status: WebSocketConnectionStatus = 'DISCONNECTED'
  private url: string
  private reconnectAttempt = 0
  private reconnectTimer: number | null = null
  private heartbeatTimer: number | null = null

  private lastConnectionTime: string | null = null
  private lastMessageTime: string | null = null
  private lastMessage: WebSocketMessage | null = null
  private errorMessage: string | null = null

  private statusListeners = new Set<(details: WebSocketServiceDetails) => void>()
  private messageListeners = new Set<(message: WebSocketMessage) => void>()

  constructor() {
    this.url = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/emg'
  }

  // ── Public Accessors ────────────────────────────────────────────────────────

  public getStatus(): WebSocketConnectionStatus {
    return this.status
  }

  public getDetails(): WebSocketServiceDetails {
    return {
      status: this.status,
      url: this.url,
      lastConnectionTime: this.lastConnectionTime,
      lastMessageTime: this.lastMessageTime,
      lastMessage: this.lastMessage,
      errorMessage: this.errorMessage,
    }
  }

  public setUrl(newUrl: string): void {
    if (this.url !== newUrl) {
      this.url = newUrl
      if (this.status === 'CONNECTED' || this.status === 'CONNECTING') {
        this.disconnect()
        this.connect(newUrl)
      }
    }
  }

  public onStatusChange(listener: (details: WebSocketServiceDetails) => void): () => void {
    this.statusListeners.add(listener)
    listener(this.getDetails())
    return () => {
      this.statusListeners.delete(listener)
    }
  }

  public onMessage(listener: (message: WebSocketMessage) => void): () => void {
    this.messageListeners.add(listener)
    return () => {
      this.messageListeners.delete(listener)
    }
  }

  // ── Connection Lifecycle ────────────────────────────────────────────────────

  public connect(customUrl?: string): void {
    if (customUrl) this.url = customUrl

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return // Already connected or connecting
    }

    this.disconnect()
    this.setStatus('CONNECTING')
    this.errorMessage = null

    try {
      this.socket = new WebSocket(this.url)

      this.socket.onopen = () => {
        this.reconnectAttempt = 0
        this.lastConnectionTime = new Date().toLocaleTimeString()
        this.errorMessage = null
        this.setStatus('CONNECTED')
        this.startHeartbeat()
      }

      this.socket.onmessage = (event: MessageEvent) => {
        try {
          const raw = typeof event.data === 'string' ? event.data : new TextDecoder().decode(event.data)
          const parsed = JSON.parse(raw) as WebSocketMessage

          this.lastMessage = parsed
          this.lastMessageTime = new Date().toLocaleTimeString()

          this.messageListeners.forEach((listener) => {
            try {
              listener(parsed)
            } catch (err) {
              console.error('[WebSocket Listener Error]:', err)
            }
          })

          this.notifyStatusListeners()
        } catch {
          // Non-JSON payload
          const fallbackMsg: WebSocketMessage = {
            type: 'raw',
            data: event.data,
            timestamp: Date.now(),
          }
          this.lastMessage = fallbackMsg
          this.lastMessageTime = new Date().toLocaleTimeString()
          this.messageListeners.forEach((l) => l(fallbackMsg))
          this.notifyStatusListeners()
        }
      }

      this.socket.onerror = () => {
        this.errorMessage = `WebSocket connection error on ${this.url}`
      }

      this.socket.onclose = (event: CloseEvent) => {
        this.stopHeartbeat()
        if (event.code !== 1000) {
          // Abnormal closure, trigger exponential backoff reconnect
          this.handleReconnect()
        } else {
          this.setStatus('DISCONNECTED')
        }
      }
    } catch (err) {
      this.errorMessage = err instanceof Error ? err.message : 'WebSocket failed to initialize'
      this.setStatus('DISCONNECTED')
    }
  }

  public disconnect(): void {
    this.stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.socket) {
      try {
        this.socket.onopen = null
        this.socket.onmessage = null
        this.socket.onerror = null
        this.socket.onclose = null
        this.socket.close(1000, 'Clean disconnect')
      } catch {
        // ignore disconnect errors
      }
      this.socket = null
    }

    this.setStatus('DISCONNECTED')
  }

  public send(data: string | object): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false
    }
    const payload = typeof data === 'string' ? data : JSON.stringify(data)
    this.socket.send(payload)
    return true
  }

  // ── Reconnection with Exponential Backoff ───────────────────────────────────

  private handleReconnect(): void {
    if (this.reconnectTimer) return
    this.setStatus('RECONNECTING')

    this.reconnectAttempt++
    const baseDelay = 1000
    const backoff = Math.min(30000, baseDelay * Math.pow(1.5, this.reconnectAttempt))
    const jitter = backoff * (0.85 + Math.random() * 0.3)

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, jitter)
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatTimer = window.setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        try {
          this.socket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }))
        } catch {
          // ignore heartbeat send exceptions
        }
      }
    }, 25000)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private setStatus(newStatus: WebSocketConnectionStatus): void {
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
        console.error('[WebSocket Status Listener Error]:', err)
      }
    })
  }
}

export const websocketService = new WebSocketService()
export default websocketService
