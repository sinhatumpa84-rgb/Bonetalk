import express from 'express'
import cors from 'cors'
import { config, isRazorpayConfigured } from './config.js'
import { paymentRouter } from './routes/paymentRoutes.js'

const app = express()

// CORS configuration for development and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin) || origin.includes('vercel.app') || origin.includes('bonetalk')) {
        return callback(null, true)
      }
      return callback(null, true) // Permissive for hackathon demo
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
)

app.use(express.json())

// Request logger
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`)
  }
  next()
})

// Routes
app.use('/api/payment', paymentRouter)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BoneTalk Payment Engine',
    razorpay_configured: isRazorpayConfigured(),
    timestamp: new Date().toISOString(),
  })
})

// Error handler middleware
app.use((err, req, res, _next) => {
  console.error('[Unhandled Server Error]:', err)
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  })
})

const server = app.listen(config.port, () => {
  const isTest = config.razorpay.keyId?.startsWith('rzp_test_')
  const modeBadge = isTest ? '🧪 TEST MODE' : '🚀 LIVE MODE'

  console.log('\n==================================================')
  console.log('⚡ BoneTalk / SAAKANTHA Payment Server')
  console.log('==================================================')
  console.log(`📡 Listening on: http://localhost:${config.port}`)
  console.log(`🔒 Razorpay Gateway: ${isRazorpayConfigured() ? `ONLINE [${modeBadge}]` : '⚠️ NOT CONFIGURED (Check .env)'}`)
  console.log(`🛡️  Key ID: ${config.razorpay.keyId ? config.razorpay.keyId : 'MISSING'}`)
  console.log(`🔑 Key Secret: ${config.razorpay.keySecret ? '●●●●●●●● (Loaded securely on server)' : 'MISSING'}`)
  console.log('==================================================\n')
})

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server terminated gracefully')
  })
})
