/**
 * SAAKANTHA Speech Synthesis Service
 * Native Web Speech API abstraction with robust fallback and error handling.
 */

export interface SpeechOptions {
  voice?: SpeechSynthesisVoice | null
  rate?: number
  pitch?: number
  volume?: number
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: unknown) => void
}

const MAX_SPEECH_LENGTH = 300 // Bound speech length to prevent buffer/engine hangs

class SpeechService {
  private synth: SpeechSynthesis | null = null
  private voices: SpeechSynthesisVoice[] = []
  private isInitialized = false
  private currentUtterance: SpeechSynthesisUtterance | null = null // Retain reference to prevent GC bug

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        this.synth = window.speechSynthesis
        this.initVoices()
      } catch {
        this.synth = null
      }
    }
  }

  private initVoices() {
    if (!this.synth) return
    
    const loadVoices = () => {
      try {
        this.voices = this.synth?.getVoices() || []
        this.isInitialized = true
      } catch {
        this.voices = []
      }
    }

    loadVoices()
    if (typeof window !== 'undefined' && 'onvoiceschanged' in this.synth) {
      this.synth.onvoiceschanged = loadVoices
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && this.synth !== null
  }

  public isSpeaking(): boolean {
    return this.currentUtterance !== null || (this.synth !== null && this.synth.speaking)
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.isInitialized && this.synth) {
      try {
        this.voices = this.synth.getVoices()
      } catch {
        this.voices = []
      }
    }
    return this.voices
  }

  public stop(): void {
    if (this.synth) {
      try {
        this.synth.cancel()
        this.currentUtterance = null
      } catch {
        // Ignore synthesis cancel errors
      }
    }
  }

  public pause(): void {
    if (this.synth) {
      try {
        this.synth.pause()
      } catch {
        // Ignore
      }
    }
  }

  public resume(): void {
    if (this.synth) {
      try {
        this.synth.resume()
      } catch {
        // Ignore
      }
    }
  }

  public speak(rawText: string, options: SpeechOptions = {}): boolean {
    if (!this.isSupported() || !this.synth) {
      if (options.onError) {
        options.onError(new Error('Speech synthesis is unsupported in this browser.'))
      }
      return false
    }

    if (!rawText || typeof rawText !== 'string') {
      return false
    }

    // Sanitize and bound text input
    const text = rawText.trim().slice(0, MAX_SPEECH_LENGTH)
    if (!text) return false

    try {
      // Cancel ongoing speech to avoid queued overlap
      this.synth.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      this.currentUtterance = utterance
      
      // Clamp rate, pitch, and volume within safe bounds
      utterance.rate = Math.max(0.1, Math.min(2.0, options.rate ?? 1.0))
      utterance.pitch = Math.max(0.1, Math.min(2.0, options.pitch ?? 1.0))
      utterance.volume = Math.max(0.0, Math.min(1.0, options.volume ?? 1.0))

      if (options.voice) {
        utterance.voice = options.voice
      } else if (this.voices.length > 0) {
        // Prefer an English voice if available
        const preferredVoice = this.voices.find(
          (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium'))
        ) || this.voices.find((v) => v.lang.startsWith('en')) || this.voices[0]

        if (preferredVoice) {
          utterance.voice = preferredVoice
        }
      }

      utterance.onstart = () => {
        if (options.onStart) options.onStart()
      }

      utterance.onend = () => {
        this.currentUtterance = null
        if (options.onEnd) options.onEnd()
      }

      utterance.onerror = (event) => {
        this.currentUtterance = null
        if (options.onError) options.onError(event)
      }

      this.synth.speak(utterance)
      return true
    } catch (err) {
      this.currentUtterance = null
      if (options.onError) options.onError(err)
      return false
    }
  }
}

export const speechService = new SpeechService()
