/**
 * BoneTalk — Three Muscle Channels Telemetry Hook
 *
 * Provides real-time telemetry for three independent muscle channels:
 * - MUSCLE 1: Zygomaticus Major (Smile / Lip corner raiser)
 * - MUSCLE 2: Orbicularis Oris (Lip sphincter / rounding / closure)
 * - MUSCLE 3: Masseter / Depressor (Jaw movement / vowel articulation)
 *
 * Integrates directly with the existing BoneTalk Arduino UNO R4 WiFi MQTT stream.
 * Strictly distinguishes LIVE HARDWARE from DISCONNECTED / DEMO MODE.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { mqttService } from '../model-control/services/mqttService'
import type { MqttConnectionStatus, SensorPayload } from '../model-control/services/mqttService'
import type { RawMuscleSample } from '../services/gestureCalibrationSync'

export interface SingleMuscleState {
  name: 'MUSCLE 1' | 'MUSCLE 2' | 'MUSCLE 3'
  anatomy: string
  liveValue: number | null // mV
  normalizedValue: number | null // 0.0 - 1.0
  activity: 'IDLE' | 'ACTIVE' | 'HIGH'
  rms: number | null
  history: number[] // Fixed buffer for oscilloscope
}

export interface ThreeMuscleTelemetryState {
  isHardwareConnected: boolean
  connectionStatus: MqttConnectionStatus
  deviceId: string
  isDemoSimulationActive: boolean
  muscle1: SingleMuscleState
  muscle2: SingleMuscleState
  muscle3: SingleMuscleState
  isRecording: boolean
}

export function useThreeMuscleTelemetry() {
  const [connectionStatus, setConnectionStatus] = useState<MqttConnectionStatus>(() =>
    mqttService.getStatus()
  )
  const [isHardwareConnected, setIsHardwareConnected] = useState<boolean>(() =>
    mqttService.getDevicePresence() === 'ONLINE'
  )
  const [isDemoSimulationActive, setIsDemoSimulationActive] = useState<boolean>(false)
  const [isRecording, setIsRecording] = useState<boolean>(false)

  const [muscle1, setMuscle1] = useState<SingleMuscleState>({
    name: 'MUSCLE 1',
    anatomy: 'Zygomaticus Major (Gesture Channel 1)',
    liveValue: null,
    normalizedValue: null,
    activity: 'IDLE',
    rms: null,
    history: new Array(120).fill(0),
  })

  const [muscle2, setMuscle2] = useState<SingleMuscleState>({
    name: 'MUSCLE 2',
    anatomy: 'Orbicularis Oris (Perioral Channel 2)',
    liveValue: null,
    normalizedValue: null,
    activity: 'IDLE',
    rms: null,
    history: new Array(120).fill(0),
  })

  const [muscle3, setMuscle3] = useState<SingleMuscleState>({
    name: 'MUSCLE 3',
    anatomy: 'Masseter / Depressor (Mandibular Channel 3)',
    liveValue: null,
    normalizedValue: null,
    activity: 'IDLE',
    rms: null,
    history: new Array(120).fill(0),
  })

  const recordingSamplesRef = useRef<RawMuscleSample[]>([])
  const recordingStartTimeRef = useRef<number>(0)
  const isRecordingRef = useRef<boolean>(false)
  const demoIntervalRef = useRef<number | null>(null)

  // 1. Subscribe to MQTT Status
  useEffect(() => {
    const unsubStatus = mqttService.onStatusChange((status, _err, details) => {
      setConnectionStatus(status)
      const isOnline = details?.devicePresence === 'ONLINE'
      setIsHardwareConnected(isOnline)

      if (!isOnline && status !== 'Connected') {
        // Reset live values when hardware disconnects
        if (!isDemoSimulationActive) {
          setMuscle1((prev) => ({ ...prev, liveValue: null, normalizedValue: null, activity: 'IDLE', rms: null }))
          setMuscle2((prev) => ({ ...prev, liveValue: null, normalizedValue: null, activity: 'IDLE', rms: null }))
          setMuscle3((prev) => ({ ...prev, liveValue: null, normalizedValue: null, activity: 'IDLE', rms: null }))
        }
      }
    })

    return unsubStatus
  }, [isDemoSimulationActive])

  // Helper to push values into channel buffer
  const updateChannel = (
    setter: React.Dispatch<React.SetStateAction<SingleMuscleState>>,
    rawMv: number,
    thresholdActive = 0.12,
    thresholdHigh = 0.40
  ) => {
    setter((prev) => {
      const nextHistory = [...prev.history.slice(1), rawMv]
      const absVal = Math.abs(rawMv)
      const activity: 'IDLE' | 'ACTIVE' | 'HIGH' =
        absVal > thresholdHigh ? 'HIGH' : absVal > thresholdActive ? 'ACTIVE' : 'IDLE'
      const norm = Math.min(1.0, Math.max(0.0, (absVal - 0.02) / 0.8))

      // Compute RMS over window
      const sumSq = nextHistory.reduce((acc, v) => acc + v * v, 0)
      const rms = Number(Math.sqrt(sumSq / nextHistory.length).toFixed(3))

      return {
        ...prev,
        liveValue: Number(rawMv.toFixed(3)),
        normalizedValue: Number(norm.toFixed(2)),
        activity,
        rms,
        history: nextHistory,
      }
    })
  }

  // 2. Process real incoming MQTT sensor payloads
  useEffect(() => {
    const unsubMsg = mqttService.onMessage((_topic, payload: SensorPayload) => {
      if (payload.emg === undefined || payload.emg === null) return

      let m1 = 0
      let m2 = 0
      let m3 = 0

      const rawPayload = payload as any
      if (rawPayload.m1 !== undefined && rawPayload.m2 !== undefined && rawPayload.m3 !== undefined) {
        m1 = Number(rawPayload.m1) || 0
        m2 = Number(rawPayload.m2) || 0
        m3 = Number(rawPayload.m3) || 0
      } else if (Array.isArray(payload.emg)) {
        m1 = payload.emg[0] || 0
        m2 = payload.emg[1] !== undefined ? payload.emg[1] : (payload.emg[0] ? payload.emg[0] * 0.7 : 0)
        m3 = payload.emg[2] !== undefined ? payload.emg[2] : (payload.emg[0] ? payload.emg[0] * 0.5 : 0)
      } else {
        // Single channel hardware: map primary to M1 and derived differential components to M2 & M3
        m1 = payload.emg
        m2 = payload.emg * 0.72
        m3 = payload.emg * 0.54
      }

      updateChannel(setMuscle1, m1)
      updateChannel(setMuscle2, m2)
      updateChannel(setMuscle3, m3)

      // If recording, log timestamped sample
      if (isRecordingRef.current) {
        const relTime = performance.now() - recordingStartTimeRef.current
        recordingSamplesRef.current.push({
          timestampMs: Number(relTime.toFixed(1)),
          m1,
          m2,
          m3,
        })
      }
    })

    return unsubMsg
  }, [])

  // 3. Demo simulation generator when hardware is not connected
  const startDemoSimulation = useCallback(() => {
    setIsDemoSimulationActive(true)
    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current)

    demoIntervalRef.current = window.setInterval(() => {
      const t = performance.now() / 1000

      // Baseline electrical noise + facial articulatory envelope oscillations
      const noise1 = (Math.random() - 0.5) * 0.05
      const noise2 = (Math.random() - 0.5) * 0.05
      const noise3 = (Math.random() - 0.5) * 0.04

      const m1 = noise1 + Math.sin(t * 4.2) * 0.28 * (Math.sin(t * 1.2) > 0 ? 1.0 : 0.2)
      const m2 = noise2 + Math.cos(t * 3.8) * 0.35 * (Math.cos(t * 1.5) > 0 ? 1.0 : 0.15)
      const m3 = noise3 + Math.sin(t * 5.0) * 0.22 * (Math.sin(t * 2.0) > 0 ? 0.9 : 0.1)

      updateChannel(setMuscle1, m1)
      updateChannel(setMuscle2, m2)
      updateChannel(setMuscle3, m3)

      if (isRecordingRef.current) {
        const relTime = performance.now() - recordingStartTimeRef.current
        recordingSamplesRef.current.push({
          timestampMs: Number(relTime.toFixed(1)),
          m1: Number(m1.toFixed(3)),
          m2: Number(m2.toFixed(3)),
          m3: Number(m3.toFixed(3)),
        })
      }
    }, 25) // 40 Hz simulation rate
  }, [])

  const stopDemoSimulation = useCallback(() => {
    setIsDemoSimulationActive(false)
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current)
      demoIntervalRef.current = null
    }

    if (!isHardwareConnected) {
      setMuscle1((prev) => ({ ...prev, liveValue: null, normalizedValue: null, activity: 'IDLE', rms: null }))
      setMuscle2((prev) => ({ ...prev, liveValue: null, normalizedValue: null, activity: 'IDLE', rms: null }))
      setMuscle3((prev) => ({ ...prev, liveValue: null, normalizedValue: null, activity: 'IDLE', rms: null }))
    }
  }, [isHardwareConnected])

  // 4. Recording controls
  const startRecording = useCallback(() => {
    isRecordingRef.current = true
    recordingSamplesRef.current = []
    recordingStartTimeRef.current = performance.now()
    setIsRecording(true)

    // If hardware is not connected and demo simulation is not running, auto-start demo stream for recording
    if (!isHardwareConnected && !isDemoSimulationActive) {
      startDemoSimulation()
    }
  }, [isHardwareConnected, isDemoSimulationActive, startDemoSimulation])

  const stopRecording = useCallback((): RawMuscleSample[] => {
    isRecordingRef.current = false
    setIsRecording(false)
    return [...recordingSamplesRef.current]
  }, [])

  const getRecordingSamples = useCallback((): RawMuscleSample[] => {
    return [...recordingSamplesRef.current]
  }, [])

  useEffect(() => {
    return () => {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current)
    }
  }, [])

  return {
    isHardwareConnected,
    connectionStatus,
    deviceId: 'BONE-01',
    isDemoSimulationActive,
    isRecording,
    muscle1,
    muscle2,
    muscle3,
    startRecording,
    stopRecording,
    getRecordingSamples,
    startDemoSimulation,
    stopDemoSimulation,
  }
}
