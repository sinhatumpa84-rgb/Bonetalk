import { Navigation } from './components/layout/Navigation'
import { HeroSection } from './components/sections/HeroSection'
import { HowItWorksSection } from './components/sections/HowItWorksSection'
import { HardwareShowcaseSection } from './components/sections/HardwareShowcaseSection'
import { TechnologySection } from './components/sections/TechnologySection'
import { PersonalizeSection } from './components/sections/PersonalizeSection'
import { VisionSection } from './components/sections/VisionSection'
import { useLenis } from './hooks/useLenis'

function App() {
  useLenis()

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-emerald-100 selection:text-emerald-900">
      <Navigation />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <HardwareShowcaseSection />
        <TechnologySection />
        <PersonalizeSection />
        <VisionSection />
      </main>
    </div>
  )
}

export default App
