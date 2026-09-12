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
import { useLenis } from './hooks/useLenis'

import { OrderProvider } from './context/OrderContext'
import { OrderModal } from './components/order/OrderModal'

function isExperiencePath(): boolean {
  if (typeof window === 'undefined') return false
  const path = window.location.pathname
  return path === '/experience' || path === '/experience/'
}

function App() {
  useLenis()
  const [inExperience, setInExperience] = useState(() => isExperiencePath())

  useEffect(() => {
    const handleLocationChange = () => {
      setInExperience(isExperiencePath())
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

  return (
    <OrderProvider>
      {inExperience ? (
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
      <OrderModal />
    </OrderProvider>
  )
}

export default App
