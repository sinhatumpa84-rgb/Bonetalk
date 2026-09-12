import { useState, useEffect } from 'react'
import { Navigation } from './components/layout/Navigation'
import { HeroSection } from './components/sections/HeroSection'
import { ScrollStorySection } from './components/sections/ScrollStorySection'
import { SignalSection } from './components/sections/SignalSection'
import { PipelineSection } from './components/sections/PipelineSection'
import { HardwareSection } from './components/sections/HardwareSection'
import { TeachSection } from './components/sections/TeachSection'
import { AISection } from './components/sections/AISection'
import { WorldwideVisionSection } from './components/sections/WorldwideVisionSection'
import { HumanConnectionSection } from './components/sections/HumanConnectionSection'
import { FinalRevealSection } from './components/sections/FinalRevealSection'
import { SignalBridge } from './components/motion/SignalBridge'
import ExperiencePage from './components/experience/ExperiencePage'
import { CheckoutPage } from './components/checkout/CheckoutPage'
import { useLenis } from './hooks/useLenis'

import { OrderProvider } from './context/OrderContext'

type AppRoute = 'home' | 'experience' | 'checkout'

function getRoute(): AppRoute {
  if (typeof window === 'undefined') return 'home'
  const path = window.location.pathname
  if (path === '/experience' || path === '/experience/') return 'experience'
  if (path === '/checkout' || path === '/checkout/') return 'checkout'
  return 'home'
}

function App() {
  useLenis()
  const [route, setRoute] = useState<AppRoute>(() => getRoute())

  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(getRoute())
    }

    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('hashchange', handleLocationChange)
    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('hashchange', handleLocationChange)
    }
  }, [])

  const handleNavigateHome = () => {
    window.history.pushState({}, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const handleNavigateBack = () => {
    const currentPath = window.location.pathname
    window.history.back()
    // Fallback if there is no previous internal history entry
    setTimeout(() => {
      if (window.location.pathname === currentPath) {
        window.history.pushState({}, '', '/experience')
        window.dispatchEvent(new PopStateEvent('popstate'))
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
    }, 150)
  }

  return (
    <OrderProvider>
      {route === 'checkout' ? (
        <CheckoutPage onNavigateBack={handleNavigateBack} />
      ) : route === 'experience' ? (
        <ExperiencePage onNavigateHome={handleNavigateHome} />
      ) : (
        <>
          <Navigation />
          <main>
            <HeroSection />
            <SignalBridge variant="flow" label="DEVICE → SIGNAL" />

            <ScrollStorySection />
            <SignalBridge variant="wave-to-line" label="SIGNAL → DATA" />

            <SignalSection />
            <SignalBridge variant="flow" label="DATA → PIPELINE" />

            <PipelineSection />
            <SignalBridge variant="pulse-down" label="PIPELINE → HARDWARE" />

            <HardwareSection />
            <SignalBridge variant="converge" label="HARDWARE → LEARN" />

            <TeachSection />
            <SignalBridge variant="flow" label="LEARN → AI" />

            <AISection />
            <SignalBridge variant="expand" label="AI → WORLD" />

            <WorldwideVisionSection />
            <SignalBridge variant="converge" label="WORLD → VOICE" />

            <HumanConnectionSection />
            <SignalBridge variant="flow" label="VOICE → VISION" />

            <FinalRevealSection />
          </main>
        </>
      )}
    </OrderProvider>
  )
}

export default App
