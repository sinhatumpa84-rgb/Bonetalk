import express from 'express'
import { config, isRazorpayConfigured } from '../config.js'
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpayService.js'
import { orderStore, ORDER_STATUS } from '../store/orderStore.js'
import { getProductById, BONETALK_PRICE_INR } from '../data/products.js'

export const paymentRouter = express.Router()

// Helper to validate Indian phone numbers
function isValidPhone(phone) {
  if (!phone) return false
  const clean = String(phone).replace(/[\s\-+]/g, '')
  // Support 10-digit or 91-prefixed 10-digit
  return /^(\d{2})?[6-9]\d{9}$/.test(clean)
}

// Helper to validate Indian PIN codes
function isValidPincode(pin) {
  if (!pin) return false
  return /^\d{6}$/.test(String(pin).trim())
}

// Helper to validate Email
function isValidEmail(email) {
  if (!email) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())
}

/**
 * GET /api/payment/config
 * Returns public configuration for client initialization
 */
paymentRouter.get('/config', (req, res) => {
  res.json({
    success: true,
    is_configured: isRazorpayConfigured(),
    key_id: config.razorpay.keyId || null,
    mode: config.razorpay.keyId?.startsWith('rzp_test_') ? 'test' : 'production',
    currency: 'INR',
  })
})

/**
 * POST /api/payment/create-order
 * Creates a verified Razorpay order and records it in pending state
 */
