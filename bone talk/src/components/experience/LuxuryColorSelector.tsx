import { motion } from 'framer-motion'
import {
  PRODUCT_COLLECTIONS,
  PRODUCT_VARIANTS,
  type ProductVariant,
} from './data/productVariants'

interface LuxuryColorSelectorProps {
  activeVariant: ProductVariant
  onSelectVariant: (variant: ProductVariant) => void
  activeCollectionId: 'heritage' | 'skin-tone' | 'anime-tech'
  onSelectCollection: (colId: 'heritage' | 'skin-tone' | 'anime-tech') => void
  isLight?: boolean
}

export function LuxuryColorSelector({
  activeVariant,
  onSelectVariant,
  activeCollectionId,
  onSelectCollection,
  isLight = false,
}: LuxuryColorSelectorProps) {
  const collectionVariants = PRODUCT_VARIANTS.filter(
    (v) => v.collectionId === activeCollectionId
  )

  return (
    <div className="flex flex-col gap-5 w-full max-w-xl">
      {/* ── Collection Editorial Tabs ── */}
      <div className="flex items-center gap-1 border-b pb-2.5 overflow-x-auto no-scrollbar border-neutral-800/80">
        {PRODUCT_COLLECTIONS.map((col) => {
          const isActive = col.id === activeCollectionId
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => {
                onSelectCollection(col.id)
                const firstInCol = PRODUCT_VARIANTS.find((v) => v.collectionId === col.id)
                if (firstInCol) onSelectVariant(firstInCol)
              }}
              className={`group relative px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? isLight
                    ? 'text-neutral-900 font-medium'
                    : 'text-white font-medium'
                  : isLight
                  ? 'text-neutral-400 hover:text-neutral-700'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <span className="opacity-50 mr-1.5">{col.number} /</span>
              <span>{col.name}</span>

              {isActive && (
                <motion.div
                  layoutId="activeCollectionUnderline"
                  className={`absolute bottom-[-11px] left-0 right-0 h-[1.5px] ${
                    isLight ? 'bg-neutral-900' : 'bg-cyan-400'
                  }`}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* ── Editorial Variant Swatches / Pills ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {collectionVariants.map((variant) => {
          const isSelected = variant.id === activeVariant.id
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelectVariant(variant)}
              className={`group relative flex flex-col items-start p-2.5 border transition-all text-left cursor-pointer ${
                isSelected
                  ? isLight
                    ? 'border-neutral-900 bg-neutral-100 shadow-sm'
                    : 'border-cyan-400/90 bg-neutral-900/90 shadow-[0_0_15px_rgba(34,211,238,0.12)]'
                  : isLight
                  ? 'border-neutral-200 hover:border-neutral-400 bg-white/60'
                  : 'border-neutral-800/70 hover:border-neutral-700 bg-neutral-950/40'
              }`}
            >
              {/* Top Color Indicator Bar */}
              <div className="flex items-center justify-between w-full mb-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-3 w-3 rounded-full border border-black/20 shadow-inner"
                    style={{ backgroundColor: variant.podColor }}
                  />
                  <span
                    className="h-3 w-3 rounded-sm border border-black/20 shadow-inner"
                    style={{ backgroundColor: variant.bandColor }}
                  />
                </div>
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: variant.ledColor }}
                />
              </div>

              {/* Variant Code & Name */}
              <span
                className={`font-mono text-[9px] tracking-widest uppercase truncate w-full ${
                  isSelected
                    ? isLight
                      ? 'text-neutral-900 font-semibold'
                      : 'text-white font-semibold'
                    : isLight
                    ? 'text-neutral-500'
                    : 'text-neutral-400'
                }`}
              >
                {variant.name}
              </span>
              <span
                className={`font-mono text-[8px] tracking-wider truncate w-full mt-0.5 ${
                  isSelected ? 'text-cyan-400' : 'text-neutral-500'
                }`}
              >
                {variant.subtitle}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Active Variant Detail Row ── */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t text-[11px] font-mono ${
          isLight ? 'border-neutral-200 text-neutral-600' : 'border-neutral-900 text-neutral-400'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-widest text-neutral-500">SPECIFICATION:</span>
          <span className={isLight ? 'text-neutral-900' : 'text-neutral-200'}>
            {activeVariant.finish}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-widest text-neutral-500">EDITION:</span>
          <span className={isLight ? 'text-neutral-900' : 'text-neutral-200'}>
            {activeVariant.code}
          </span>
        </div>
      </div>
    </div>
  )
}
