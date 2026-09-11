import React, { useState, useEffect, useRef, useCallback } from 'react'
import { EXHIBITION_PRODUCTS } from './data/exhibitionProducts'
import type { ExhibitionProduct } from './data/exhibitionProducts'

interface ExperiencePageProps {
  onNavigateHome?: () => void
}

export const ExperiencePage: React.FC<ExperiencePageProps> = ({ onNavigateHome }) => {
  const [activeProductId, setActiveProductId] = useState<string | null>(null)
  const rowRefs = useRef<Map<string, HTMLElement>>(new Map())

  const handleNavigateHome = () => {
    if (onNavigateHome) {
      onNavigateHome()
    } else {
      window.history.pushState({}, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }

  // Auto-close detail panel when the selected product scrolls out of view
  useEffect(() => {
    if (!activeProductId) return

    const activeEl = rowRefs.current.get(activeProductId)
    if (!activeEl) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // If product element leaves the viewport or has minimal visibility, close the panel
        if (!entry.isIntersecting || entry.intersectionRatio < 0.15) {
          setActiveProductId(null)
        }
      },
      {
        root: null,
        rootMargin: '-5% 0px -5% 0px',
        threshold: [0, 0.15, 0.5],
      }
    )

    observer.observe(activeEl)
    return () => observer.disconnect()
  }, [activeProductId])

  const setRowRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) {
      rowRefs.current.set(id, el)
    } else {
      rowRefs.current.delete(id)
    }
  }, [])

  const handleToggleProduct = (id: string) => {
    setActiveProductId(prev => (prev === id ? null : id))
  }

  const handleCloseDetail = () => {
    setActiveProductId(null)
  }

  return (
    <div className="min-h-screen bg-[#06080B] text-[#E6ECEF] relative selection:bg-emerald-500/20 selection:text-emerald-300 font-sans">
      {/* ── Background Grid & Visual Language ── */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem'
        }}
      />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(45,212,191,0.08),transparent_70%)]" />

      {/* ── Fixed Minimal Exhibition Navigation Bar ── */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#06080B]/85 border-b border-white/[0.08] px-6 sm:px-12 py-4 flex items-center justify-between">
        <button
          onClick={handleNavigateHome}
          className="group flex items-center gap-3 text-xs font-mono tracking-widest text-neutral-400 hover:text-white transition-colors duration-200"
        >
          <span className="text-emerald-400 group-hover:-translate-x-1 transition-transform duration-200">←</span>
          <span>SAAKANTHA</span>
        </button>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="hidden sm:inline text-neutral-500 tracking-widest uppercase">EXHIBITION ARCHIVE</span>
          <span className="text-[10px] tracking-wider font-semibold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            {EXHIBITION_PRODUCTS.length} EDITIONS
          </span>
        </div>
      </header>

      {/* ── Exhibition Header ── */}
      <section className="relative z-10 pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-[11px] font-mono uppercase tracking-widest text-emerald-400 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>OFFICIAL PRODUCT EXHIBITION</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white uppercase mb-6 leading-tight">
          THE SAAKANTHA <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-400">
            COLLECTION
          </span>
        </h1>
        
        <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Silent speech EMG wearable technology, presented across heritage editions, skin-tone calibration series, and bespoke collaborations.
        </p>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-mono text-neutral-500">
          <span>SELECT ANY ARTIFACT TO REVEAL SPECIFICATIONS</span>
          <span className="text-emerald-400 animate-bounce">↓</span>
        </div>
      </section>

      {/* ── Main Continuous Vertical Exhibition Stream ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pb-36 space-y-24 sm:space-y-36">
        {EXHIBITION_PRODUCTS.map((product, index) => {
          // Rule 7: index 0 = RIGHT, index 1 = LEFT, index 2 = RIGHT, index 3 = LEFT...
          const isRight = index % 2 === 0
          const isOpen = activeProductId === product.id

          return (
            <ProductExhibitionMoment
              key={product.id}
              product={product}
              index={index}
              isRight={isRight}
              isOpen={isOpen}
              onToggle={() => handleToggleProduct(product.id)}
              onClose={handleCloseDetail}
              setRef={(el) => setRowRef(product.id, el)}
            />
          )
        })}
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-[#040608] py-12 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-mono text-neutral-500">
        <div>
          <span>© {new Date().getFullYear()} SAAKANTHA BIOTECH. ALL HARDWARE PHOTOGRAPHS RECORDED IN LAB.</span>
        </div>
        <button
          onClick={handleNavigateHome}
          className="text-neutral-400 hover:text-emerald-400 transition-colors uppercase tracking-widest flex items-center gap-2"
        >
          <span>RETURN TO HOME</span>
          <span>↗</span>
        </button>
      </footer>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// INDIVIDUAL PRODUCT EXHIBITION MOMENT
// ─────────────────────────────────────────────────────────────────────────────

interface ProductExhibitionMomentProps {
  product: ExhibitionProduct
  index: number
  isRight: boolean
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  setRef: (el: HTMLElement | null) => void
}

const ProductExhibitionMoment: React.FC<ProductExhibitionMomentProps> = ({
  product,
  index,
  isRight,
  isOpen,
  onToggle,
  onClose,
  setRef,
}) => {
  const serialNumber = String(index + 1).padStart(2, '0')

  return (
    <div
      ref={setRef}
      id={`product-${product.id}`}
      className="relative scroll-mt-28"
    >
      {/* Subtle Row Divider with Monospace Serial & Edition Tag */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-8 text-[11px] font-mono uppercase tracking-widest text-neutral-500">
        <div className="flex items-center gap-3">
          <span className="text-emerald-500/70 font-semibold">#{serialNumber}</span>
          <span className="text-neutral-400">{product.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-neutral-600">{product.edition}</span>
          <span className="text-emerald-400/80">{product.availability}</span>
        </div>
      </div>

      {/* 
        Desk: 2-Column Grid for Opposite-Side Pairing
        If isRight === true (even index):
          Left Slot: Detail Panel (when open) OR Calm Editorial Indicator (when closed)
          Right Slot: Product Photograph
        If isRight === false (odd index):
          Left Slot: Product Photograph
          Right Slot: Detail Panel (when open) OR Calm Editorial Indicator (when closed)
      */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${isRight ? 'lg:grid-flow-row' : ''}`}>
        
        {/* LEFT COLUMN SLOT (lg:col-span-6) */}
        <div className={`lg:col-span-6 order-2 ${isRight ? 'order-2 lg:order-1' : 'order-1 lg:order-1'}`}>
          {isRight ? (
            /* Left Slot on RIGHT product: Shows Detail Panel if OPEN, else Editorial Teaser */
            isOpen ? (
              <DetailPanel product={product} onClose={onClose} />
            ) : (
              <ClosedEditorialHint product={product} serialNumber={serialNumber} onOpen={onToggle} align="left" />
            )
          ) : (
            /* Left Slot on LEFT product: Shows Product Image */
            <ProductImageFrame
              product={product}
              index={index}
              isOpen={isOpen}
              onToggle={onToggle}
            />
          )}
        </div>

        {/* RIGHT COLUMN SLOT (lg:col-span-6) */}
        <div className={`lg:col-span-6 order-1 ${isRight ? 'order-1 lg:order-2' : 'order-2 lg:order-2'}`}>
          {isRight ? (
            /* Right Slot on RIGHT product: Shows Product Image */
            <ProductImageFrame
              product={product}
              index={index}
              isOpen={isOpen}
              onToggle={onToggle}
            />
          ) : (
            /* Right Slot on LEFT product: Shows Detail Panel if OPEN, else Editorial Teaser */
            isOpen ? (
              <DetailPanel product={product} onClose={onClose} />
            ) : (
              <ClosedEditorialHint product={product} serialNumber={serialNumber} onOpen={onToggle} align="right" />
            )
          )}
        </div>

      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT IMAGE FRAME (4:3 Controlled Editorial Frame, Max-Width <= 680px)
// ─────────────────────────────────────────────────────────────────────────────

interface ProductImageFrameProps {
  product: ExhibitionProduct
  index: number
  isOpen: boolean
  onToggle: () => void
}

const ProductImageFrame: React.FC<ProductImageFrameProps> = ({
  product,
  index,
  isOpen,
  onToggle,
}) => {
  return (
    <div className="w-full flex flex-col items-center">
      {/* 
        Controlled 4:3 Editorial Frame 
        Desktop: 35vw–48vw, max-width: 680px
        Mobile: 75vw–90vw
      */}
      <div
        onClick={onToggle}
        className={`group relative w-full max-w-[620px] aspect-[4/3] rounded-sm overflow-hidden cursor-pointer transition-all duration-300 bg-[#0B0E14] border ${
          isOpen
            ? 'border-emerald-400/60 shadow-[0_0_40px_rgba(45,212,191,0.15)] ring-1 ring-emerald-400/40'
            : 'border-white/[0.12] hover:border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
        }`}
        role="button"
        tabIndex={0}
        aria-label={`View specifications for ${product.name}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggle()
          }
        }}
      >
        {/* Subtle Inner Frame Grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0,transparent_70%)]" />
        
        {/* Technical Corner Brackets */}
        <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-white/20 pointer-events-none" />
        <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-white/20 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-white/20 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-white/20 pointer-events-none" />

        {/* 
          Actual Photograph from picture/
          Using object-fit: contain inside the 4:3 frame to preserve exact proportions without distortion
        */}
        <img
          src={product.image}
          alt={product.name}
          loading={index === 0 ? 'eager' : 'lazy'}
          className="w-full h-full object-contain p-2 sm:p-4 transition-transform duration-500 group-hover:scale-[1.02]"
        />

        {/* Hover / Active Badge Overlay */}
        <div className="absolute bottom-3 right-3 z-10">
          <div className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-wider uppercase transition-all duration-200 flex items-center gap-1.5 ${
            isOpen 
              ? 'bg-emerald-400 text-black font-semibold shadow-lg' 
              : 'bg-black/70 backdrop-blur-sm text-neutral-300 border border-white/20 group-hover:border-emerald-400 group-hover:text-white'
          }`}>
            <span>{isOpen ? 'INSPECTING' : 'CLICK TO INSPECT'}</span>
            <span className="text-[9px]">{isOpen ? '●' : '↗'}</span>
          </div>
        </div>
      </div>

      {/* Caption directly under the photograph */}
      <div className="w-full max-w-[620px] mt-3 flex items-center justify-between text-[11px] font-mono text-neutral-400 px-1">
        <span className="uppercase tracking-wider text-neutral-300 font-medium">{product.name}</span>
        <span className="text-emerald-400/90">{product.price}</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DETAIL PANEL (Editorial Information Sheet / Luxury Envelope)
// STRICT INFORMATION HIERARCHY:
// 1. PRICE (visually dominant)
// 2. PRODUCT NAME
// 3. MAIN BENEFIT
// 4. SPECIALTY / DIFFERENTIATOR
// 5. WHY THIS PRICE / VALUE
// 6. AVAILABILITY
// ─────────────────────────────────────────────────────────────────────────────

interface DetailPanelProps {
  product: ExhibitionProduct
  onClose: () => void
}

const DetailPanel: React.FC<DetailPanelProps> = ({ product, onClose }) => {
  return (
    <div 
      className="relative w-full max-w-[580px] bg-[#0A0E17]/95 backdrop-blur-xl border border-emerald-500/30 rounded-sm p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(45,212,191,0.08)] animate-in fade-in zoom-in-95 duration-200"
      role="region"
      aria-label={`Detailed specifications for ${product.name}`}
    >
      {/* Top Technical Header & Small Close Button (Rule 18) */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>TECHNICAL SPECIFICATION ENVELOPE</span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-sm border border-white/10 hover:border-emerald-400 text-neutral-400 hover:text-white font-mono text-sm transition-colors"
          aria-label="Close specifications sheet"
        >
          ✕
        </button>
      </div>

      {/* 1. PRICE (Visually Dominant - Rule 12 & Pricing Rule) */}
      <div className="mb-6 pb-4 border-b border-white/[0.06]">
        <span className="block text-[10px] font-mono uppercase tracking-widest text-emerald-400/80 mb-1.5">
          VALUATION (INR)
        </span>
        <div className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white flex items-baseline gap-1">
          <span className="text-emerald-400">{product.price}</span>
          <span className="text-[10px] font-mono text-neutral-400 ml-2 font-normal uppercase tracking-wider">ALL INCL.</span>
        </div>
      </div>

      {/* 2. PRODUCT NAME & EDITION */}
      <div className="mb-6 pb-6 border-b border-white/[0.06]">
        <span className="block text-[10px] font-mono uppercase tracking-widest text-emerald-400/80 mb-1">
          {product.edition}
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight">
          {product.name}
        </h3>
      </div>

      {/* 3. MAIN BENEFIT */}
      <div className="mb-5">
        <span className="block text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-1">
          PRIMARY BENEFIT
        </span>
        <p className="text-sm text-neutral-200 leading-relaxed">
          {product.benefit}
        </p>
      </div>

      {/* 4. SPECIALTY / DIFFERENTIATOR */}
      <div className="mb-5">
        <span className="block text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-1">
          SPECIALTY & HARDWARE CHARACTERISTICS
        </span>
        <p className="text-xs font-mono text-neutral-300 leading-relaxed bg-white/[0.02] p-3 rounded-sm border border-white/[0.06]">
          {product.specialty}
        </p>
      </div>

      {/* 5. WHY THIS PRICE / VALUE */}
      <div className="mb-6">
        <span className="block text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-1">
          VALUE JUSTIFICATION & SENSING ARCHITECTURE
        </span>
        <p className="text-xs font-mono text-neutral-400 leading-relaxed">
          {product.valueReason}
        </p>
      </div>

      {/* 6. AVAILABILITY & DIRECT ENQUIRY */}
      <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="block text-[9px] font-mono uppercase tracking-widest text-neutral-500 mb-0.5">
            PRODUCTION STATUS
          </span>
          <span className="inline-block text-[11px] font-mono font-semibold uppercase px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            {product.availability}
          </span>
        </div>

        <a
          href={`mailto:saakantha@bonetalk.in?subject=Enquiry%20regarding%20SAAKANTHA%20${encodeURIComponent(product.name)}`}
          className="text-xs font-mono uppercase tracking-widest text-neutral-300 hover:text-emerald-300 underline underline-offset-4 transition-colors"
        >
          CONTACT CONCIERGE ↗
        </a>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CLOSED EDITORIAL HINT (Calm opposite slot placeholder before click)
// ─────────────────────────────────────────────────────────────────────────────

interface ClosedEditorialHintProps {
  product: ExhibitionProduct
  serialNumber: string
  onOpen: () => void
  align: 'left' | 'right'
}

const ClosedEditorialHint: React.FC<ClosedEditorialHintProps> = ({
  product,
  serialNumber,
  onOpen,
  align,
}) => {
  return (
    <div className={`w-full max-w-[500px] py-8 ${align === 'right' ? 'lg:pl-8' : 'lg:pr-8'}`}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-emerald-500 font-semibold">[{serialNumber}]</span>
          <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">{product.edition}</span>
        </div>
        
        <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white/90">
          {product.name}
        </h3>
        
        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-2">
          {product.benefit}
        </p>

        <div className="pt-2">
          <button
            onClick={onOpen}
            className="group flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-emerald-400 transition-colors"
          >
            <span>REVEAL TECHNICAL ENVELOPE</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExperiencePage
