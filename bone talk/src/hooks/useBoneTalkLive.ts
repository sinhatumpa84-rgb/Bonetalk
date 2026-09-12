import { useState, useEffect, useCallback, useRef } from 'react'

const BACKEND_URL = 'http://localhost:8000'
const WS_URL = 'ws://localhost:8000/ws/emg'

interface LivePrediction {
  prediction: string
  confidence: number
  timestamp?: string
}

interface BackendStatus {
  model_loaded: boolean
  classes?: string[]
  feature_count?: number
  model_type?: string
}

/**
 * Hook that connects to the BoneTalk FastAPI backend.
 * When live mode is enabled, it polls the backend status and
 * listens for predictions via WebSocket.
 *
 * Falls back gracefully — if the backend is not running, live mode
 * simply shows "Backend offline" without breaking the simulated demo.
 */
export function useBoneTalkLive() {
  const [isLive, setIsLive] = useState(false)
  const [backendOnline, setBackendOnline] = useState(false)
  const [livePrediction, setLivePrediction] = useState<LivePrediction | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Check backend status
  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/status`, { signal: AbortSignal.timeout(2000) })
      if (res.ok) {
        const data: BackendStatus = await res.json()
        setBackendOnline(data.model_loaded)
        return data.model_loaded
      }
    } catch {
      // Backend not reachable
    }
    setBackendOnline(false)
    return false
  }, [])

  // Poll status when live mode is toggled on
  useEffect(() => {
    if (!isLive) {
      setBackendOnline(false)
      setLivePrediction(null)
      return
    }
    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [isLive, checkStatus])

  // WebSocket connection for streaming predictions
  useEffect(() => {
    if (!isLive || !backendOnline) {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      return
    }

    try {
      const ws = new WebSocket(WS_URL)
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as LivePrediction
          if (data.prediction) {
            setLivePrediction(data)
          }
        } catch { /* ignore parse errors */ }
      }
      ws.onerror = () => setBackendOnline(false)
      ws.onclose = () => { wsRef.current = null }
      wsRef.current = ws
    } catch { /* WebSocket not available */ }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [isLive, backendOnline])

  return {
    isLive,
    setIsLive,
    backendOnline,
    livePrediction,
  }
}
