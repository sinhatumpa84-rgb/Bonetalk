/**
 * BoneTalk Voice AI Module — Type Definitions
 *
 * Isolated TypeScript interfaces for future AI voice datasets,
 * neural voice synthesis models, audio preprocessing, and inference configuration.
 */

export type AudioChannelCount = 1 | 2 // 1 = Mono, 2 = Stereo
export type AudioBitDepth = 16 | 24 | 32
export type ModelExportFormat = 'onnx' | 'tflite' | 'pt' | 'pth' | 'bin'

export interface SpeakerProfile {
  speakerId: string
  name?: string
  gender?: 'female' | 'male' | 'non-binary' | 'neutral'
  accent?: string
  language: string
  sampleCount?: number
  totalDurationSeconds?: number
}

export interface VoiceMetadata {
  datasetId: string
  datasetName: string
  version: string
  language: string
  sampleRateHz: number
  channels: AudioChannelCount
  bitDepth: AudioBitDepth
  totalSamples: number
  totalDurationSeconds: number
  speakerProfiles: SpeakerProfile[]
  splitRatio?: {
    train: number
    validation: number
    test: number
  }
  createdAt?: string
  licensing?: string
  notes?: string
}

export interface VoiceDataset {
  metadata: VoiceMetadata
  rawPath: string
  processedPath: string
  labelsPath: string
  isProcessed: boolean
}

export interface VoiceModel {
  modelId: string
  modelName: string
  version: string
  format: ModelExportFormat
  filePath: string
  inputShape?: number[]
  outputShape?: number[]
  targetSampleRateHz: number
  supportedLanguages: string[]
  supportedVoiceIds: string[]
  isQuantized: boolean
  fileSizeBytes?: number
  metrics?: {
    rtf?: number // Real-Time Factor
    latencyMs?: number
    mcd?: number // Mel-Cepstral Distortion
  }
}

export interface InferenceSettings {
  temperature?: number
  speechRate?: number
  pitchShift?: number
  vocoderType?: string
  chunkSizeSamples?: number
  streamingEnabled?: boolean
}

export interface VoiceConfig {
  sampleRateHz: number
  channels: AudioChannelCount
  supportedLanguages: string[]
  supportedVoiceIds: string[]
  modelName: string
  modelVersion: string
  inputFormat: string
  outputFormat: string
  modelPath: string
  inferenceSettings: InferenceSettings
}
