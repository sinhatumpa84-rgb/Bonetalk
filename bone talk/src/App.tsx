import { Navigation } from './components/layout/Navigation'
import { CustomCursor } from './components/layout/CustomCursor'
import { HeroSection } from './components/sections/HeroSection'
import { ScrollStorySection } from './components/sections/ScrollStorySection'
import { SignalSection } from './components/sections/SignalSection'
import { PipelineSection } from './components/sections/PipelineSection'
import { HardwareSection } from './components/sections/HardwareSection'
import { TeachSection } from './components/sections/TeachSection'
import { AISection } from './components/sections/AISection'
import { HumanConnectionSection } from './components/sections/HumanConnectionSection'
import { FinalRevealSection } from './components/sections/FinalRevealSection'
import { useLenis } from './hooks/useLenis'

function App() {
  useLenis()

  return (
    <>
      <CustomCursor />
      <Navigation />
      <main>
        <HeroSection />
        <ScrollStorySection />
        <SignalSection />
        <PipelineSection />
        <HardwareSection />
        <TeachSection />
        <AISection />
        <HumanConnectionSection />
        <FinalRevealSection />
      </main>
    </>
  )
}

export default App
