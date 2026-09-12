import React, { useState } from 'react'

export interface ProductImageProps {
  src: string
  alt: string
  aspectRatio?: '16/10' | '4/3' | 'square' | 'auto'
  priority?: boolean
  className?: string
  imageClassName?: string
  showCornerBrackets?: boolean
  onClick?: () => void
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  aspectRatio = '16/10',
  priority = false,
  className = '',
  imageClassName = '',
  showCornerBrackets = false,
  onClick,
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isWide, setIsWide] = useState(false)

  // Map aspect ratio prop to Tailwind utility class
  const aspectClass =
    aspectRatio === '16/10'
      ? 'aspect-[16/10]'
      : aspectRatio === '4/3'
        ? 'aspect-[4/3]'
        : aspectRatio === 'square'
          ? 'aspect-square'
          : 'aspect-auto'

  return (
    <div
      onClick={onClick}
      className={`relative w-full ${aspectClass} overflow-hidden bg-graphite-elevated/60 transition-all ${className}`}
    >
      {/* 1. Loading Shimmer Skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-0 overflow-hidden bg-graphite-elevated/80">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 rounded-full border border-cyan-signal/30 border-t-cyan-signal animate-spin" />
          </div>
        </div>
      )}

      {/* 2. Technical Corner Brackets (optional visual flourish) */}
      {showCornerBrackets && (
        <>
          <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-border-strong pointer-events-none z-10" />
          <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-border-strong pointer-events-none z-10" />
          <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-border-strong pointer-events-none z-10" />
          <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-border-strong pointer-events-none z-10" />
        </>
      )}

      {/* 3. Fallback state if image fails to load */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-graphite-elevated font-mono">
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-cream-muted mb-2">
            <span className="text-xs">BT</span>
          </div>
          <span className="text-[11px] text-cream uppercase tracking-wider">{alt}</span>
          <span className="text-[9px] text-cream-muted/70 mt-1 uppercase tracking-widest">Hardware Preview</span>
        </div>
      ) : (
        /* 4. High-Fidelity Product Photograph */
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={(e) => {
            const img = e.currentTarget
            if (img.naturalWidth && img.naturalHeight) {
              const ratio = img.naturalWidth / img.naturalHeight
              // Calibrated: if aspect ratio is ultra-wide (>1.55, e.g. 1376x768 = 1.792),
              // apply calibrated scale to exclude bottom banner while keeping subject 100% visible
              if (ratio > 1.55) {
                setIsWide(true)
              }
            }
            setIsLoaded(true)
          }}
          onError={() => setHasError(true)}
          className={`h-full w-full object-cover object-top select-none transition-all duration-500 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${isWide ? 'scale-[1.22] origin-top' : ''} ${imageClassName}`}
        />
      )}
    </div>
  )
}

export default ProductImage
