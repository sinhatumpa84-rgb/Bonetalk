import React, { useState, useEffect, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShoppingBag,
  ArrowRight,
  Lock,
  Plus,
  Minus,
} from 'lucide-react'
import { useOrder } from '../../context/OrderContext'
import { loadRazorpayScript } from '../../lib/razorpay'
import { calculateBoneTalkPrice } from '../../lib/constants'
import type {
  RazorpaySuccessResponse,
  RazorpayFailureResponse,
  RazorpayCheckoutOptions,
} from '../../lib/razorpay'
import { ProductImage } from '../ui/ProductImage'

// List of Indian States & UTs
const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi NCR',
  'Jammu & Kashmir',
  'Ladakh',
]

interface VerifiedOrderResult {
  order_id: string
  razorpay_order_id: string
  razorpay_payment_id: string
  product_name: string
  product_image?: string
  quantity: number
  amount: number
  currency: string
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_address: {
    address: string
    city: string
    state: string
    pincode: string
  }
  payment_status: string
  created_at: string
}

type ModalView = 'form' | 'processing' | 'success' | 'failed'

export const OrderModal: React.FC = () => {
  const { isModalOpen, activeProduct, closeOrderModal } = useOrder()
  const stateDatalistId = useId()

  const [quantity, setQuantity] = useState(1)
  const [view, setView] = useState<ModalView>('form')
  const [loadingStep, setLoadingStep] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [verifiedOrder, setVerifiedOrder] = useState<VerifiedOrderResult | null>(null)

  // Customer & Delivery Form State
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')

  // Form Field Validation Errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Reset state when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setView('form')
      setQuantity(1)
      setErrorMessage(null)
      setVerifiedOrder(null)
      setFormErrors({})
    }
  }, [isModalOpen, activeProduct])

  // Centralized BoneTalk price calculation (Single Source of Truth)
  const priceObj = calculateBoneTalkPrice(activeProduct?.price)
  const unitPrice = priceObj.numeric
  const subtotal = unitPrice * quantity
  const deliveryCharge = 0 // Free Express Delivery
  const totalAmount = subtotal + deliveryCharge

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!name.trim() || name.trim().length < 2) {
      errors.name = 'Full name is required (min 2 characters)'
    }

    const cleanPhone = phone.replace(/[\s\-+]/g, '')
    if (!cleanPhone) {
      errors.phone = 'Mobile number is required'
    } else if (!/^(\d{2})?[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = 'Enter a valid 10-digit Indian mobile number'
    }

    if (!email.trim()) {
      errors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Enter a valid email address'
    }

    if (!address.trim() || address.trim().length < 5) {
      errors.address = 'Street delivery address is required'
    }

    if (!city.trim() || city.trim().length < 2) {
      errors.city = 'City is required'
    }

    if (!state.trim() || state.trim().length < 2) {
      errors.state = 'State is required'
    }

    if (!pincode.trim()) {
      errors.pincode = 'PIN code is required'
    } else if (!/^\d{6}$/.test(pincode.trim())) {
      errors.pincode = 'Enter a valid 6-digit PIN code'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle Order Placement & Razorpay Payment
  const handlePlaceOrderAndPay = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (view === 'processing') return

    if (!validateForm()) {
      return
    }

    setErrorMessage(null)
    setView('processing')
    setLoadingStep('Creating Order...')

    try {
      // 1. Create Order on Backend with exact normalized price
      const orderPayload = {
        productId: activeProduct?.id || 'saakantha-core',
        productName: activeProduct?.name || 'BoneTalk Core Wearable',
        price: unitPrice,
        amount: unitPrice,
        quantity,
        customer: {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
        },
      }

      const createResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      })

      const createData = await createResponse.json()

      if (!createResponse.ok || !createData.success) {
        throw new Error(
          createData.error || 'Failed to create order on server. Please try again.'
        )
      }

      // 2. Load Razorpay Checkout Script
      setLoadingStep('Opening Secure Checkout...')
      const scriptLoaded = await loadRazorpayScript()

      if (!scriptLoaded) {
        throw new Error(
          'Unable to load Razorpay payment portal. Please check your internet connection and try again.'
        )
      }

      // 3. Launch Razorpay Checkout Modal
      const checkoutOptions: RazorpayCheckoutOptions = {
        key: createData.key_id,
        amount: createData.amount,
        currency: createData.currency || 'INR',
        name: 'BoneTalk / SAAKANTHA',
        description: `${createData.product.name} (Qty: ${createData.product.quantity})`,
        image: '/favicon.svg',
        order_id: createData.razorpay_order_id,
        prefill: {
          name: createData.customer.name,
          email: createData.customer.email,
          contact: createData.customer.phone,
        },
        notes: {
          internal_order_id: createData.order_id,
          product_id: createData.product.id,
        },
        theme: {
          color: '#00D8A5',
          backdrop_color: 'rgba(6, 8, 11, 0.85)',
        },
        handler: async (response: RazorpaySuccessResponse) => {
          // 4. Server-Side Verification
          setLoadingStep('Verifying Payment...')
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                order_id: createData.order_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyResponse.json()

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(
                verifyData.error || 'Cryptographic payment verification failed on server.'
              )
            }

            // Payment verified successfully
            setVerifiedOrder(verifyData.order)
            setView('success')
          } catch (verifyErr: unknown) {
            console.error('[Payment Verification Failed]:', verifyErr)
            setErrorMessage(
              verifyErr instanceof Error
                ? verifyErr.message
                : 'Payment verification could not be completed.'
            )
            setView('failed')
          }
        },
        modal: {
          ondismiss: () => {
            console.log('[Razorpay Checkout Dismissed]')
            if (view !== 'success') {
              setErrorMessage('Payment process was dismissed before completion.')
              setView('failed')
            }
          },
        },
      }

      const rzp = new window.Razorpay(checkoutOptions)

      rzp.on('payment.failed', (failResponse: RazorpayFailureResponse) => {
        console.error('[Razorpay Payment Failed]:', failResponse.error)
        setErrorMessage(
          failResponse.error?.description ||
            failResponse.error?.reason ||
            'Payment could not be processed by your bank or payment method.'
        )
        setView('failed')
      })

      rzp.open()
    } catch (err: unknown) {
      console.error('[Order / Payment Error]:', err)
      setErrorMessage(
        err instanceof Error ? err.message : 'An error occurred while setting up your payment.'
      )
      setView('failed')
    }
  }

  if (!isModalOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={view === 'processing' ? undefined : closeOrderModal}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-0"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#0A0E17] border border-cyan-signal/30 rounded-sm shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(0,216,165,0.12)] text-cream font-sans my-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-modal-title"
        >
          {/* Tech Corner Accents */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-signal/60 pointer-events-none" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-signal/60 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-signal/60 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-signal/60 pointer-events-none" />

          {/* Modal Header */}
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border/80 bg-[#0A0E17]/95 px-6 py-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-cyan-signal animate-pulse" />
              <div>
                <h2 id="order-modal-title" className="font-mono text-xs uppercase tracking-widest text-cyan-signal font-bold">
                  {view === 'success'
                    ? 'ORDER CONFIRMED'
                    : view === 'failed'
                    ? 'PAYMENT STATUS'
                    : 'SECURE CHECKOUT // RAZORPAY'}
                </h2>
                <span className="text-[10px] font-mono text-cream-muted">
                  BoneTalk Assistive Neurotechnology Systems
                </span>
              </div>
            </div>

            {view !== 'processing' && (
              <button
                type="button"
                onClick={closeOrderModal}
                className="flex h-8 w-8 items-center justify-center rounded-sm border border-border text-cream-muted transition-colors hover:border-cyan-signal hover:text-cream cursor-pointer"
                aria-label="Close checkout"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* ── ERROR MESSAGE BANNER ── */}
            {errorMessage && view !== 'success' && (
              <div className="flex items-start gap-3 rounded-sm border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300 font-mono animate-in fade-in">
                <AlertTriangle size={18} className="flex-shrink-0 text-red-400 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold uppercase tracking-wider block mb-0.5">Transaction Notice</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* ────────────────────────────────────────────────────────── */}
            {/* VIEW 1 & VIEW 2: ORDER FORM & PROCESSING                   */}
            {/* ────────────────────────────────────────────────────────── */}
            {(view === 'form' || view === 'processing') && (
              <form onSubmit={handlePlaceOrderAndPay} noValidate className="space-y-6">
                {/* 1. ORDER SUMMARY SECTION */}
                <div className="rounded-sm border border-border/80 bg-graphite/60 p-4 sm:p-5">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/60">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-cyan-signal font-semibold flex items-center gap-2">
                      <ShoppingBag size={13} />
                      Order Summary
                    </span>
                    <span className="font-mono text-[10px] text-cream-muted uppercase">
                      {activeProduct?.edition || 'PREMIUM EDITION'}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {activeProduct?.image && (
                      <div className="w-24 sm:w-28 flex-shrink-0 overflow-hidden rounded-sm border border-border bg-graphite shadow-sm">
                        <ProductImage
                          src={activeProduct.image}
                          alt={activeProduct.name}
                          aspectRatio="16/10"
                          priority={true}
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-bold text-cream truncate">
                        {activeProduct?.name || 'BoneTalk Wearable'}
                      </h3>
                      <p className="text-xs text-cream-muted line-clamp-1 mt-0.5">
                        {activeProduct?.benefit || 'Surface EMG assistive communication device.'}
                      </p>
                      <div className="mt-2 text-cyan-signal font-mono text-sm font-semibold">
                        ₹{unitPrice.toLocaleString('en-IN')}
                        <span className="text-[10px] text-cream-muted font-normal ml-1.5">/ unit</span>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 border border-border rounded-sm bg-graphite-light/50 px-2 py-1 sm:self-center">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1 || view === 'processing'}
                        className="h-6 w-6 flex items-center justify-center text-cream-muted hover:text-cyan-signal disabled:opacity-30 cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-mono text-xs font-bold text-cream w-5 text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                        disabled={quantity >= 10 || view === 'processing'}
                        className="h-6 w-6 flex items-center justify-center text-cream-muted hover:text-cyan-signal disabled:opacity-30 cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="mt-4 pt-4 border-t border-border/60 space-y-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between text-cream-muted">
                      <span>Subtotal ({quantity} item{quantity > 1 ? 's' : ''})</span>
                      <span>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-cream-muted">
                      <span>Delivery Charge</span>
                      <span className="text-emerald-400 font-medium">FREE EXPRESS</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/80 text-sm sm:text-base font-bold text-cream">
                      <span>Total Amount</span>
                      <span className="text-cyan-signal font-display text-lg sm:text-xl">
                        ₹{totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. CUSTOMER & DELIVERY DETAILS SECTION */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/80 pb-2">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-cyan-signal font-semibold">
                      Customer Details & Delivery Address
                    </span>
                    <span className="text-[10px] font-mono text-cream-muted">* All fields required</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    {/* Full Name */}
                    <div>
                      <label htmlFor="customer-name" className="block font-mono text-[10px] uppercase tracking-wider text-cream-muted mb-1">
                        Customer Name *
                      </label>
                      <input
                        id="customer-name"
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={name}
                        disabled={view === 'processing'}
                        onChange={(e) => {
                          setName(e.target.value)
                          if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: '' }))
                        }}
                        className={`w-full rounded-sm border bg-graphite-elevated px-3 py-2 text-xs text-cream focus:border-cyan-signal focus:outline-none transition-colors ${
                          formErrors.name ? 'border-red-500/80 bg-red-500/[0.03]' : 'border-border'
                        }`}
                      />
                      {formErrors.name && (
                        <p className="mt-1 font-mono text-[10px] text-red-400">{formErrors.name}</p>
                      )}
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label htmlFor="customer-phone" className="block font-mono text-[10px] uppercase tracking-wider text-cream-muted mb-1">
                        Mobile Number (10 Digits) *
                      </label>
                      <input
                        id="customer-phone"
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={phone}
                        disabled={view === 'processing'}
                        onChange={(e) => {
                          setPhone(e.target.value)
                          if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: '' }))
                        }}
                        className={`w-full rounded-sm border bg-graphite-elevated px-3 py-2 text-xs text-cream focus:border-cyan-signal focus:outline-none transition-colors ${
                          formErrors.phone ? 'border-red-500/80 bg-red-500/[0.03]' : 'border-border'
                        }`}
                      />
                      {formErrors.phone && (
                        <p className="mt-1 font-mono text-[10px] text-red-400">{formErrors.phone}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="sm:col-span-2">
                      <label htmlFor="customer-email" className="block font-mono text-[10px] uppercase tracking-wider text-cream-muted mb-1">
                        Email Address (for order tracking & receipt) *
                      </label>
                      <input
                        id="customer-email"
                        type="email"
                        placeholder="e.g. rahul@example.com"
                        value={email}
                        disabled={view === 'processing'}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: '' }))
                        }}
                        className={`w-full rounded-sm border bg-graphite-elevated px-3 py-2 text-xs text-cream focus:border-cyan-signal focus:outline-none transition-colors ${
                          formErrors.email ? 'border-red-500/80 bg-red-500/[0.03]' : 'border-border'
                        }`}
                      />
                      {formErrors.email && (
                        <p className="mt-1 font-mono text-[10px] text-red-400">{formErrors.email}</p>
                      )}
                    </div>

                    {/* Delivery Address */}
                    <div className="sm:col-span-2">
                      <label htmlFor="customer-address" className="block font-mono text-[10px] uppercase tracking-wider text-cream-muted mb-1">
                        Delivery Address (Flat / House No., Street, Area) *
                      </label>
                      <input
                        id="customer-address"
                        type="text"
                        placeholder="e.g. Flat 402, Quantum Towers, BioTech Park"
                        value={address}
                        disabled={view === 'processing'}
                        onChange={(e) => {
                          setAddress(e.target.value)
                          if (formErrors.address) setFormErrors((prev) => ({ ...prev, address: '' }))
                        }}
                        className={`w-full rounded-sm border bg-graphite-elevated px-3 py-2 text-xs text-cream focus:border-cyan-signal focus:outline-none transition-colors ${
                          formErrors.address ? 'border-red-500/80 bg-red-500/[0.03]' : 'border-border'
                        }`}
                      />
                      {formErrors.address && (
                        <p className="mt-1 font-mono text-[10px] text-red-400">{formErrors.address}</p>
                      )}
                    </div>

                    {/* City */}
                    <div>
                      <label htmlFor="customer-city" className="block font-mono text-[10px] uppercase tracking-wider text-cream-muted mb-1">
                        City *
                      </label>
                      <input
                        id="customer-city"
                        type="text"
                        placeholder="e.g. Bengaluru"
                        value={city}
                        disabled={view === 'processing'}
                        onChange={(e) => {
                          setCity(e.target.value)
                          if (formErrors.city) setFormErrors((prev) => ({ ...prev, city: '' }))
                        }}
                        className={`w-full rounded-sm border bg-graphite-elevated px-3 py-2 text-xs text-cream focus:border-cyan-signal focus:outline-none transition-colors ${
                          formErrors.city ? 'border-red-500/80 bg-red-500/[0.03]' : 'border-border'
                        }`}
                      />
                      {formErrors.city && (
                        <p className="mt-1 font-mono text-[10px] text-red-400">{formErrors.city}</p>
                      )}
                    </div>

                    {/* State */}
                    <div>
                      <label htmlFor="customer-state" className="block font-mono text-[10px] uppercase tracking-wider text-cream-muted mb-1">
                        State *
                      </label>
                      <input
                        id="customer-state"
                        type="text"
                        list={stateDatalistId}
                        placeholder="Select or enter state"
                        value={state}
                        disabled={view === 'processing'}
                        onChange={(e) => {
                          setState(e.target.value)
                          if (formErrors.state) setFormErrors((prev) => ({ ...prev, state: '' }))
                        }}
                        className={`w-full rounded-sm border bg-graphite-elevated px-3 py-2 text-xs text-cream focus:border-cyan-signal focus:outline-none transition-colors ${
                          formErrors.state ? 'border-red-500/80 bg-red-500/[0.03]' : 'border-border'
                        }`}
                      />
                      <datalist id={stateDatalistId}>
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st} />
                        ))}
                      </datalist>
                      {formErrors.state && (
                        <p className="mt-1 font-mono text-[10px] text-red-400">{formErrors.state}</p>
                      )}
                    </div>

                    {/* PIN Code */}
                    <div className="sm:col-span-2">
                      <label htmlFor="customer-pincode" className="block font-mono text-[10px] uppercase tracking-wider text-cream-muted mb-1">
                        PIN Code (6 Digits) *
                      </label>
                      <input
                        id="customer-pincode"
                        type="text"
                        maxLength={6}
                        placeholder="e.g. 560100"
                        value={pincode}
                        disabled={view === 'processing'}
                        onChange={(e) => {
                          setPincode(e.target.value)
                          if (formErrors.pincode) setFormErrors((prev) => ({ ...prev, pincode: '' }))
                        }}
                        className={`w-full rounded-sm border bg-graphite-elevated px-3 py-2 text-xs text-cream focus:border-cyan-signal focus:outline-none transition-colors ${
                          formErrors.pincode ? 'border-red-500/80 bg-red-500/[0.03]' : 'border-border'
                        }`}
                      />
                      {formErrors.pincode && (
                        <p className="mt-1 font-mono text-[10px] text-red-400">{formErrors.pincode}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. PAYMENT METHOD SECTION */}
                <div className="rounded-sm border border-cyan-signal/30 bg-cyan-signal/[0.03] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-cyan-signal font-semibold flex items-center gap-2">
                      <CreditCard size={13} />
                      Payment Method
                    </span>
                    <span className="rounded-full bg-cyan-signal/15 border border-cyan-signal/30 px-2 py-0.5 font-mono text-[9px] text-cyan-signal uppercase font-bold">
                      TEST MODE
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-sm border border-cyan-signal/40 bg-[#06080B]/80 mt-2">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full border-2 border-cyan-signal flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-cyan-signal" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-cream block">Razorpay Gateway</span>
                        <span className="text-[10px] text-cream-muted block">
                          Pay securely with Razorpay
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-cream-muted/80">
                      <Lock size={12} className="text-cyan-signal" />
                      <span>256-Bit SSL</span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-cream-muted px-1">
                    <span>UPI • GooglePay • PhonePe • Cards • NetBanking</span>
                    <span className="text-emerald-400">Zero Convenience Fee</span>
                  </div>
                </div>

                {/* 4. PLACE ORDER & PAY BUTTON */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={view === 'processing'}
                    className="w-full relative overflow-hidden flex items-center justify-center gap-2.5 rounded-sm bg-cyan-signal hover:bg-emerald-400 text-graphite px-6 py-3.5 font-display font-bold text-sm tracking-wider uppercase transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(0,216,165,0.3)] cursor-pointer"
                  >
                    {view === 'processing' ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-graphite border-t-transparent animate-spin" />
                        <span>{loadingStep || 'Processing Order...'}</span>
                      </>
                    ) : (
                      <>
                        <span>Place Order & Pay — ₹{totalAmount.toLocaleString('en-IN')}</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <div className="mt-3 flex items-center justify-center gap-2 text-center text-[10px] font-mono text-cream-muted/70">
                    <ShieldCheck size={12} className="text-cyan-signal" />
                    <span>Server-verified transaction • 100% cryptographic payment security</span>
                  </div>
                </div>
              </form>
            )}

            {/* ────────────────────────────────────────────────────────── */}
            {/* VIEW 3: ORDER CONFIRMED (SUCCESS STATE)                   */}
            {/* ────────────────────────────────────────────────────────── */}
            {view === 'success' && verifiedOrder && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center py-2"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-pulse">
                  <CheckCircle2 size={36} />
                </div>

                <div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-cream">
                    Order Confirmed 🎉
                  </h3>
                  <p className="mt-1 text-xs text-cream-muted max-w-md mx-auto">
                    Your BoneTalk order has been successfully placed and verified on the server.
                    A confirmation email has been dispatched.
                  </p>
                </div>

                {/* Receipt Card */}
                <div className="rounded-sm border border-border/80 bg-graphite-elevated/70 p-5 text-left font-mono text-xs space-y-3 shadow-inner">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                    <span className="text-cream-muted uppercase text-[10px] tracking-wider">Payment Status</span>
                    <span className="rounded-full bg-emerald-500/15 border border-emerald-400/40 px-2.5 py-0.5 text-emerald-400 text-[10px] font-bold">
                      {verifiedOrder.payment_status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-cream-muted">Order ID:</span>
                    <span className="text-cyan-signal font-semibold select-all">{verifiedOrder.order_id}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-cream-muted">Razorpay Payment ID:</span>
                    <span className="text-cream select-all">{verifiedOrder.razorpay_payment_id}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-cream-muted">Product:</span>
                    <span className="text-cream font-medium">{verifiedOrder.product_name}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-cream-muted">Quantity:</span>
                    <span className="text-cream">{verifiedOrder.quantity} unit(s)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-cream-muted">Amount Paid:</span>
                    <span className="text-cyan-signal font-bold text-sm">
                      ₹{verifiedOrder.amount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-cream-muted">Customer:</span>
                    <span className="text-cream">{verifiedOrder.customer_name}</span>
                  </div>

                  <div className="border-t border-border/60 pt-2 text-[11px]">
                    <span className="text-cream-muted block mb-0.5">Shipping Destination:</span>
                    <span className="text-cream/90 leading-relaxed block">
                      {verifiedOrder.delivery_address.address}, {verifiedOrder.delivery_address.city},{' '}
                      {verifiedOrder.delivery_address.state} - {verifiedOrder.delivery_address.pincode}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={closeOrderModal}
                    className="w-full flex items-center justify-center gap-2 rounded-sm bg-cyan-signal hover:bg-emerald-400 text-graphite font-display font-bold py-3 px-6 text-sm uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <span>Continue Shopping</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ────────────────────────────────────────────────────────── */}
            {/* VIEW 4: PAYMENT FAILED / CANCELLED STATE                  */}
            {/* ────────────────────────────────────────────────────────── */}
            {view === 'failed' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center py-4"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 border border-red-500/40 text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.25)]">
                  <AlertTriangle size={28} />
                </div>

                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-cream">
                    Payment not completed
                  </h3>
                  <p className="mt-1.5 text-xs text-cream-muted max-w-md mx-auto">
                    {errorMessage ||
                      'The payment session was either interrupted, cancelled, or rejected by the payment gateway.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handlePlaceOrderAndPay()}
                    className="flex-1 flex items-center justify-center gap-2 rounded-sm bg-cyan-signal hover:bg-emerald-400 text-graphite font-display font-bold py-3 px-6 text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>Try Again</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('form')}
                    className="flex-1 flex items-center justify-center gap-2 rounded-sm border border-border hover:border-cyan-signal text-cream font-mono py-3 px-6 text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <span>Back to Order</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
