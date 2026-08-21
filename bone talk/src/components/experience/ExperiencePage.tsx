import { useState, useEffect } from 'react'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { PRODUCT_VARIANTS, type ProductVariant } from './data/productVariants'
import { OpeningReveal } from './OpeningReveal'
import { ExpObjectSection } from './sections/ExpObjectSection'
import { ExpFormSection } from './sections/ExpFormSection'
import { ExpSignalSection } from './sections/ExpSignalSection'
import { ExpIntelligenceSection } from './sections/ExpIntelligenceSection'
import { ExpLanguageSection } from './sections/ExpLanguageSection'
import { ExpVoiceSection } from './sections/ExpVoiceSection'
import { ExpCollectionSection } from './sections/ExpCollectionSection'
import { ExpFinaleSection } from './sections/ExpFinaleSection'

interface ExperiencePageProps {
  onNavigateHome: () => void
}

export function ExperiencePage({ onNavigateHome }: ExperiencePageProps) {
  const [activeVariant, setActiveVariant] = useState<ProductVariant>(PRODUCT_VARIANTS[0])
  const [activeCollectionId, setActiveCollectionId] = useState<'heritage' | 'skin-tone' | 'anime-tech'>('heritage')
  const [activeFocus, setActiveFocus] = useState<'full' | 'module' | 'sensor' | 'strap'>('full')
  const [autoRotate, setAutoRotate] = useState(false)
  const [rotationY, setRotationY] = useState(0)
  const [, setOpeningComplete] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleScrollToLookbook = () => {
    const lookbook = document.getElementById('collection-lookbook')
    if (lookbook) {
      lookbook.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-black text-white selection:bg-cyan-500/30 selection:text-white">
      {/* ── 1. CINEMATIC OPENING REVEAL SEQUENCE ── */}
      <OpeningReveal onComplete={() => setOpeningComplete(true)} />

      {/* ── 2. MINIMAL LUXURY HEADER BAR ── */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 md:px-12 py-5 flex items-center justify-between pointer-events-none">
        {/* Return to Home */}
        <div className="pointer-events-auto">
          <button
            type="button"
            onClick={onNavigateHome}
            className="group inline-flex items-center gap-2 rounded-xs px-3.5 py-1.5 font-mono text-xs text-neutral-300 transition-all hover:text-white bg-black/60 backdrop-blur-md border border-neutral-800/80 cursor-pointer shadow-xs"
            aria-label="Return to Main Website"
          >
            <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-1" />
            <span className="tracking-widest">HOME</span>
          </button>
        </div>

        {/* Center Live Product Identifier */}
        <div className="hidden sm:flex items-center gap-3 px-4 py-1.5 rounded-xs bg-black/60 backdrop-blur-md border border-neutral-800/80 font-mono text-[10px] tracking-widest text-neutral-400 uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>SAAKANTHA</span>
          <span className="text-neutral-600">/</span>
          <span className="text-white font-medium">{activeVariant.name}</span>
        </div>

        {/* Jump to Collection Lookbook */}
        <div className="pointer-events-auto">
          <button
            type="button"
            onClick={handleScrollToLookbook}
            className="inline-flex items-center gap-2 rounded-xs px-3.5 py-1.5 font-mono text-xs text-neutral-300 transition-all hover:text-white hover:border-neutral-600 bg-black/60 backdrop-blur-md border border-neutral-800/80 cursor-pointer"
          >
            <Sparkles size={12} className="text-cyan-400" />
            <span className="tracking-widest hidden sm:inline">LOOKBOOK</span>
          </button>
        </div>
      </header>

      {/* ── 3. SECTION 01: THE OBJECT [BLACK 360° SHOWROOM] ── */}
      <ExpObjectSection
        variant={activeVariant}
        onSelectVariant={setActiveVariant}
        activeCollectionId={activeCollectionId}
        onSelectCollection={setActiveCollectionId}
        activeFocus={activeFocus}
        onChangeFocus={setActiveFocus}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
        onResetRotation={() => {
          setRotationY(0)
          setActiveFocus('full')
        }}
        rotationY={rotationY}
        onUserRotate={setRotationY}
        isMobile={isMobile}
      />

      {/* ── 4. SECTION 02: THE FORM [PURE WHITE EDITORIAL] ── */}
      <ExpFormSection variant={activeVariant} />

      {/* ── 5. SECTION 03: THE SIGNAL [BLACK CINEMATIC EMG] ── */}
      <ExpSignalSection variant={activeVariant} />

      {/* ── 6. SECTION 04: THE INTELLIGENCE [PURE WHITE EDITORIAL] ── */}
      <ExpIntelligenceSection />

      {/* ── 7. SECTION 05: THE LANGUAGE [BLACK INTENT DECODER] ── */}
      <ExpLanguageSection />

      {/* ── 8. SECTION 06: THE VOICE [PURE WHITE ACOUSTICS] ── */}
      <ExpVoiceSection />

      {/* ── 9. SECTION 07: THE COLLECTION [PURE WHITE CATALOG] ── */}
      <div id="collection-lookbook">
        <ExpCollectionSection
          activeVariant={activeVariant}
          onSelectVariant={setActiveVariant}
          onSelectCollection={setActiveCollectionId}
          onScrollToTopShowroom={handleScrollToTop}
        />
      </div>

      {/* ── 10. SECTION 08: THE FINALE [BLACK CINEMATIC SPOTLIGHT] ── */}
      <ExpFinaleSection
        variant={activeVariant}
        onScrollToTop={handleScrollToTop}
        onNavigateHome={onNavigateHome}
        isMobile={isMobile}
      />
    </div>
  )
}
