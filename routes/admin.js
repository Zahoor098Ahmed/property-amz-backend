import express from 'express'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
const { ObjectId } = mongoose.Types
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import Admin from '../models/Admin.js'
import Wishlist from '../models/Wishlist.js'
import Property from '../models/Property.js'
import Contact from '../models/Contact.js'
import Partner from '../models/Partner.js'
import Testimonial from '../models/Testimonial.js'
import Blog from '../models/Blog.js'
import { authenticateToken, requireAdmin, generateToken } from '../middleware/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

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

// Get comprehensive dashboard stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Properties stats
    const totalProperties = await Property.countDocuments()
    const availableProperties = await Property.countDocuments({ status: 'available' })
    const soldProperties = await Property.countDocuments({ status: 'sold' })
    const reservedProperties = await Property.countDocuments({ status: 'reserved' })
    const exclusiveProperties = await Property.countDocuments({ type: 'exclusive' })
    const offPlanProperties = await Property.countDocuments({ type: 'off-plan' })

    // Projects stats
    const totalProjects = await Project.countDocuments()
    const readyProjects = await Project.countDocuments({ status: 'Ready' })
    const inConstructionProjects = await Project.countDocuments({ status: 'In Construction' })
    const planningProjects = await Project.countDocuments({ status: 'Planning' })
    const completedProjects = await Project.countDocuments({ status: 'Completed' })

    // Developers stats
    const totalDevelopers = await Developer.countDocuments()
    const activeDevelopers = await Developer.countDocuments({ isActive: true })
    const featuredDevelopers = await Developer.countDocuments({ featured: true })

    // Blogs stats
    const totalBlogs = await Blog.countDocuments()
    const publishedBlogs = await Blog.countDocuments({ status: 'published' })
    const draftBlogs = await Blog.countDocuments({ status: 'draft' })
    const featuredBlogs = await Blog.countDocuments({ featured: true })

    // Testimonials stats
    const totalTestimonials = await Testimonial.countDocuments()
    const activeTestimonials = await Testimonial.countDocuments({ isActive: true })

    // Contact submissions stats
    const totalContacts = await Contact.countDocuments()
    const newContacts = await Contact.countDocuments({ status: 'new' })
    const contactedSubmissions = await Contact.countDocuments({ status: 'contacted' })
    const resolvedContacts = await Contact.countDocuments({ status: 'resolved' })

    // Posts stats (legacy)
    const totalPosts = await Post.countDocuments()
    const publishedPosts = await Post.countDocuments({ status: 'published' })
    const draftPosts = await Post.countDocuments({ status: 'draft' })
    const featuredPosts = await Post.countDocuments({ featured: true })

    // Wishlist stats
    const totalWishlistItems = await Wishlist.countDocuments()
    const wishlistProperties = await Wishlist.countDocuments({ itemType: 'property' })
    const wishlistProjects = await Wishlist.countDocuments({ itemType: 'project' })
    const uniqueWishlistSessions = await Wishlist.distinct('sessionId')

    // Recent activity
    const recentProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title price location status createdAt')

    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title developer status createdAt')

    const recentBlogs = await Blog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdAt views')

    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email subject status createdAt')

    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdAt views')
      .populate('author', 'name')

    const recentWishlistActivity = await Wishlist.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('itemType itemData.title sessionId createdAt')

    // Calculate total views
    const totalViews = await Post.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ])

    const blogViews = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ])

    res.json({
      stats: {
        // Properties
        totalProperties,
        availableProperties,
        soldProperties,
        reservedProperties,
        exclusiveProperties,
        offPlanProperties,
        
        // Projects
        totalProjects,
        readyProjects,
        inConstructionProjects,
        planningProjects,
        completedProjects,
        
        // Developers
        totalDevelopers,
        activeDevelopers,
        featuredDevelopers,
        
        // Blogs
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        featuredBlogs,
        blogViews: blogViews[0]?.total || 0,
        
        // Testimonials
        totalTestimonials,
        activeTestimonials,
        
        // Contact submissions
        totalContacts,
        newContacts,
        contactedSubmissions,
        resolvedContacts,
        
        // Legacy posts
        totalPosts,
        publishedPosts,
        draftPosts,
        featuredPosts,
        totalViews: totalViews[0]?.total || 0,
        
        // Wishlist
        totalWishlistItems,
        wishlistProperties,
        wishlistProjects,
        uniqueWishlistSessions: uniqueWishlistSessions.length
      },
      recentActivity: {
        properties: recentProperties,
        projects: recentProjects,
        blogs: recentBlogs,
        contacts: recentContacts,
        posts: recentPosts,
        wishlist: recentWishlistActivity
      }
    })
  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Admin CRUD operations for Properties
