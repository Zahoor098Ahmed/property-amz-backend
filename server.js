import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from './config/database.js'
import propertiesRoutes from './routes/properties.js'
import contactRoutes from './routes/contact.js'
import adminRoutes from './routes/admin.js'
import postsRoutes from './routes/posts.js'
import settingsRoutes from './routes/settings.js'
import blogsRoutes from './routes/blogs.js'
import partnersRoutes from './routes/partners.js'

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config()

// Connect to MongoDB
connectDB().then(dbConnected => {
  console.log(dbConnected ? '✅ Using real database' : '⚠️ Using mock data - some features may be limited')
})

const app = express()
const PORT = process.env.PORT || 5002

// Middleware
app.use(helmet()) // Security headers

// CORS configuration with cache control headers
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Requested-With']
}))

// Add cache control headers to all responses
app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  })
  next()
})

app.use(morgan('combined')) // Logging
app.use(express.json({ limit: '10mb' })) // Parse JSON bodies
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded bodies

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/properties', propertiesRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/posts', postsRoutes) // This route handles all post-related endpoints
app.use('/api/settings', settingsRoutes)
app.use('/api/blogs', blogsRoutes)
app.use('/api/partners', partnersRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'AMZ Properties API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to AMZ Properties API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      properties: '/api/properties',
      contact: '/api/contact'
    }
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: [
      '/api/health',
      '/api/properties',
      '/api/contact'
    ]
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack)
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AMZ Properties API Server running on port ${PORT}`)
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`)
  console.log(`📋 API Documentation: http://localhost:${PORT}/`)
})

export default app