paymentRouter.post('/create-order', async (req, res) => {
  try {
    const {
      productId,
      productName,
      quantity = 1,
      customer = {},
    } = req.body

    // 1. Validate customer details
    const { name, phone, email, address, city, state, pincode } = customer

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid customer full name.',
      })
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid 10-digit mobile number.',
      })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.',
      })
    }

    if (!address || address.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a complete delivery street address.',
      })
    }

    if (!city || city.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please specify your delivery city.',
      })
    }

    if (!state || state.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please specify your delivery state.',
      })
    }

    if (!isValidPincode(pincode)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 6-digit PIN code.',
      })
    }

    const orderQty = Math.max(1, parseInt(quantity, 10) || 1)

    // 2. Validate product and calculate server-side price (anti-tamper)
    const catalogProduct = getProductById(productId)
    let unitPrice = 0
    let finalProductName = productName || 'BoneTalk Device'
    let productImage = ''

    if (catalogProduct) {
      unitPrice = catalogProduct.price
      finalProductName = catalogProduct.name
      productImage = catalogProduct.image
    } else if (req.body.amount && Number(req.body.amount) > 0) {
      unitPrice = Math.max(1, Math.round(Number(req.body.amount)))
    } else {
      // Fallback if custom product or dynamic ID
      unitPrice = BONETALK_PRICE_INR
    }

    const subtotal = unitPrice * orderQty
    const deliveryCharge = 0 // Free Express Delivery promotion
    const discount = 0
    const finalTotalINR = subtotal + deliveryCharge - discount
    const amountPaise = finalTotalINR * 100

    // 3. Generate internal order ID
    const internalOrderId = `BT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    // 4. Create Razorpay order via official SDK
    if (!isRazorpayConfigured()) {
      return res.status(503).json({
        success: false,
        error:
          'Payment Gateway is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env.',
      })
    }

    const rzpOrder = await createRazorpayOrder({
      amountPaise,
      currency: 'INR',
      receipt: internalOrderId,
      notes: {
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        product_id: productId || 'saakantha-core',
        product_name: finalProductName,
        quantity: orderQty,
      },
    })

    // 5. Store order in persistent orderStore
    const createdOrder = orderStore.createOrder({
      order_id: internalOrderId,
      razorpay_order_id: rzpOrder.id,
      product_id: productId || 'saakantha-core',
      product_name: finalProductName,
      product_image: productImage,
      quantity: orderQty,
      amount: finalTotalINR,
      currency: 'INR',
      customer_name: name.trim(),
      customer_email: email.trim().toLowerCase(),
      customer_phone: phone.trim(),
      delivery_address: {
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      },
      payment_status: ORDER_STATUS.PENDING_PAYMENT,
      order_status: ORDER_STATUS.PENDING_PAYMENT,
    })

    // 6. Return Razorpay checkout payload to frontend
    res.status(200).json({
      success: true,
      order_id: createdOrder.order_id,
      razorpay_order_id: rzpOrder.id,
      amount: rzpOrder.amount, // In paise
      currency: rzpOrder.currency,
      key_id: config.razorpay.keyId,
      product: {
        id: createdOrder.product_id,
        name: createdOrder.product_name,
        quantity: createdOrder.quantity,
        amount: createdOrder.amount,
        image: createdOrder.product_image,
      },
      customer: {
        name: createdOrder.customer_name,
        email: createdOrder.customer_email,
        phone: createdOrder.customer_phone,
      },
    })
  } catch (error) {
    console.error('[Create Order Error]:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while creating the payment order.',
    })
  }
})

/**
 * POST /api/payment/verify
 * Cryptographically verifies the Razorpay signature and updates the order status
 */
paymentRouter.post('/verify', async (req, res) => {
  try {
    const {
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body

    if (!order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment verification parameters.',
      })
    }

    // Retrieve order
    const existingOrder = orderStore.getOrderById(order_id)
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        error: 'Order not found in records.',
      })
    }

    // Cryptographic signature verification
    const isValid = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    })

    if (!isValid) {
      // Mark as payment failed
      orderStore.updateOrder(order_id, {
        razorpay_payment_id,
        razorpay_signature,
        payment_status: ORDER_STATUS.PAYMENT_FAILED,
        order_status: ORDER_STATUS.PAYMENT_FAILED,
      })

      return res.status(400).json({
        success: false,
        error: 'Payment verification failed: cryptographic signature mismatch.',
      })
    }

    // Mark as PAID
    const verifiedOrder = orderStore.updateOrder(order_id, {
      razorpay_payment_id,
      razorpay_signature,
      payment_status: ORDER_STATUS.PAID,
      order_status: ORDER_STATUS.PAID,
    })

    res.status(200).json({
      success: true,
      message: 'Payment verified and confirmed successfully.',
      order: {
        order_id: verifiedOrder.order_id,
        razorpay_order_id: verifiedOrder.razorpay_order_id,
        razorpay_payment_id: verifiedOrder.razorpay_payment_id,
        product_name: verifiedOrder.product_name,
        product_image: verifiedOrder.product_image,
        quantity: verifiedOrder.quantity,
        amount: verifiedOrder.amount,
        currency: verifiedOrder.currency,
        customer_name: verifiedOrder.customer_name,
        customer_email: verifiedOrder.customer_email,
        customer_phone: verifiedOrder.customer_phone,
        delivery_address: verifiedOrder.delivery_address,
        payment_status: verifiedOrder.payment_status,
        order_status: verifiedOrder.order_status,
        created_at: verifiedOrder.created_at,
      },
    })
  } catch (error) {
    console.error('[Verify Payment Error]:', error)
    res.status(500).json({
      success: false,
      error: 'An internal error occurred during payment verification.',
    })
  }
})

/**
 * GET /api/payment/order/:id
 * Retrieve details of a confirmed or pending order
 */
paymentRouter.get('/order/:id', (req, res) => {
  try {
    const { id } = req.params
    const order = orderStore.getOrderById(id)

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found.',
      })
    }

    // Sanitize response: do not expose razorpay_signature
    const { razorpay_signature: _razorpay_signature, ...sanitized } = order

    res.json({
      success: true,
      order: sanitized,
    })
  } catch (error) {
    console.error('[Get Order Error]:', error)
    res.status(500).json({
      success: false,
      error: 'Could not fetch order details.',
    })
  }
})
