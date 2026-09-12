import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.resolve(__dirname, '../data')
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json')

export const ORDER_STATUS = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAID: 'PAID',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  CANCELLED: 'CANCELLED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
}

class OrderStore {
  constructor() {
    this.orders = new Map()
    this.razorpayIndex = new Map()
    this.initStorage()
  }

  initStorage() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true })
      }

      if (fs.existsSync(ORDERS_FILE)) {
        const data = fs.readFileSync(ORDERS_FILE, 'utf-8')
        if (data.trim()) {
          const parsed = JSON.parse(data)
          for (const order of parsed) {
            this.orders.set(order.order_id, order)
            if (order.razorpay_order_id) {
              this.razorpayIndex.set(order.razorpay_order_id, order.order_id)
            }
          }
        }
      } else {
        fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8')
      }
    } catch (err) {
      console.warn('[OrderStore] Notice: Could not read local orders file, using in-memory store:', err.message)
    }
  }

  persist() {
    try {
      const allOrders = Array.from(this.orders.values())
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(allOrders, null, 2), 'utf-8')
    } catch (err) {
      console.error('[OrderStore] Error saving orders to disk:', err.message)
    }
  }

  /**
   * Create and record a new order
   */
  createOrder({
    order_id,
    razorpay_order_id,
    razorpay_payment_id = null,
    razorpay_signature = null,
    product_id,
    product_name,
    product_image = '',
    quantity = 1,
    amount, // In INR
    currency = 'INR',
    customer_name,
    customer_email,
    customer_phone,
    delivery_address,
    payment_status = ORDER_STATUS.PENDING_PAYMENT,
    order_status = ORDER_STATUS.PENDING_PAYMENT,
  }) {
    const now = new Date().toISOString()

    const newOrder = {
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      product_id,
      product_name,
      product_image,
      quantity,
      amount,
      currency,
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      payment_status,
      order_status,
      created_at: now,
      updated_at: now,
    }

    this.orders.set(order_id, newOrder)
    if (razorpay_order_id) {
      this.razorpayIndex.set(razorpay_order_id, order_id)
    }

    this.persist()
    return structuredClone(newOrder)
  }

  getOrderById(orderId) {
    const order = this.orders.get(orderId)
    return order ? structuredClone(order) : null
  }

  getOrderByRazorpayOrderId(razorpayOrderId) {
    const internalId = this.razorpayIndex.get(razorpayOrderId)
    if (!internalId) return null
    return this.getOrderById(internalId)
  }

  updateOrder(orderId, updates) {
    const existing = this.orders.get(orderId)
    if (!existing) return null

    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    }

    this.orders.set(orderId, updated)
    if (updated.razorpay_order_id) {
      this.razorpayIndex.set(updated.razorpay_order_id, orderId)
    }

    this.persist()
    return structuredClone(updated)
  }

  listRecentOrders(limit = 50) {
    return Array.from(this.orders.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  }
}

export const orderStore = new OrderStore()
