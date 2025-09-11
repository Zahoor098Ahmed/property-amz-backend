import express from 'express'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import Admin from '../models/Admin.js'
import Post from '../models/Post.js'
import { authenticateToken, requireAdmin, generateToken } from '../middleware/auth.js'

const router = express.Router()

// Admin login
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body)
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Fallback authentication when database is not connected
    if (mongoose.connection.readyState !== 1) {
      // Mock admin credentials for development
      if (email.toLowerCase() === 'admin@amzproperties.com' && password === 'admin123') {
        const token = generateToken('mock-admin-id')
        return res.json({
          message: 'Login successful',
          token,
          admin: {
            id: 'mock-admin-id',
            email: email.toLowerCase(),
            name: 'Admin User',
            role: 'admin'
          }
        })
      } else {
        return res.status(401).json({ message: 'Invalid credentials' })
      }
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() })
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isValidPassword = await admin.comparePassword(password)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    if (!admin.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' })
    }

    // Update last login
    admin.lastLogin = new Date()
    await admin.save()

    const token = generateToken(admin._id)

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get admin profile
router.get('/profile', authenticateToken, requireAdmin, async (req, res) => {
  try {
    res.json({
      admin: {
        id: req.admin._id,
        email: req.admin.email,
        name: req.admin.name,
        role: req.admin.role,
        lastLogin: req.admin.lastLogin
      }
    })
  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Change password
router.put('/change-password', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' })
    }

    const admin = await Admin.findById(req.admin._id)
    const isValidPassword = await admin.comparePassword(currentPassword)

    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    admin.password = newPassword
    await admin.save()

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get dashboard stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments()
    const publishedPosts = await Post.countDocuments({ status: 'published' })
    const draftPosts = await Post.countDocuments({ status: 'draft' })
    const featuredPosts = await Post.countDocuments({ featured: true })

    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdAt views')
      .populate('author', 'name')

    const totalViews = await Post.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ])

    res.json({
      stats: {
        totalPosts,
        publishedPosts,
        draftPosts,
        featuredPosts,
        totalViews: totalViews[0]?.total || 0
      },
      recentPosts
    })
  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router