/**
 * BoneTalk Voice AI Module — Configuration Specification
 *
 * This configuration holds parameters for the future voice AI subsystem.
 * Specific hyperparameters, model checkpoints, and voice IDs will be
 * populated when datasets and trained models are provided.
 */

import type { VoiceConfig } from '../types/voiceTypes'

export const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  // TODO: Set target sample rate once audio dataset format is confirmed (e.g. 16000 or 24000 Hz)
  sampleRateHz: 16000,

  // Mono standard for acoustic feature extraction and speech generation
  channels: 1,

  // TODO: List target languages supported by future trained models (e.g. ['en-US', 'hi-IN'])
  supportedLanguages: [],

  // TODO: Register custom speaker voice IDs once speaker datasets are provided
  supportedVoiceIds: [],

  // TODO: Set model identifier once architecture is selected (e.g. 'bonetalk-vits-base' or 'bonetalk-fastspeech2')
  modelName: 'bonetalk-voice-pending',

  // TODO: Set model version when first checkpoint is trained
  modelVersion: '0.0.0',

  // Audio / acoustic feature input format
  inputFormat: 'phoneme_sequence_or_emg_embedding',

  // Target synthesis audio format
  outputFormat: 'wav_pcm_16bit',

  // TODO: Path to exported model file (e.g. '/models/exported/bonetalk_voice.onnx')
  modelPath: '',

  // Default inference settings for neural speech generation
  inferenceSettings: {
    // TODO: Adjust generation temperature / noise scale when model is trained
    temperature: 0.667,
    // Baseline speech playback rate
    speechRate: 1.0,
    // TODO: Configure pitch shift parameter if pitch normalization is required
    pitchShift: 0.0,
    // TODO: Define vocoder type (e.g. 'HiFi-GAN', 'WaveGlow') when model is finalized
    vocoderType: 'pending',
    // Streaming chunk size for low-latency playback
    chunkSizeSamples: 1024,
    // Set to true once streaming inference endpoint or runtime is integrated
    streamingEnabled: false,
  },
}
