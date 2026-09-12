// Razorpay Checkout TypeScript interfaces and script loader helper

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export interface RazorpayFailureResponse {
  error: {
    code: string
    description: string
    source: string
    step: string
    reason: string
    metadata: {
      order_id?: string
      payment_id?: string
    }
  }
}

export interface RazorpayCheckoutOptions {
  key: string
  amount: number // in paise
  currency: string
  name: string
  description?: string
  image?: string
  order_id: string
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string | number>
  theme?: {
    color?: string
    backdrop_color?: string
  }
  modal?: {
    ondismiss?: () => void
    confirm_close?: boolean
    escape?: boolean
    animation?: boolean
  }
}

export interface RazorpayInstance {
  open(): void
  on(event: 'payment.failed', handler: (response: RazorpayFailureResponse) => void): void
  close(): void
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayCheckoutOptions) => RazorpayInstance
  }
}

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

let scriptLoadingPromise: Promise<boolean> | null = null

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)

  if (window.Razorpay) {
    return Promise.resolve(true)
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise
  }

  scriptLoadingPromise = new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`)
    if (existingScript) {
      let attempts = 0
      const checkInterval = setInterval(() => {
        attempts++
        if (window.Razorpay) {
          clearInterval(checkInterval)
          resolve(true)
        } else if (attempts > 30) {
          clearInterval(checkInterval)
          resolve(false)
        }
      }, 100)

      existingScript.addEventListener(
        'load',
        () => {
          clearInterval(checkInterval)
          resolve(true)
        },
        { once: true }
      )
      existingScript.addEventListener(
        'error',
        () => {
          clearInterval(checkInterval)
          resolve(false)
        },
        { once: true }
      )
      return
    }

    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT_SRC
    script.async = true
    script.onload = () => {
      resolve(true)
    }
    script.onerror = () => {
      console.error('Failed to load Razorpay Checkout SDK from CDN.')
      resolve(false)
    }
    document.body.appendChild(script)
  })

  return scriptLoadingPromise
}
