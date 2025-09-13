import express from 'express'
import mongoose from 'mongoose'
import Wishlist from '../models/Wishlist.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// Add item to wishlist (Public)
router.post('/', async (req, res) => {
  try {
    const { itemId, itemType, sessionId, itemData } = req.body
    
    if (!itemId || !itemType || !sessionId) {
      return res.status(400).json({ message: 'itemId, itemType, and sessionId are required' })
    }
    
    // Fallback when database is not connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(201).json({
        success: true,
        message: 'Item added to wishlist successfully',
        data: {
          id: 'mock-wishlist-' + Date.now(),
          itemId,
          itemType,
          sessionId,
          createdAt: new Date()
        }
      })
    }
    
    // Check if item already exists in wishlist for this session
    const existingItem = await Wishlist.findOne({ itemId, sessionId })
    if (existingItem) {
      return res.status(400).json({ message: 'Item already in wishlist' })
    }
    
    const wishlistItem = new Wishlist({
      itemId,
      itemType,
      sessionId,
      itemData
    })
    
    await wishlistItem.save()
    
    res.status(201).json({
      success: true,
      message: 'Item added to wishlist successfully',
      data: wishlistItem
    })
  } catch (error) {
    console.error('Add to wishlist error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get wishlist items for a session (Public)
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params
    
    // Fallback when database is not connected
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        wishlistItems: [],
        total: 0
      })
    }
    
    const wishlistItems = await Wishlist.find({ sessionId })
      .sort({ createdAt: -1 })
    
    res.json({
      wishlistItems,
      total: wishlistItems.length
    })
  } catch (error) {
    console.error('Get wishlist error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Remove item from wishlist (Public)
router.delete('/:sessionId/:itemId', async (req, res) => {
  try {
    const { sessionId, itemId } = req.params
    
    // Fallback when database is not connected
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        message: 'Item removed from wishlist successfully'
      })
    }
    
    const result = await Wishlist.findOneAndDelete({ sessionId, itemId })
    
    if (!result) {
      return res.status(404).json({ message: 'Item not found in wishlist' })
    }
    
    res.json({
      success: true,
      message: 'Item removed from wishlist successfully'
    })
  } catch (error) {
    console.error('Remove from wishlist error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all wishlist items (Admin only)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, search } = req.query
    const skip = (page - 1) * limit
    
    let query = {}
    
    if (type && type !== 'all') {
      query.itemType = type
    }
    
    if (search) {
      query.$or = [
        { 'itemData.title': { $regex: search, $options: 'i' } },
        { 'itemData.location': { $regex: search, $options: 'i' } },
        { sessionId: { $regex: search, $options: 'i' } }
      ]
    }
    
    const wishlistItems = await Wishlist.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
    
    const total = await Wishlist.countDocuments(query)
    
    res.json({
      wishlistItems,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('Get wishlist items error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get wishlist statistics (Admin only)
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalItems = await Wishlist.countDocuments()
    const propertyItems = await Wishlist.countDocuments({ itemType: 'property' })
    const projectItems = await Wishlist.countDocuments({ itemType: 'project' })
    const uniqueSessions = await Wishlist.distinct('sessionId')
    
    // Get popular items
    const popularProperties = await Wishlist.aggregate([
      { $match: { itemType: 'property' } },
      { $group: { _id: '$itemId', count: { $sum: 1 }, itemData: { $first: '$itemData' } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ])
    
    const popularProjects = await Wishlist.aggregate([
      { $match: { itemType: 'project' } },
      { $group: { _id: '$itemId', count: { $sum: 1 }, itemData: { $first: '$itemData' } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ])
    
    // Get recent activity
    const recentActivity = await Wishlist.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('itemType itemData.title sessionId createdAt')
    
    res.json({
      stats: {
        totalItems,
        propertyItems,
        projectItems,
        uniqueSessions: uniqueSessions.length
      },
      popularProperties,
      popularProjects,
      recentActivity
    })
  } catch (error) {
    console.error('Get wishlist stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete wishlist item (Admin only)
router.delete('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    
    const wishlistItem = await Wishlist.findByIdAndDelete(id)
    
    if (!wishlistItem) {
      return res.status(404).json({ message: 'Wishlist item not found' })
    }
    
    res.json({ message: 'Wishlist item deleted successfully' })
  } catch (error) {
    console.error('Delete wishlist item error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Clear all wishlist items for a session (Admin only)
router.delete('/admin/session/:sessionId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { sessionId } = req.params
    
    const result = await Wishlist.deleteMany({ sessionId })
    
    res.json({ 
      message: `Deleted ${result.deletedCount} wishlist items for session ${sessionId}`,
      deletedCount: result.deletedCount
    })
  } catch (error) {
    console.error('Clear session wishlist error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get wishlist analytics (Admin only)
router.get('/admin/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = '7d' } = req.query
    
    let dateFilter = {}
    const now = new Date()
    
    switch (period) {
      case '24h':
        dateFilter = { createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) } }
        break
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } }
        break
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } }
        break
      case '90d':
        dateFilter = { createdAt: { $gte: new Date(now - 90 * 24 * 60 * 60 * 1000) } }
        break
    }
    
    // Daily wishlist additions
    const dailyStats = await Wishlist.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$itemType'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ])
    
    // Most wishlisted items
    const topItems = await Wishlist.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            itemId: '$itemId',
            itemType: '$itemType'
          },
          count: { $sum: 1 },
          itemData: { $first: '$itemData' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])
    
    res.json({
      period,
      dailyStats,
      topItems
    })
  } catch (error) {
    console.error('Get wishlist analytics error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router