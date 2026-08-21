import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Eye } from 'lucide-react'
import {
  PRODUCT_COLLECTIONS,
  PRODUCT_VARIANTS,
  type ProductVariant,
} from '../data/productVariants'

interface ExpCollectionSectionProps {
  activeVariant: ProductVariant
  onSelectVariant: (variant: ProductVariant) => void
  onSelectCollection: (colId: 'heritage' | 'skin-tone' | 'anime-tech') => void
  onScrollToTopShowroom: () => void
}

export function ExpCollectionSection({
  activeVariant,
  onSelectVariant,
  onSelectCollection,
  onScrollToTopShowroom,
}: ExpCollectionSectionProps) {
  const [filterCol, setFilterCol] = useState<'all' | 'heritage' | 'skin-tone' | 'anime-tech'>('all')

  const filteredVariants =
    filterCol === 'all'
      ? PRODUCT_VARIANTS
      : PRODUCT_VARIANTS.filter((v) => v.collectionId === filterCol)

  return (
    <section className="relative min-h-screen w-full bg-neutral-50 text-neutral-900 flex flex-col justify-center py-28 px-6 sm:px-12 md:px-20 overflow-hidden border-t border-neutral-200">
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* ── Section Label ── */}
        <div className="flex items-center gap-3 mb-6">
          <span className="h-[1.5px] w-8 bg-neutral-900" />
          <span className="font-mono text-xs tracking-[0.35em] text-neutral-500 uppercase">
            SECTION 07 / THE COLLECTION
          </span>
        </div>

        {/* ── Oversized Editorial Headline ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl tracking-[-0.02em] font-light leading-[1.05] uppercase">
              SAAKANTHA <br />
              <span className="font-normal italic">LOOKBOOK.</span>
            </h2>
            <p className="font-mono text-xs tracking-[0.25em] text-neutral-500 uppercase mt-4">
              AUTHENTIC HARDWARE COLORWAYS & FINISHES
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setFilterCol('all')}
              className={`px-3.5 py-2 font-mono text-[10px] tracking-widest uppercase transition-all cursor-pointer rounded-xs ${
                filterCol === 'all'
                  ? 'bg-neutral-900 text-white font-medium'
                  : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200'
              }`}
            >
              ALL EDITIONS ({PRODUCT_VARIANTS.length})
            </button>
            {PRODUCT_COLLECTIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilterCol(c.id)}
                className={`px-3.5 py-2 font-mono text-[10px] tracking-widest uppercase transition-all cursor-pointer rounded-xs ${
                  filterCol === c.id
                    ? 'bg-neutral-900 text-white font-medium'
                    : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── Editorial Collection Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVariants.map((item, idx) => {
            const isCurrent = item.id === activeVariant.id
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 6) * 0.06, duration: 0.5 }}
                className={`p-8 border bg-white flex flex-col justify-between transition-all rounded-xs relative group ${
                  isCurrent
                    ? 'border-neutral-900 shadow-md ring-1 ring-neutral-900'
                    : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                {/* Header Swatch & Code */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-5 w-5 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: item.podColor }}
                      />
                      <span
                        className="h-5 w-10 rounded-xs border border-black/10 shadow-xs"
                        style={{ backgroundColor: item.bandColor }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-neutral-400 font-semibold tracking-widest">
                      {item.code}
                    </span>
                  </div>

                  <span className="font-mono text-[10px] tracking-widest text-neutral-500 uppercase block mb-1">
                    {item.collectionName}
                  </span>
                  <h3 className="font-display text-2xl font-medium tracking-wide uppercase text-neutral-900 mb-1">
                    {item.name}
                  </h3>
                  <span className="font-mono text-xs text-neutral-600 block mb-4">
                    {item.subtitle}
                  </span>

                  <p className="font-body text-xs text-neutral-600 leading-relaxed font-light mb-6">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Action Row */}
                <div className="border-t border-neutral-100 pt-6 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-neutral-400 uppercase truncate max-w-[160px]">
                    {item.finish}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectCollection(item.collectionId)
                      onSelectVariant(item)
                      onScrollToTopShowroom()
                    }}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-all cursor-pointer rounded-xs ${
                      isCurrent
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-900 hover:text-white'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <Check size={12} />
                        <span>VIEWING 3D</span>
                      </>
                    ) : (
                      <>
                        <Eye size={12} />
                        <span>EXPLORE</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
