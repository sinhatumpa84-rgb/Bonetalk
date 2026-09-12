import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { BONETALK_PRICING } from '../lib/constants'
import { EXHIBITION_PRODUCTS } from '../components/experience/data/exhibitionProducts'
import { products } from '../components/experience/productData'

export interface OrderProductPayload {
  id: string
  name: string
  edition?: string
  price: string | number
  image?: string
  benefit?: string
  specialty?: string
}

export const DEFAULT_PRODUCT: OrderProductPayload = {
  id: 'saakantha-01',
  name: 'BoneTalk CORE',
  edition: 'FLAGSHIP EDITION',
  price: BONETALK_PRICING.display,
  image: '/products/new/charcoal-black.jpeg',
  benefit: 'Assistive wearable that converts muscle signals into communication through personalized signal recognition.',
  specialty: 'Core communication device with advanced EMG sensing.',
}

function findProductById(id: string): OrderProductPayload | null {
  const exh = EXHIBITION_PRODUCTS.find((p) => p.id === id)
  if (exh) {
    return {
      id: exh.id,
      name: exh.name,
      edition: exh.edition,
      price: exh.price,
      image: exh.image,
      benefit: exh.benefit,
      specialty: exh.specialty,
    }
  }
  const prod = products.find((p) => p.id === id)
  if (prod) {
    return {
      id: prod.id,
      name: prod.name,
      price: prod.price,
      image: prod.image,
      benefit: prod.benefit,
      specialty: prod.specialty,
    }
  }
  return null
}

function resolveProductFromUrl(): OrderProductPayload {
  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search)
      const prodId = params.get('product')
      if (prodId) {
        const found = findProductById(prodId)
        if (found) return found
      }
      const cached = sessionStorage.getItem('bonetalk_active_product')
      if (cached) {
        return JSON.parse(cached)
      }
    } catch {
      // ignore storage errors
    }
  }
  return DEFAULT_PRODUCT
}

interface OrderContextType {
  /** Whether the checkout page is currently active (product selected) */
  isModalOpen: boolean
  activeProduct: OrderProductPayload
  /** Stores the product and navigates to /checkout */
  openOrderModal: (product?: OrderProductPayload) => void
  /** Clears the active product state */
  closeOrderModal: () => void
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeProduct, setActiveProduct] = useState<OrderProductPayload>(() => resolveProductFromUrl())

  const openOrderModal = useCallback((product?: OrderProductPayload) => {
    const prod = product || DEFAULT_PRODUCT
    setActiveProduct(prod)
    setIsModalOpen(true)
    try {
      sessionStorage.setItem('bonetalk_active_product', JSON.stringify(prod))
    } catch {
      // ignore
    }
    const query = prod.id ? `?product=${encodeURIComponent(prod.id)}` : ''
    window.history.pushState({}, '', `/checkout${query}`)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, [])

  const closeOrderModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  // Sync activeProduct if the user navigates browser history
  useEffect(() => {
    const handleLocationChange = () => {
      if (window.location.pathname.startsWith('/checkout')) {
        const prod = resolveProductFromUrl()
        setActiveProduct(prod)
      }
    }
    window.addEventListener('popstate', handleLocationChange)
    return () => window.removeEventListener('popstate', handleLocationChange)
  }, [])

  return (
    <OrderContext.Provider
      value={{
        isModalOpen,
        activeProduct,
        openOrderModal,
        closeOrderModal,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export function useOrder() {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider')
  }
  return context
}
