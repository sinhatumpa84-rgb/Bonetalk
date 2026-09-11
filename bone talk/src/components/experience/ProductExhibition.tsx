import { useState } from 'react'
import { products } from './productData'
import { ProductItem } from './ProductItem'
import { ProductDetailPanel } from './ProductDetailPanel'
import type { Product } from './productData'

export function ProductExhibition() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
  }

  const handleClose = () => {
    setSelectedProduct(null)
  }

  return (
    <div 
      className="relative"
      style={{
        paddingTop: '120px',
        paddingBottom: '120px',
        background: 'var(--color-graphite)',
        position: 'relative',
      }}
    >
      {/* Engineering Grid Background - Same as Landing Page */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-line) 1px, transparent 1px),
            linear-gradient(var(--grid-secondary) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-secondary) 1px, transparent 1px)
          `,
          backgroundSize: `
            var(--grid-size) var(--grid-size),
            var(--grid-size) var(--grid-size),
            var(--grid-subsize) var(--grid-subsize),
            var(--grid-subsize) var(--grid-subsize)
          `,
          backgroundPosition: '-1px -1px, -1px -1px, -1px -1px, -1px -1px',
          opacity: 1,
          zIndex: 0,
        }}
      />

      {/* Subtle Vignette */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, var(--color-graphite) 100%)',
          opacity: 0.3,
          zIndex: 0,
        }}
      />

      {/* Product Exhibition Stream */}
      <div className="relative z-10">
        {products.map((product, index) => {
          // Calculate position: even index = RIGHT, odd index = LEFT
          const position: 'left' | 'right' = index % 2 === 0 ? 'right' : 'left'
          const isSelected = selectedProduct?.id === product.id
          const detailPosition = position === 'right' ? 'left' : 'right'

          return (
            <div key={product.id} className="relative" style={{ position: 'relative' }}>
              <ProductItem
                product={product}
                position={position}
                index={index}
                onClick={() => handleProductClick(product)}
                isSelected={isSelected}
              />
              
              {/* Detail Panel on Opposite Side - Positioned relative to product */}
              {isSelected && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
                  <ProductDetailPanel
                    product={product}
                    position={detailPosition}
                    onClose={handleClose}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
