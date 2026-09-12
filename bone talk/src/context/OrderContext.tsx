import React, { createContext, useContext, useState, useCallback } from 'react'

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
  price: '₹4,499',
  image: '/products/new/charcoal-black.jpeg',
  benefit: 'Assistive wearable that converts muscle signals into communication through personalized signal recognition.',
  specialty: 'Core communication device with advanced EMG sensing.',
}

interface OrderContextType {
  isModalOpen: boolean
  activeProduct: OrderProductPayload | null
  openOrderModal: (product?: OrderProductPayload) => void
  closeOrderModal: () => void
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeProduct, setActiveProduct] = useState<OrderProductPayload | null>(null)

  const openOrderModal = useCallback((product?: OrderProductPayload) => {
    setActiveProduct(product || DEFAULT_PRODUCT)
    setIsModalOpen(true)
  }, [])

  const closeOrderModal = useCallback(() => {
    setIsModalOpen(false)
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
