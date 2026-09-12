import { useEffect, useState } from 'react'
import type { Product } from './productData'
import { useOrder } from '../../context/OrderContext'

interface ProductDetailPanelProps {
  product: Product
  position: 'left' | 'right'
  onClose: () => void
}

export function ProductDetailPanel({ product, position, onClose }: ProductDetailPanelProps) {
  const { openOrderModal } = useOrder()
  const [isVisible, setIsVisible] = useState(false)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Close panel on scroll
  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDelta = Math.abs(currentScrollY - lastScrollY)
      
      // Close if user scrolls more than 20px
      if (scrollDelta > 20) {
        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => {
          onClose()
        }, 50)
      }
      
      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [onClose])

  const containerStyle: React.CSSProperties = isMobile ? {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
    opacity: isVisible ? 1 : 0,
    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    zIndex: 100,
    maxHeight: '70vh',
    overflowY: 'auto',
  } : {
    position: 'absolute',
    top: '50%',
    [position]: 'clamp(1.5rem, 5vw, 4rem)',
    transform: `translateY(-50%) ${isVisible 
      ? 'translateX(0) scale(1)' 
      : position === 'left' 
        ? 'translateX(-20px) scale(0.96)' 
        : 'translateX(20px) scale(0.96)'
    }`,
    opacity: isVisible ? 1 : 0,
    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    zIndex: 50,
    maxWidth: 'min(420px, 90vw)',
    width: '100%',
    pointerEvents: 'auto',
  }

  const panelStyle: React.CSSProperties = {
    background: 'var(--color-graphite-elevated)',
    border: '1px solid var(--color-border-strong)',
    borderRadius: '4px',
    boxShadow: 'var(--shadow-level-3)',
    padding: 'clamp(1.5rem, 4vw, 2.5rem)',
    position: 'relative',
    backdropFilter: 'blur(12px)',
  }

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--color-border)',
    borderRadius: '2px',
    background: 'transparent',
    color: 'var(--color-cream-muted)',
    cursor: 'pointer',
    fontSize: '1.25rem',
    lineHeight: 1,
    transition: 'all 0.2s ease',
  }

  const priceStyle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: 'var(--color-cyan-signal)',
    marginBottom: '0.5rem',
    lineHeight: 1,
  }

  const productNameStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--color-cream)',
    marginBottom: '2rem',
    lineHeight: 1.4,
  }

  const sectionLabelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.5625rem',
    fontWeight: 600,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'var(--color-cyan-signal)',
    marginBottom: '0.5rem',
    marginTop: '1.5rem',
  }

  const sectionContentStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    lineHeight: 1.6,
    color: 'var(--color-cream-muted)',
  }

  const dividerStyle: React.CSSProperties = {
    height: '1px',
    background: 'var(--color-border)',
    margin: '1.5rem 0',
  }

  const availabilityStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--color-cyan-signal)',
    marginTop: '1.5rem',
    padding: '0.5rem 0.875rem',
    border: '1px solid var(--color-border)',
    borderRadius: '2px',
    background: 'var(--surface-active-cyan)',
  }

  const statusDotStyle: React.CSSProperties = {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: 'var(--color-cyan-signal)',
    flexShrink: 0,
  }

  return (
    <div style={containerStyle}>
      {/* Backdrop overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.4s ease',
          zIndex: -1,
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />
      
      <div style={panelStyle}>
        <button
          style={closeButtonStyle}
          onClick={onClose}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-border)'
            e.currentTarget.style.color = 'var(--color-cream)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--color-cream-muted)'
          }}
          aria-label="Close"
        >
          ×
        </button>

        <div style={priceStyle}>{product.price}</div>
        <div style={productNameStyle}>{product.name}</div>

        <div style={sectionLabelStyle}>MAIN BENEFIT</div>
        <div style={sectionContentStyle}>{product.benefit}</div>

        <div style={dividerStyle} />

        <div style={sectionLabelStyle}>SPECIALTY</div>
        <div style={sectionContentStyle}>{product.specialty}</div>

        <div style={dividerStyle} />

        <div style={sectionLabelStyle}>VALUE</div>
        <div style={sectionContentStyle}>{product.valueReason}</div>

        <div style={availabilityStyle}>
          <div style={statusDotStyle} />
          {product.availability}
        </div>

        <button
          type="button"
          onClick={() => openOrderModal(product)}
          style={{
            width: '100%',
            marginTop: '1.5rem',
            padding: '0.75rem 1rem',
            background: 'var(--color-cyan-signal)',
            color: '#06080B',
            border: 'none',
            borderRadius: '2px',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '0.8125rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 0 20px rgba(0, 216, 165, 0.3)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#34D399'
            e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 216, 165, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-cyan-signal)'
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 216, 165, 0.3)'
          }}
        >
          ORDER NOW — {product.price}
        </button>
      </div>
    </div>
  )
}