router.get('/properties', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, type } = req.query
    
    // Fallback when database is not connected
    if (mongoose.connection.readyState !== 1) {
      const mockProperties = [
        {
          _id: 'mock-prop-1',
          title: 'Luxury Villa in Dubai Marina',
          price: 2500000,
          location: 'Dubai Marina',
          status: 'available',
          type: 'villa',
          bedrooms: 4,
          bathrooms: 5,
          area: 3500,
          developer: 'Emaar Properties',
          createdAt: new Date()
        },
        {
          _id: 'mock-prop-2',
          title: 'Modern Apartment in Downtown',
          price: 1800000,
          location: 'Downtown Dubai',
          status: 'available',
          type: 'apartment',
          bedrooms: 2,
          bathrooms: 3,
          area: 1200,
          developer: 'DAMAC Properties',
          createdAt: new Date()
        }
      ]
      
      return res.json({
        properties: mockProperties,
        pagination: {
          current: parseInt(page),
          pages: 1,
          total: mockProperties.length,
          limit: parseInt(limit)
        }
      })
    }
    
    let query = {}

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
        { developer: new RegExp(search, 'i') }
      ]
    }

    if (status) query.status = status
    if (type) query.type = type

    const properties = await Property.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))

    const total = await Property.countDocuments(query)

    res.json({
      properties,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Admin get properties error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Admin CRUD operations for Projects
router.get('/projects', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, developer } = req.query
    let query = {}

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
        { developer: new RegExp(search, 'i') }
      ]
    }

    if (status) query.status = status
    if (developer) query.developer = new RegExp(developer, 'i')

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))

    const total = await Project.countDocuments(query)

    res.json({
      projects,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Admin get projects error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Admin CRUD operations for Developers
router.get('/developers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query
    let query = {}

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { specialties: new RegExp(search, 'i') }
      ]
    }

    if (isActive !== undefined) query.isActive = isActive === 'true'

    const developers = await Developer.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('projects', 'title status')

    const total = await Developer.countDocuments(query)

    res.json({
      developers,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Admin get developers error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Admin CRUD operations for Blogs
router.get('/blogs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, category } = req.query
    let query = {}

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { excerpt: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') }
      ]
    }

    if (status) query.status = status
    if (category) query.category = category

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))

    const total = await Blog.countDocuments(query)

    res.json({
      blogs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Admin get blogs error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Admin CRUD operations for Testimonials
router.get('/testimonials', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query
    let query = {}

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { role: new RegExp(search, 'i') },
        { text: new RegExp(search, 'i') }
      ]
    }

    if (isActive !== undefined) query.isActive = isActive === 'true'

    const testimonials = await Testimonial.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))

    const total = await Testimonial.countDocuments(query)

    res.json({
      testimonials,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Admin get testimonials error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Admin CRUD operations for Contact submissions
router.get('/contacts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, inquiryType } = req.query
    
    // Fallback when database is not connected
    if (mongoose.connection.readyState !== 1) {
      const mockContacts = [
        {
          _id: 'mock-contact-1',
          name: 'Test User',
          email: 'test@example.com',
          phone: '+971501234567',
          subject: 'Property Inquiry',
          message: 'I am interested in your properties',
          status: 'new',
          inquiryType: 'general',
          createdAt: new Date()
        }
      ]
      
      return res.json({
        contacts: mockContacts,
        pagination: {
          current: parseInt(page),
          pages: 1,
          total: mockContacts.length,
          limit: parseInt(limit)
        }
      })
    }
    
    let query = {}

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { subject: new RegExp(search, 'i') },
        { message: new RegExp(search, 'i') }
      ]
    }

    if (status) query.status = status
    if (inquiryType) query.inquiryType = inquiryType

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('propertyId', 'title location')

    const total = await Contact.countDocuments(query)

    res.json({
      contacts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Admin get contacts error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update contact status
router.put('/contacts/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body
    
    if (!['new', 'contacted', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('propertyId', 'title location')

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' })
    }

    res.json({
      message: 'Contact status updated successfully',
      contact
    })
  } catch (error) {
    console.error('Update contact status error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete contact submission
router.delete('/contacts/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id)
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' })
    }

    res.json({ message: 'Contact deleted successfully' })
  } catch (error) {
    console.error('Delete contact error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Admin CRUD operations for Wishlist
router.get('/wishlist/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type } = req.query
    
    // Fallback when database is not connected
    if (mongoose.connection.readyState !== 1) {
      const mockWishlist = [
        {
          _id: 'mock-wishlist-1',
          itemId: 'prop-123',
          itemType: 'property',
          sessionId: 'session-123',
          userAgent: 'Mozilla/5.0',
          ipAddress: '192.168.1.1',
          createdAt: new Date()
        },
        {
          _id: 'mock-wishlist-2',
          itemId: 'proj-456',
          itemType: 'project',
          sessionId: 'session-456',
          userAgent: 'Mozilla/5.0',
          ipAddress: '192.168.1.2',
          createdAt: new Date()
        }
      ]
      
      return res.json({
        wishlist: mockWishlist,
        pagination: {
          current: parseInt(page),
          pages: 1,
          total: mockWishlist.length,
          limit: parseInt(limit)
        }
      })
    }
    
    let query = {}
    if (type) query.itemType = type
    if (search) {
      query.$or = [
        { itemId: new RegExp(search, 'i') },
        { sessionId: new RegExp(search, 'i') }
      ]
    }

    const wishlist = await Wishlist.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))

    const total = await Wishlist.countDocuments(query)

    res.json({
      wishlist,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Admin get wishlist error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get wishlist statistics
router.get('/wishlist/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Fallback when database is not connected
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        totalItems: 2,
        propertyItems: 1,
        projectItems: 1,
        uniqueSessions: 2,
        recentActivity: [
          {
            itemId: 'prop-123',
            itemType: 'property',
            action: 'added',
            timestamp: new Date()
          }
        ]
      })
    }

    const totalItems = await Wishlist.countDocuments()
    const propertyItems = await Wishlist.countDocuments({ itemType: 'property' })
    const projectItems = await Wishlist.countDocuments({ itemType: 'project' })
    
    const uniqueSessions = await Wishlist.distinct('sessionId')
    
    const recentActivity = await Wishlist.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('itemId itemType createdAt sessionId')

    res.json({
      totalItems,
      propertyItems,
      projectItems,
      uniqueSessions: uniqueSessions.length,
      recentActivity: recentActivity.map(item => ({
        itemId: item.itemId,
        itemType: item.itemType,
        action: 'added',
        timestamp: item.createdAt
      }))
    })
  } catch (error) {
    console.error('Admin wishlist stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete wishlist item
router.delete('/wishlist/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const wishlistItem = await Wishlist.findByIdAndDelete(req.params.id)
    
    if (!wishlistItem) {
      return res.status(404).json({ message: 'Wishlist item not found' })
    }

    res.json({ message: 'Wishlist item deleted successfully' })
  } catch (error) {
    console.error('Delete wishlist item error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// ============ PARTNERS MANAGEMENT ============

// Get all partners
router.get('/partners', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query
    
    // Fallback when database is not connected
    if (mongoose.connection.readyState !== 1) {
      const mockPartners = [
        {
          _id: 'mock-partner-1',
          name: 'Emaar Properties',
          description: 'Leading real estate developer in UAE',
          established: '1997',
          totalProjects: 50,
          completedProjects: 45,
          ongoingProjects: 5,
          phone: '+971-4-367-3333',
          email: 'info@emaar.ae',
          website: 'https://www.emaar.com',
          status: 'active',
          featured: true,
          rating: 4.8,
          createdAt: new Date()
        }
      ]
      
      return res.json({
        partners: mockPartners,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalPartners: 1,
          hasNext: false,
          hasPrev: false
        }
      })
    }

    let query = {}
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }
    if (status && status !== 'all') {
      query.status = status
    }

    const skip = (page - 1) * limit
    const partners = await Partner.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const totalPartners = await Partner.countDocuments(query)
    const totalPages = Math.ceil(totalPartners / limit)

    res.json({
      partners,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalPartners,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Get partners error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create partner
router.post('/partners', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const partner = new Partner(req.body)
    await partner.save()
    res.status(201).json({ message: 'Partner created successfully', partner })
  } catch (error) {
    console.error('Create partner error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update partner
router.put('/partners/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const partner = await Partner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' })
    }

    res.json({ message: 'Partner updated successfully', partner })
  } catch (error) {
    console.error('Update partner error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete partner
router.delete('/partners/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id)
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' })
    }

    res.json({ message: 'Partner deleted successfully' })
  } catch (error) {
    console.error('Delete partner error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// ============ TESTIMONIALS MANAGEMENT ============

// Get all testimonials
router.get('/testimonials', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query
    
    // Fallback when database is not connected
    if (mongoose.connection.readyState !== 1) {
      const mockTestimonials = [
        {
          _id: 'mock-testimonial-1',
          name: 'Ahmed Al Mansouri',
          position: 'CEO',
          company: 'Al Mansouri Group',
          content: 'Excellent service and professional team. Highly recommended!',
          rating: 5,
          status: 'active',
          featured: true,
          location: 'Dubai',
          createdAt: new Date()
        }
      ]
      
      return res.json({
        testimonials: mockTestimonials,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalTestimonials: 1,
          hasNext: false,
          hasPrev: false
        }
      })
    }

    let query = {}
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    }
    if (status && status !== 'all') {
      query.status = status
    }

    const skip = (page - 1) * limit
    const testimonials = await Testimonial.find(query)
      .populate('propertyId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const totalTestimonials = await Testimonial.countDocuments(query)
    const totalPages = Math.ceil(totalTestimonials / limit)

    res.json({
      testimonials,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalTestimonials,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Get testimonials error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create testimonial
router.post('/testimonials', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const testimonial = new Testimonial(req.body)
    await testimonial.save()
    res.status(201).json({ message: 'Testimonial created successfully', testimonial })
  } catch (error) {
    console.error('Create testimonial error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update testimonial
router.put('/testimonials/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' })
    }

    res.json({ message: 'Testimonial updated successfully', testimonial })
  } catch (error) {
    console.error('Update testimonial error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete testimonial
router.delete('/testimonials/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id)
    
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' })
    }

    res.json({ message: 'Testimonial deleted successfully' })
  } catch (error) {
    console.error('Delete testimonial error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// ============ BLOGS MANAGEMENT ============

// Get all blogs
router.get('/blogs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, category } = req.query
    
    // Fallback when database is not connected
    if (mongoose.connection.readyState !== 1) {
      const mockBlogs = [
        {
          _id: 'mock-blog-1',
          title: 'Dubai Real Estate Market Trends 2024',
          slug: 'dubai-real-estate-market-trends-2024',
          excerpt: 'Latest trends and insights in Dubai real estate market',
          content: 'Detailed analysis of Dubai real estate market...',
          category: 'Market Trends',
          tags: ['dubai', 'real estate', 'trends'],
          status: 'published',
          featured: true,
          views: 150,
          likes: 25,
          createdAt: new Date(),
          publishedAt: new Date()
        }
      ]
      
      return res.json({
        blogs: mockBlogs,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalBlogs: 1,
          hasNext: false,
          hasPrev: false
        }
      })
    }

    let query = {}
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    }
    if (status && status !== 'all') {
      query.status = status
    }
    if (category) {
      query.category = category
    }

    const skip = (page - 1) * limit
    const blogs = await Blog.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const totalBlogs = await Blog.countDocuments(query)
    const totalPages = Math.ceil(totalBlogs / limit)

    res.json({
      blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalBlogs,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Get blogs error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create blog
router.post('/blogs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const blogData = {
      ...req.body,
      author: req.admin._id
    }
    
    // Set publishedAt if status is published
    if (blogData.status === 'published' && !blogData.publishedAt) {
      blogData.publishedAt = new Date()
    }
    
    const blog = new Blog(blogData)
    await blog.save()
    
    await blog.populate('author', 'name email')
    res.status(201).json({ message: 'Blog created successfully', blog })
  } catch (error) {
    console.error('Create blog error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update blog
router.put('/blogs/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updateData = req.body
    
    // Set publishedAt if status is being changed to published
    if (updateData.status === 'published') {
      const existingBlog = await Blog.findById(req.params.id)
      if (existingBlog && existingBlog.status !== 'published') {
        updateData.publishedAt = new Date()
      }
    }
    
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email')
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' })
    }

    res.json({ message: 'Blog updated successfully', blog })
  } catch (error) {
    console.error('Update blog error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete blog
router.delete('/blogs/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id)
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' })
    }

    res.json({ message: 'Blog deleted successfully' })
  } catch (error) {
    console.error('Delete blog error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// ===== PROPERTIES MANAGEMENT =====

// Get all properties with pagination and search
router.get('/properties', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query
    const skip = (page - 1) * limit

    // Build query
    let query = {}
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }
    if (status !== 'all') {
      query.status = status
    }

    // Use Property model or fallback to database connection
    let properties, total
    if (Property) {
      properties = await Property.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
      total = await Property.countDocuments(query)
    } else {
      // Fallback to database connection
      const db = req.app.locals.db
      if (!db) {
        return res.status(500).json({ message: 'Database connection not available' })
      }
      
      const collection = db.collection('properties')
      properties = await collection.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray()
      total = await collection.countDocuments(query)
    }

    res.json({
      success: true,
      properties,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Get properties error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create new property
router.post('/properties', upload.single('image'), async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      price: parseFloat(req.body.price),
      bedrooms: parseInt(req.body.bedrooms),
      bathrooms: parseInt(req.body.bathrooms),
      area: parseFloat(req.body.area),
      yearBuilt: req.body.yearBuilt ? parseInt(req.body.yearBuilt) : undefined,
      features: req.body.features ? req.body.features.split(',').map(f => f.trim()) : [],
      amenities: req.body.amenities ? req.body.amenities.split(',').map(a => a.trim()) : [],
      nearbyPlaces: req.body.nearbyPlaces ? req.body.nearbyPlaces.split(',').map(p => p.trim()) : []
    }

    if (req.file) {
      propertyData.image = `/uploads/${req.file.filename}`
    }

    let property
    if (Property) {
      property = new Property(propertyData)
      await property.save()
    } else {
      // Fallback to database connection
      const db = req.app.locals.db
      if (!db) {
        return res.status(500).json({ message: 'Database connection not available' })
      }
      
      const collection = db.collection('properties')
      propertyData.createdAt = new Date()
      propertyData.updatedAt = new Date()
      const result = await collection.insertOne(propertyData)
      property = { _id: result.insertedId, ...propertyData }
    }

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property
    })
  } catch (error) {
    console.error('Create property error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update property
router.put('/properties/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params
    const updateData = {
      ...req.body,
      price: parseFloat(req.body.price),
      bedrooms: parseInt(req.body.bedrooms),
      bathrooms: parseInt(req.body.bathrooms),
      area: parseFloat(req.body.area),
      yearBuilt: req.body.yearBuilt ? parseInt(req.body.yearBuilt) : undefined,
      features: req.body.features ? req.body.features.split(',').map(f => f.trim()) : [],
      amenities: req.body.amenities ? req.body.amenities.split(',').map(a => a.trim()) : [],
      nearbyPlaces: req.body.nearbyPlaces ? req.body.nearbyPlaces.split(',').map(p => p.trim()) : [],
      updatedAt: new Date()
    }

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`
    }

    let property
    if (Property) {
      property = await Property.findByIdAndUpdate(id, updateData, { new: true })
      if (!property) {
        return res.status(404).json({ message: 'Property not found' })
      }
    } else {
      // Fallback to database connection
      const db = req.app.locals.db
      if (!db) {
        return res.status(500).json({ message: 'Database connection not available' })
      }
      
      const collection = db.collection('properties')
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      )
      
      if (!result.value) {
        return res.status(404).json({ message: 'Property not found' })
      }
      property = result.value
    }

    res.json({
      success: true,
      message: 'Property updated successfully',
      property
    })
  } catch (error) {
    console.error('Update property error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete property
router.delete('/properties/:id', async (req, res) => {
  try {
    const { id } = req.params

    let property
    if (Property) {
      property = await Property.findByIdAndDelete(id)
      if (!property) {
        return res.status(404).json({ message: 'Property not found' })
      }
    } else {
      // Fallback to database connection
      const db = req.app.locals.db
      if (!db) {
        return res.status(500).json({ message: 'Database connection not available' })
      }
      
      const collection = db.collection('properties')
      const result = await collection.findOneAndDelete({ _id: new ObjectId(id) })
      
      if (!result.value) {
        return res.status(404).json({ message: 'Property not found' })
      }
      property = result.value
    }

    res.json({
      success: true,
      message: 'Property deleted successfully'
    })
  } catch (error) {
    console.error('Delete property error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router