import express from 'express'
import mongoose from 'mongoose'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import Property from '../models/Property.js'
import { authenticateToken as auth } from '../middleware/auth.js'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads')
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, 'property-' + uniqueSuffix + ext)
  }
})

// File filter to only accept images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed'), false)
  }
}

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
})

// Serve static files from uploads directory
router.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// Removed mock data - using only MongoDB

// Get all properties with advanced filtering, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    const {
      type,
      location,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      minArea,
      maxArea,
      status,
      developer,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query
    
    // Build filter object
    let filter = {}
    
    if (type && ['exclusive', 'off-plan'].includes(type)) {
      filter.type = type
    }
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' }
    }
    
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = parseInt(minPrice)
      if (maxPrice) filter.price.$lte = parseInt(maxPrice)
    }
    
    if (bedrooms) {
      filter.bedrooms = parseInt(bedrooms)
    }
    
    if (bathrooms) {
      filter.bathrooms = parseInt(bathrooms)
    }
    
    if (minArea || maxArea) {
      filter.area = {}
      if (minArea) filter.area.$gte = parseInt(minArea)
      if (maxArea) filter.area.$lte = parseInt(maxArea)
    }
    
    if (status) {
      filter.status = status
    }
    
    if (developer) {
      filter.developer = { $regex: developer, $options: 'i' }
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ]
    }
    
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database connection not available' 
      })
    }
    
    // Count total documents for pagination
    const total = await Property.countDocuments(filter)
    
    // Create sort object
    const sort = {}
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1
    
    // Fetch properties from database with pagination
    const properties = await Property.find(filter)
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
    
    res.json({ 
      success: true, 
      data: properties,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching properties:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get single property
router.get('/:id', async (req, res) => {
  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database connection not available' 
      })
    }
    
    const property = await Property.findById(req.params.id)
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' })
    }
    res.json({ success: true, data: property })
  } catch (error) {
    console.error('Error fetching property:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create new property with image upload (admin only)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    console.log('Create property request received');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const {
      title,
      description,
      price,
      location,
      type,
      bedrooms,
      bathrooms,
      area,
      features,
      status,
      developer,
      completionDate,
      paymentPlan,
      roi
    } = req.body
    
    // Validate required fields
    if (!title || !description || !price || !location || !bedrooms || !bathrooms || !area) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided: title, description, price, location, bedrooms, bathrooms, area' 
      })
    }
    
    // Convert string numbers to integers
    const numericPrice = parseInt(price)
    const numericBedrooms = parseInt(bedrooms)
    const numericBathrooms = parseInt(bathrooms)
    const numericArea = parseInt(area)
    
    // Validate numeric values
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be a valid positive number' })
    }
    
    if (isNaN(numericBedrooms) || numericBedrooms <= 0) {
      return res.status(400).json({ success: false, message: 'Bedrooms must be a valid positive number' })
    }
    
    if (isNaN(numericBathrooms) || numericBathrooms <= 0) {
      return res.status(400).json({ success: false, message: 'Bathrooms must be a valid positive number' })
    }
    
    if (isNaN(numericArea) || numericArea <= 0) {
      return res.status(400).json({ success: false, message: 'Area must be a valid positive number' })
    }
    
    // Handle image upload
    let imagePath = ''
    if (req.file) {
      // Create URL path for the uploaded image
      imagePath = `/api/properties/uploads/${req.file.filename}`
      console.log('New image path:', imagePath);
    } else if (req.body.image) {
      // If no file uploaded but image URL provided in request body
      imagePath = req.body.image
      console.log('Using provided image path:', imagePath);
    } else {
      // Default placeholder image if no image provided
      imagePath = '/api/properties/uploads/default-property.jpg'
      console.log('Using default image path');
    }

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database connection not available' 
      })
    }

    const property = new Property({
      title,
      description,
      price: numericPrice,
      location,
      image: imagePath,
      type,
      bedrooms: numericBedrooms,
      bathrooms: numericBathrooms,
      area: numericArea,
      features: features || [],
      status: status || 'available',
      developer,
      completionDate,
      paymentPlan,
      roi
    })

    await property.save()
    res.status(201).json({ success: true, data: property })
  } catch (error) {
    console.error('Error creating property:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update property with image upload (admin only)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    console.log('Update property request received for ID:', req.params.id);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    // Handle image upload
    let imagePath = null
    if (req.file) {
      // Create URL path for the uploaded image
      imagePath = `/api/properties/uploads/${req.file.filename}`
      console.log('New image path:', imagePath);
    } else if (req.body.image) {
      // If no file uploaded but image URL provided in request body
      imagePath = req.body.image
      console.log('Using existing image path:', imagePath);
    }
    
    // Create update object with or without new image
    const updateData = { ...req.body }
    
    // Handle features array
    if (req.body.features && !Array.isArray(req.body.features)) {
      if (typeof req.body.features === 'string') {
        updateData.features = [req.body.features];
      }
    }
    
    if (imagePath) {
      updateData.image = imagePath
    }
    
    console.log('Update data:', updateData);
    
    // Check if it's a mock property ID
    if (req.params.id.startsWith('mock-')) {
      // Handle mock property update
      const mockPropertyIndex = mockProperties.findIndex(p => p._id === req.params.id)
      if (mockPropertyIndex === -1) {
        return res.status(404).json({ success: false, message: 'Property not found' })
      }
      
      const updatedProperty = { ...mockProperties[mockPropertyIndex], ...updateData, updatedAt: new Date() }
      mockProperties[mockPropertyIndex] = updatedProperty
      console.log('Mock property updated:', updatedProperty)
      return res.json({ success: true, data: updatedProperty })
    }
    
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' })
    }
    res.json({ success: true, data: property })
  } catch (error) {
    console.error('Error updating property:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
})

// Delete property (admin only)
router.delete('/:id', async (req, res) => {
  try {
    console.log('Delete property request received for ID:', req.params.id);
    
    // Check if it's a mock property ID
    if (req.params.id.startsWith('mock-')) {
      // Handle mock property deletion
      const initialLength = mockProperties.length
      mockProperties = mockProperties.filter(p => p._id !== req.params.id)
      
      if (mockProperties.length === initialLength) {
        return res.status(404).json({ success: false, message: 'Property not found' })
      }
      
      console.log('Mock property deleted, remaining:', mockProperties.length)
      return res.json({ success: true, message: 'Property removed' })
    }
    
    const property = await Property.findById(req.params.id)
    if (!property) {
      return res.status(404).json({ message: 'Property not found' })
    }

    await property.deleteOne()
    res.json({ success: true, message: 'Property removed' })
  } catch (error) {
    console.error('Error deleting property:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router