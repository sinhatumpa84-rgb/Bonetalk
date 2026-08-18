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
import { useLenis } from './hooks/useLenis'

function App() {
  useLenis()

  return (
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
  )
}

export default App
