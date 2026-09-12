import { verifyRazorpaySignature } from '../../server/services/razorpayService.js'
import { orderStore, ORDER_STATUS } from '../../server/store/orderStore.js'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {}

    if (!order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment verification parameters.',
      })
    }

    const existingOrder = orderStore.getOrderById(order_id)
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        error: 'Order not found in records.',
      })
    }

    const isValid = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    })

    if (!isValid) {
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

    const verifiedOrder = orderStore.updateOrder(order_id, {
      razorpay_payment_id,
      razorpay_signature,
      payment_status: ORDER_STATUS.PAID,
      order_status: ORDER_STATUS.PAID,
    })

    return res.status(200).json({
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
    console.error('[Vercel Verify Payment Error]:', error)
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred during payment verification.',
    })
  }
}
