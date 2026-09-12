import Razorpay from 'razorpay'
import crypto from 'crypto'
import { config, isRazorpayConfigured } from '../config.js'

let razorpayInstance = null

export function getRazorpayClient() {
  if (!isRazorpayConfigured()) {
    return null
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    })
  }

  return razorpayInstance
}

/**
 * Creates a Razorpay Order
 * @param {Object} params
 * @param {number} params.amountPaise - Order amount in paise (1 INR = 100 paise)
 * @param {string} [params.currency='INR'] - Currency code
 * @param {string} params.receipt - Internal order identifier
 * @param {Object} [params.notes={}] - Optional metadata notes
 * @returns {Promise<Object>} Razorpay Order Object
 */
export async function createRazorpayOrder({ amountPaise, currency = 'INR', receipt, notes = {} }) {
  const rzp = getRazorpayClient()

  if (!rzp) {
    throw new Error(
      'Razorpay credentials are not configured on the backend. Please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.'
    )
  }

  if (!amountPaise || amountPaise <= 0) {
    throw new Error('Invalid order amount provided. Amount must be greater than zero.')
  }

  const options = {
    amount: Math.round(amountPaise), // Razorpay expects integer paise
    currency: currency || 'INR',
    receipt: String(receipt).slice(0, 40), // Razorpay limits receipt to 40 chars
    notes: {
      platform: 'BoneTalk / SAAKANTHA Web',
      environment: config.razorpay.keyId.startsWith('rzp_test_') ? 'test' : 'production',
      ...notes,
    },
  }

  const order = await rzp.orders.create(options)
  return order
}

/**
 * Verifies Razorpay payment signature using official HMAC SHA-256
 * @param {Object} params
 * @param {string} params.razorpay_order_id
 * @param {string} params.razorpay_payment_id
 * @param {string} params.razorpay_signature
 * @returns {boolean} True if signature is cryptographically authentic
 */
export function verifyRazorpaySignature({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) {
  if (!config.razorpay.keySecret) {
    throw new Error('Razorpay Key Secret is missing. Cannot verify payment signature.')
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return false
  }

  const payload = `${razorpay_order_id}|${razorpay_payment_id}`
  const expectedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(payload)
    .digest('hex')

  // Constant-time comparison to prevent timing attacks
  try {
    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8')
    const actualBuffer = Buffer.from(razorpay_signature, 'utf-8')

    if (expectedBuffer.length !== actualBuffer.length) {
      return false
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer)
  } catch {
    return expectedSignature === razorpay_signature
  }
}
