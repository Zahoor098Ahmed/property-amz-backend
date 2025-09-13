import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'Access token required' })
    }

    // Handle mock token for development
    if (token.startsWith('mock-admin-token-')) {
      req.admin = {
        _id: 'mock-admin-id',
        email: 'admin@amzproperties.com',
        name: 'Admin User',
        role: 'admin',
        isActive: true
      }
      return next()
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Handle mock admin for development
    if (decoded === 'mock-admin-id' || decoded.id === 'mock-admin-id') {
      req.admin = {
        _id: 'mock-admin-id',
        email: 'admin@amzproperties.com',
        name: 'Admin User',
        role: 'admin',
        isActive: true
      }
      return next()
    }
    
    const admin = await Admin.findById(decoded.id).select('-password')

    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Invalid or inactive admin' })
    }

    req.admin = admin
    next()
  } catch (error) {
    console.error('Auth error:', error)
    return res.status(403).json({ message: 'Invalid token' })
  }
}

export const requireAdmin = (req, res, next) => {
  if (req.admin && req.admin.role === 'admin') {
    next()
  } else {
    res.status(403).json({ message: 'Admin access required' })
  }
}

export const generateToken = (adminId) => {
  return jwt.sign(
    { id: adminId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

export default authenticateToken
export { authenticateToken }