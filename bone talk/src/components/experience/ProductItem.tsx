import { useEffect, useRef, useState } from 'react'
import type { Product } from './productData'

interface ProductItemProps {
  product: Product
  position: 'left' | 'right'
  index: number
  onClick: () => void
  isSelected: boolean
}

export function ProductItem({ product, position, index, onClick, isSelected }: ProductItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  // Mobile check
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: isMobile ? 'center' : (position === 'right' ? 'flex-end' : 'flex-start'),
    alignItems: 'center',
    minHeight: 'auto',
    paddingTop: 'clamp(3rem, 8vh, 6rem)',
    paddingBottom: 'clamp(3rem, 8vh, 6rem)',
    paddingLeft: isMobile 
      ? '1.5rem' 
      : position === 'left' 
        ? 'clamp(1.5rem, 5vw, 4rem)' 
        : 'clamp(1.5rem, 12vw, 20rem)',
    paddingRight: isMobile 
      ? '1.5rem' 
      : position === 'right' 
        ? 'clamp(1.5rem, 5vw, 4rem)' 
        : 'clamp(1.5rem, 12vw, 20rem)',
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
    transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
    transitionDelay: '0.1s',
  }

  const productCardStyle: React.CSSProperties = {
    position: 'relative',
    width: isMobile ? 'min(90vw, 500px)' : 'min(42vw, 680px)',
    maxWidth: '680px',
    cursor: 'pointer',
    transform: isSelected ? 'scale(0.98)' : 'scale(1)',
    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  }

  const imageContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio: '4 / 3',
    overflow: 'hidden',
    borderRadius: '4px',
    background: 'var(--color-graphite-elevated)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-level-2)',
    opacity: imageLoaded ? 1 : 0,
    transition: 'opacity 0.5s ease, box-shadow 0.3s ease, transform 0.3s ease',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    fontWeight: 600,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'var(--color-cyan-signal)',
    marginTop: '1rem',
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
    transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
    transitionDelay: '0.3s',
  }

  return (
    <div ref={ref} style={containerStyle}>
      <div
        style={productCardStyle}
        onClick={onClick}
        onMouseEnter={(e) => {
          if (!isSelected) {
            const img = e.currentTarget.querySelector('div') as HTMLElement
            if (img) {
              img.style.transform = 'scale(1.02)'
              img.style.boxShadow = 'var(--shadow-hover)'
            }
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            const img = e.currentTarget.querySelector('div') as HTMLElement
            if (img) {
              img.style.transform = 'scale(1)'
              img.style.boxShadow = 'var(--shadow-level-2)'
            }
          }
        }}
      >
        <div style={imageContainerStyle}>
          <img
            src={product.image}
            alt={product.name}
            loading={index < 2 ? 'eager' : 'lazy'}
            onLoad={() => setImageLoaded(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
        <div style={labelStyle}>
          {product.name} / {String(index + 1).padStart(2, '0')}
        </div>
      </div>
    </div>
  )
}
