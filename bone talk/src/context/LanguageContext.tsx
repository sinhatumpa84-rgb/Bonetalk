import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { SUPPORTED_LANGUAGES } from '../lib/languages'
import type { LanguageConfig } from '../lib/languages'

interface LanguageContextType {
  currentLanguage: LanguageConfig
  setLanguageByCode: (code: string) => void
  translateCommand: (command: string) => string
  languages: LanguageConfig[]
}

const STORAGE_KEY = 'bonetalk-language'

const defaultLang = SUPPORTED_LANGUAGES.find((l) => l.code === 'en') || SUPPORTED_LANGUAGES[0]

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: defaultLang,
  setLanguageByCode: () => {},
  translateCommand: (cmd) => cmd,
  languages: SUPPORTED_LANGUAGES,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageConfig>(() => {
    if (typeof window !== 'undefined') {
      const savedCode = localStorage.getItem(STORAGE_KEY)
      if (savedCode) {
        const found = SUPPORTED_LANGUAGES.find((l) => l.code === savedCode)
        if (found) return found
      }
    }
    return defaultLang
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    localStorage.setItem(STORAGE_KEY, currentLanguage.code)
    
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
    const found = SUPPORTED_LANGUAGES.find((l) => l.code === code)
    if (found) {
      setCurrentLanguage(found)
    }
  }

  const translateCommand = (command: string): string => {
    if (currentLanguage.translations && currentLanguage.translations[command as keyof typeof currentLanguage.translations]) {
      return currentLanguage.translations[command as keyof typeof currentLanguage.translations]
    }
    return command
  }

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguageByCode,
        translateCommand,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
