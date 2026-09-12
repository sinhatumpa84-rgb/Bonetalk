export interface ModelStatusResponse {
  model_loaded: boolean
  classes?: string[]
  feature_count?: number
  model_type?: string
}

export interface PredictionItem {
  label: string
  confidence: number
}

export interface PredictionResponse {
  prediction?: string
  confidence?: number
  all_predictions?: PredictionItem[]
  timestamp?: string
  error?: string
}

export type ModelSystemStatus = 'Ready' | 'Loading' | 'Unavailable' | 'Error'

class ModelService {
  private backendUrl: string = 'http://localhost:8000'
  private status: ModelSystemStatus = 'Loading'
  private statusListeners: Array<(status: ModelSystemStatus, info?: ModelStatusResponse) => void> = []
  private latestInfo: ModelStatusResponse | null = null
  private pollIntervalId: number | null = null

  constructor() {
    // Check if stored in localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bonetalk_backend_url')
      if (saved) {
        this.backendUrl = saved
      }
    }
  }

  public getBackendUrl(): string {
    return this.backendUrl
  }

  public setBackendUrl(url: string): void {
    this.backendUrl = url.replace(/\/+$/, '')
    if (typeof window !== 'undefined') {
      localStorage.setItem('bonetalk_backend_url', this.backendUrl)
    }
    this.checkStatus()
  }

  public getStatus(): ModelSystemStatus {
    return this.status
  }

  public getLatestInfo(): ModelStatusResponse | null {
    return this.latestInfo
  }

  public onStatusChange(
    listener: (status: ModelSystemStatus, info?: ModelStatusResponse) => void
  ): () => void {
    this.statusListeners.push(listener)
    listener(this.status, this.latestInfo || undefined)
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener)
    }
  }

  private notifyStatus(status: ModelSystemStatus, info?: ModelStatusResponse) {
    this.status = status
    if (info) this.latestInfo = info
    this.statusListeners.forEach((l) => l(status, info))
  }

  public async checkStatus(): Promise<ModelStatusResponse | null> {
    try {
      const res = await fetch(`${this.backendUrl}/api/status`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) {
        this.notifyStatus('Unavailable')
        return null
      }
      const data: ModelStatusResponse = await res.json()
      if (data.model_loaded) {
        this.notifyStatus('Ready', data)
      } else {
        this.notifyStatus('Unavailable', data)
      }
      return data
    } catch {
      this.notifyStatus('Unavailable')
      return null
    }
  }

  public startPolling(intervalMs: number = 8000): void {
    this.stopPolling()
    this.checkStatus()
    this.pollIntervalId = window.setInterval(() => {
      this.checkStatus()
    }, intervalMs)
  }

  public stopPolling(): void {
    if (this.pollIntervalId !== null) {
      clearInterval(this.pollIntervalId)
      this.pollIntervalId = null
    }
  }

  public async predict(
    emgData: number[][],
    samplingRate: number = 1000
  ): Promise<PredictionResponse> {
    if (this.status !== 'Ready') {
      return { error: 'Model is not in Ready state' }
    }

    try {
      const res = await fetch(`${this.backendUrl}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          emg_data: emgData,
          sampling_rate: samplingRate,
        }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        return { error: `HTTP ${res.status}: ${errorText}` }
      }

      const result: PredictionResponse = await res.json()
      return result
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown prediction network error'
      return { error: msg }
    }
  }

  public createStreamingWebSocket(
    onPrediction: (result: PredictionResponse) => void,
    onError?: (err: Event) => void
  ): WebSocket | null {
    const wsUrl = this.backendUrl.replace(/^http/, 'ws') + '/ws/emg'
    try {
      const ws = new WebSocket(wsUrl)
      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data)
          onPrediction(parsed)
        } catch (e) {
          console.error('Failed to parse WebSocket prediction message', e)
        }
      }
      if (onError) {
        ws.onerror = onError
      }
      return ws
    } catch (e) {
      console.error('Failed to initiate inference WebSocket', e)
      return null
    }
  }
}

export const modelService = new ModelService()
