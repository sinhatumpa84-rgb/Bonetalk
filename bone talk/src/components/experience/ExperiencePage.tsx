import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ShoppingBag } from 'lucide-react'
import { EXHIBITION_PRODUCTS } from './data/exhibitionProducts'
import type { ExhibitionProduct } from './data/exhibitionProducts'
import { BoneTalkAssist } from './BoneTalkAssist'
import { useOrder } from '../../context/OrderContext'
import { TechnicalGrid } from '../layout/TechnicalGrid'
import { ThemeToggle } from '../ui/ThemeToggle'
import { ProductImage } from '../ui/ProductImage'

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
    <div className="min-h-screen bg-graphite text-cream relative selection:bg-cyan-signal/20 selection:text-cyan-signal font-sans transition-colors duration-300">
      {/* ── Reusable Homepage-Style Blueprint Grid System ── */}
      <TechnicalGrid fixed variant="default" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(0,168,137,0.06),transparent_70%)]" />

      {/* ── Sticky Minimal Exhibition Navigation Bar ── */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-graphite/90 border-b border-border px-6 sm:px-12 py-4 flex items-center justify-between transition-colors duration-300">
        <button
          type="button"
          onClick={handleNavigateHome}
          className="group flex items-center gap-3 text-xs font-mono tracking-widest text-cream-muted hover:text-cream transition-colors duration-200 cursor-pointer"
        >
          <span className="text-cyan-signal group-hover:-translate-x-1 transition-transform duration-200">←</span>
          <span>BoneTalk</span>
        </button>

        <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono">
          <span className="hidden sm:inline text-cream-muted tracking-widest uppercase">EXHIBITION ARCHIVE</span>
          <span className="text-[10px] tracking-wider font-semibold uppercase px-2.5 py-0.5 rounded-full bg-cyan-signal/10 border border-cyan-signal/30 text-cyan-signal">
            {EXHIBITION_PRODUCTS.length} EDITIONS
          </span>
          <a
            href="/model-control"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-wider font-semibold uppercase px-2.5 py-1 rounded border border-cyan-signal/40 bg-cyan-signal/10 text-cyan-signal hover:bg-cyan-signal/20 transition-colors"
            title="Open Separate Model & Hardware Control Console"
          >
            CONNECT MODEL ↗
          </a>
          <ThemeToggle />
        </div>
      </header>

      {/* ── Exhibition Header ── */}
      <section className="relative z-10 pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-graphite-elevated text-[11px] font-mono uppercase tracking-widest text-cyan-signal mb-6 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-signal animate-pulse" />
          <span>OFFICIAL PRODUCT EXHIBITION</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-cream uppercase mb-6 leading-tight font-display">
          THE BoneTalk <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-signal via-emerald-500 to-teal-600 dark:from-emerald-300 dark:via-teal-200 dark:to-cyan-400">
            COLLECTION
          </span>
        </h1>
        
        <p className="text-cream-muted text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Silent speech EMG wearable technology, presented across heritage editions, skin-tone calibration series, and bespoke collaborations.
        </p>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-mono text-cream-muted">
          <span>SELECT ANY ARTIFACT TO REVEAL SPECIFICATIONS</span>
          <span className="text-cyan-signal animate-bounce">↓</span>
        </div>
      </section>

      {/* ── Main Continuous Vertical Exhibition Stream ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pb-36 space-y-24 sm:space-y-36">
        {EXHIBITION_PRODUCTS.map((product, index) => {
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
      <footer className="relative z-10 border-t border-border bg-graphite-light py-12 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-mono text-cream-muted transition-colors duration-300">
        <div>
          <span>© {new Date().getFullYear()} BoneTalk BIOTECH. ALL HARDWARE PHOTOGRAPHS RECORDED IN LAB.</span>
        </div>
        <button
          type="button"
          onClick={handleNavigateHome}
          className="text-cream-muted hover:text-cyan-signal transition-colors uppercase tracking-widest flex items-center gap-2 cursor-pointer"
        >
          <span>RETURN TO HOME</span>
          <span>↗</span>
        </button>
      </footer>

      {/* ── BoneTalk Assist Entry Point ── */}
      <BoneTalkAssist />
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
      <div className="flex items-center justify-between border-b border-border pb-3 mb-8 text-[11px] font-mono uppercase tracking-widest text-cream-muted">
        <div className="flex items-center gap-3">
          <span className="text-cyan-signal font-semibold">#{serialNumber}</span>
          <span className="text-cream font-medium">{product.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-cream-muted">{product.edition}</span>
          <span className="text-cyan-signal/90 font-medium">{product.availability}</span>
        </div>
      </div>

      {/* 2-Column Grid for Opposite-Side Pairing */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${isRight ? 'lg:grid-flow-row' : ''}`}>
        
        {/* LEFT COLUMN SLOT (lg:col-span-6) */}
        <div className={`lg:col-span-6 order-2 ${isRight ? 'order-2 lg:order-1' : 'order-1 lg:order-1'}`}>
          {isRight ? (
            isOpen ? (
              <DetailPanel product={product} onClose={onClose} />
            ) : (
              <ClosedEditorialHint product={product} serialNumber={serialNumber} onOpen={onToggle} align="left" />
            )
          ) : (
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
            <ProductImageFrame
              product={product}
              index={index}
              isOpen={isOpen}
              onToggle={onToggle}
            />
          ) : (
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
      <div
        onClick={onToggle}
        className={`group relative w-full max-w-[620px] rounded-sm overflow-hidden cursor-pointer transition-all duration-300 border ${
          isOpen
            ? 'border-cyan-signal/70 shadow-[0_0_35px_rgba(0,168,137,0.18)] ring-1 ring-cyan-signal/50'
            : 'border-border hover:border-border-strong shadow-[var(--shadow-level-2)]'
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
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,rgba(0,168,137,0.06)_0,transparent_70%)] z-10" />
        
        {/* Technical Corner Brackets */}
        <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-border-strong pointer-events-none z-10" />
        <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-border-strong pointer-events-none z-10" />
        <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-border-strong pointer-events-none z-10" />
        <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-border-strong pointer-events-none z-10" />

        {/* Standardized Product Photograph */}
        <ProductImage
          src={product.image}
          alt={product.name}
          aspectRatio="16/10"
          priority={index === 0}
          imageClassName="transition-transform duration-500 group-hover:scale-[1.03]"
        />

        {/* Hover / Active Badge Overlay */}
        <div className="absolute bottom-3 right-3 z-20">
          <div className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-wider uppercase transition-all duration-200 flex items-center gap-1.5 ${
            isOpen 
              ? 'bg-cyan-signal text-neutral-950 font-bold shadow-md' 
              : 'bg-graphite/85 backdrop-blur-sm text-cream-muted border border-border group-hover:border-cyan-signal group-hover:text-cyan-signal'
          }`}>
            <span>{isOpen ? 'INSPECTING' : 'CLICK TO INSPECT'}</span>
            <span className="text-[9px]">{isOpen ? '●' : '↗'}</span>
          </div>
        </div>
      </div>

      {/* Caption directly under the photograph */}
      <div className="w-full max-w-[620px] mt-3 flex items-center justify-between text-[11px] font-mono text-cream-muted px-1">
        <span className="uppercase tracking-wider text-cream font-medium">{product.name}</span>
        <span className="text-cyan-signal font-semibold">{product.price}</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DETAIL PANEL (Editorial Information Sheet)
// ─────────────────────────────────────────────────────────────────────────────

interface DetailPanelProps {
  product: ExhibitionProduct
  onClose: () => void
}

const DetailPanel: React.FC<DetailPanelProps> = ({ product, onClose }) => {
  const { openOrderModal } = useOrder()
  return (
    <div 
      className="relative w-full max-w-[580px] bg-graphite-elevated/95 backdrop-blur-xl border border-cyan-signal/30 rounded-sm p-6 sm:p-8 shadow-[var(--shadow-level-3)] animate-in fade-in zoom-in-95 duration-200 transition-colors duration-300"
      role="region"
      aria-label={`Detailed specifications for ${product.name}`}
    >
      {/* Top Technical Header & Small Close Button */}
      <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-cyan-signal">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-signal" />
          <span>TECHNICAL SPECIFICATION ENVELOPE</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-sm border border-border hover:border-cyan-signal text-cream-muted hover:text-cream font-mono text-sm transition-colors cursor-pointer"
          aria-label="Close specifications sheet"
        >
          ✕
        </button>
      </div>

      {/* 1. PRICE */}
      <div className="mb-6 pb-4 border-b border-border">
        <span className="block text-[10px] font-mono uppercase tracking-widest text-cyan-signal/80 mb-1.5">
          VALUATION (INR)
        </span>
        <div className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-cream flex items-baseline gap-1">
          <span className="text-cyan-signal">{product.price}</span>
          <span className="text-[10px] font-mono text-cream-muted ml-2 font-normal uppercase tracking-wider">ALL INCL.</span>
        </div>
      </div>

      {/* 2. PRODUCT NAME & EDITION */}
      <div className="mb-6 pb-6 border-b border-border">
        <span className="block text-[10px] font-mono uppercase tracking-widest text-cyan-signal/80 mb-1">
          {product.edition}
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-cream uppercase tracking-tight font-display">
          {product.name}
        </h3>
      </div>

      {/* 3. MAIN BENEFIT */}
      <div className="mb-5">
        <span className="block text-[10px] font-mono uppercase tracking-widest text-cream-muted mb-1">
          PRIMARY BENEFIT
        </span>
        <p className="text-sm text-cream/90 leading-relaxed">
          {product.benefit}
        </p>
      </div>

      {/* 4. SPECIALTY / DIFFERENTIATOR */}
      <div className="mb-5">
        <span className="block text-[10px] font-mono uppercase tracking-widest text-cream-muted mb-1">
          SPECIALTY & HARDWARE CHARACTERISTICS
        </span>
        <p className="text-xs font-mono text-cream-muted leading-relaxed bg-graphite p-3 rounded-sm border border-border">
          {product.specialty}
        </p>
      </div>

      {/* 5. WHY THIS PRICE / VALUE */}
      <div className="mb-6">
        <span className="block text-[10px] font-mono uppercase tracking-widest text-cream-muted mb-1">
          VALUE JUSTIFICATION & SENSING ARCHITECTURE
        </span>
        <p className="text-xs font-mono text-cream-muted leading-relaxed">
          {product.valueReason}
        </p>
      </div>

      {/* 6. ORDER NOW ACTION & ENQUIRY */}
      <div className="pt-4 border-t border-border space-y-3">
        <button
          type="button"
          onClick={() => openOrderModal(product)}
          className="w-full flex items-center justify-center gap-2 rounded-sm bg-cyan-signal hover:bg-emerald-400 text-neutral-950 font-display font-bold py-3 px-5 text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-[0_0_20px_rgba(0,168,137,0.25)] hover:shadow-[0_0_30px_rgba(0,168,137,0.4)] cursor-pointer"
        >
          <ShoppingBag size={15} />
          <span>ORDER NOW — {product.price}</span>
        </button>

        <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
          <div>
            <span className="block text-[9px] font-mono uppercase tracking-widest text-cream-muted mb-0.5">
              PRODUCTION STATUS
            </span>
            <span className="inline-block text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded bg-cyan-signal/10 border border-cyan-signal/30 text-cyan-signal">
              {product.availability}
            </span>
          </div>

          <a
            href={`mailto:concierge@bonetalk.in?subject=Enquiry%20regarding%20BoneTalk%20${encodeURIComponent(product.name)}`}
            className="text-[11px] font-mono uppercase tracking-widest text-cream-muted hover:text-cyan-signal underline underline-offset-4 transition-colors"
          >
            CONTACT CONCIERGE ↗
          </a>
        </div>
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
  const { openOrderModal } = useOrder()
  return (
    <div className={`w-full max-w-[500px] py-8 ${align === 'right' ? 'lg:pl-8' : 'lg:pr-8'}`}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-cyan-signal font-semibold">[{serialNumber}]</span>
          <span className="text-xs font-mono text-cream-muted uppercase tracking-widest">{product.edition}</span>
        </div>
        
        <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-cream font-display">
          {product.name}
        </h3>
        
        <p className="text-xs sm:text-sm text-cream-muted leading-relaxed line-clamp-2">
          {product.benefit}
        </p>

        <div className="pt-2 flex items-center gap-4 flex-wrap">
          <button
            type="button"
            onClick={onOpen}
            className="group flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cream-muted hover:text-cyan-signal transition-colors cursor-pointer"
          >
            <span>REVEAL SPECIFICATIONS</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
          <button
            type="button"
            onClick={() => openOrderModal(product)}
            className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded bg-cyan-signal/10 border border-cyan-signal/30 text-cyan-signal hover:bg-cyan-signal hover:text-neutral-950 transition-colors cursor-pointer"
          >
            <ShoppingBag size={12} />
            <span>ORDER ({product.price})</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExperiencePage
