import { config, isRazorpayConfigured } from '../../server/config.js'

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  return res.status(200).json({
    success: true,
    is_configured: isRazorpayConfigured(),
    key_id: config.razorpay.keyId || null,
    mode: config.razorpay.keyId?.startsWith('rzp_test_') ? 'test' : 'production',
    currency: 'INR',
  })
}
