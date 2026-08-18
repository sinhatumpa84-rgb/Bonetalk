import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { SUPPORTED_LANGUAGES } from '../lib/languages'
import type { LanguageConfig } from '../lib/languages'
import { TRANSLATIONS, en } from '../lib/translations'
import type { TranslationSchema } from '../lib/translations'

interface LanguageContextType {
  currentLanguage: LanguageConfig
  setLanguageByCode: (code: string) => void
  translateCommand: (command: string) => string
  languages: LanguageConfig[]
  t: TranslationSchema
}

const STORAGE_KEY = 'saakantha-language'
const LEGACY_STORAGE_KEY = 'bonetalk-language'

const defaultLang = SUPPORTED_LANGUAGES.find((l) => l.code === 'en') || SUPPORTED_LANGUAGES[0]

/** Safe localStorage reader with exception handling */
function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key)
    }
  } catch {
    // Storage access may be blocked in strict private browsing
  }
  return null
}

/** Safe localStorage writer with exception handling */
function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value)
    }
  } catch {
    // Gracefully ignore storage quota / permission errors
  }
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: defaultLang,
  setLanguageByCode: () => {},
  translateCommand: (cmd) => cmd,
  languages: SUPPORTED_LANGUAGES,
  t: en,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageConfig>(() => {
    const savedCode = safeGetItem(STORAGE_KEY) || safeGetItem(LEGACY_STORAGE_KEY)
    if (savedCode && typeof savedCode === 'string') {
      const sanitizedCode = savedCode.trim().slice(0, 10)
      const found = SUPPORTED_LANGUAGES.find((l) => l.code === sanitizedCode)
      if (found) return found
    }
    return defaultLang
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    safeSetItem(STORAGE_KEY, currentLanguage.code)
    
    // Apply RTL document attribute if Arabic or Urdu
    if (currentLanguage.isRTL) {
      document.documentElement.setAttribute('dir', 'rtl')
      document.documentElement.classList.add('rtl-mode')
    } else {
      document.documentElement.setAttribute('dir', 'ltr')
      document.documentElement.classList.remove('rtl-mode')
    }
  }, [currentLanguage])

  const setLanguageByCode = (code: string) => {
    if (!code || typeof code !== 'string') return
    const sanitized = code.trim().slice(0, 10)
    const found = SUPPORTED_LANGUAGES.find((l) => l.code === sanitized)
    if (found) {
      setCurrentLanguage(found)
    }
  }

  const translateCommand = (command: string): string => {
    if (!command || typeof command !== 'string') return ''
    if (currentLanguage.translations && currentLanguage.translations[command as keyof typeof currentLanguage.translations]) {
      return currentLanguage.translations[command as keyof typeof currentLanguage.translations]
    }
    return command
  }

  const t = TRANSLATIONS[currentLanguage.code] || TRANSLATIONS['en'] || en

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguageByCode,
        translateCommand,
        languages: SUPPORTED_LANGUAGES,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
