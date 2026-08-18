/**
 * BoneTalk Speech Synthesis Service
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

class SpeechService {
  private synth: SpeechSynthesis | null = null
  private voices: SpeechSynthesisVoice[] = []
  private isInitialized = false

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis
      this.initVoices()
    }
  }

  private initVoices() {
    if (!this.synth) return
    
    const loadVoices = () => {
      this.voices = this.synth?.getVoices() || []
      this.isInitialized = true
    }

    loadVoices()
    if (typeof window !== 'undefined' && 'onvoiceschanged' in this.synth) {
      this.synth.onvoiceschanged = loadVoices
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.isInitialized && this.synth) {
      this.voices = this.synth.getVoices()
    }
    return this.voices
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel()
    }
  }

  public pause(): void {
    if (this.synth) {
      this.synth.pause()
    }
  }

  public resume(): void {
    if (this.synth) {
      this.synth.resume()
    }
  }

  public speak(text: string, options: SpeechOptions = {}): boolean {
    if (!this.isSupported() || !this.synth) {
      if (options.onError) {
        options.onError(new Error('Speech synthesis is unsupported in this browser.'))
      }
      return false
    }

    try {
      // Cancel ongoing speech to avoid queued overlap
      this.synth.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      
      utterance.rate = options.rate ?? 1.0
      utterance.pitch = options.pitch ?? 1.0
      utterance.volume = options.volume ?? 1.0

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
        if (options.onEnd) options.onEnd()
      }

      utterance.onerror = (event) => {
        if (options.onError) options.onError(event)
      }

      this.synth.speak(utterance)
      return true
    } catch (err) {
      if (options.onError) options.onError(err)
      return false
    }
  }
}

export const speechService = new SpeechService()
