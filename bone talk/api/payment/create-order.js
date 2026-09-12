import { config, isRazorpayConfigured } from '../../server/config.js'
import { createRazorpayOrder } from '../../server/services/razorpayService.js'
import { orderStore, ORDER_STATUS } from '../../server/store/orderStore.js'
import { getProductById, BONETALK_PRICE_INR } from '../../server/data/products.js'
import { calculateBoneTalkPrice } from '../../server/data/pricing.js'

function isValidPhone(phone) {
  if (!phone) return false
  const clean = String(phone).replace(/[\s\-+]/g, '')
  return /^(\d{2})?[6-9]\d{9}$/.test(clean)
}

function isValidPincode(pin) {
  if (!pin) return false
  return /^\d{6}$/.test(String(pin).trim())
}

function isValidEmail(email) {
  if (!email) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { productId, productName, quantity = 1, customer = {} } = req.body || {}
    const { name, phone, email, address, city, state, pincode } = customer

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Please provide a valid customer full name.' })
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid 10-digit mobile number.' })
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' })
    }
    if (!address || address.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'Please provide a complete delivery street address.' })
    }
    if (!city || city.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Please specify your delivery city.' })
    }
    if (!state || state.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Please specify your delivery state.' })
    }
    if (!isValidPincode(pincode)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 6-digit PIN code.' })
    }

    const orderQty = Math.max(1, parseInt(quantity, 10) || 1)
    const catalogProduct = getProductById(productId)
    let unitPrice = BONETALK_PRICE_INR
    let finalProductName = productName || 'BoneTalk Device'
    let productImage = ''

    if (catalogProduct) {
      unitPrice = catalogProduct.price
      finalProductName = catalogProduct.name
      productImage = catalogProduct.image
    } else if (req.body.price && Number(req.body.price) > 0) {
      unitPrice = Number(req.body.price)
    } else if (req.body.amount && Number(req.body.amount) > 0) {
      unitPrice = Number(req.body.amount)
    }

    const isTestItem = productId === 'test-item-10'
    const priceObj = isTestItem 
      ? { numeric: unitPrice, display: `₹${unitPrice}`, paise: unitPrice * 100 }
      : calculateBoneTalkPrice(unitPrice)

    const finalUnitPrice = priceObj.numeric
    const finalTotalINR = finalUnitPrice * orderQty
    const amountPaise = isTestItem ? finalTotalINR * 100 : (priceObj.paise * orderQty)
    const internalOrderId = `BT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    if (!isRazorpayConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Payment Gateway is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env.',
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

    return res.status(200).json({
      success: true,
      order_id: createdOrder.order_id,
      razorpay_order_id: rzpOrder.id,
      amount: rzpOrder.amount,
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
    console.error('[Vercel Create Order Error]:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while creating payment order.',
    })
  }
}
