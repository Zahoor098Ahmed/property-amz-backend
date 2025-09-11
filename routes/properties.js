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

// Mock properties for development when database is not connected
let mockProperties = [
  {
    _id: 'mock-property-1',
    title: 'Luxury Villa in Downtown',
    description: 'Beautiful 4-bedroom villa with modern amenities',
    price: 2500000,
    location: 'Downtown Dubai',
    bedrooms: 4,
    bathrooms: 3,
    area: 3500,
    type: 'exclusive',
    images: ['/images/property1.jpg'],
    features: ['Swimming Pool', 'Gym', 'Parking'],
    status: 'available',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'mock-property-2',
    title: 'Modern Apartment Complex',
    description: 'Contemporary 2-bedroom apartment with city views',
    price: 1200000,
    location: 'Business Bay',
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    type: 'off-plan',
    images: ['/images/property2.jpg'],
    features: ['Balcony', 'Gym', 'Security'],
    status: 'available',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

// Get all properties
router.get('/', async (req, res) => {
  try {
    const { type } = req.query
    let filter = {}
    
    if (type && ['exclusive', 'off-plan'].includes(type)) {
      filter.type = type
    }
    
    // Fallback to mock data when database is not connected
    if (mongoose.connection.readyState !== 1) {
      
      let filteredProperties = mockProperties
      if (type && ['exclusive', 'off-plan'].includes(type)) {
        filteredProperties = mockProperties.filter(p => p.type === type)
      }
      
      return res.json({ success: true, data: filteredProperties })
    }
    
    const properties = await Property.find(filter).sort({ createdAt: -1 })
    res.json({ success: true, data: properties })
  } catch (error) {
    console.error('Error fetching properties:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get single property
router.get('/:id', async (req, res) => {
  try {
    // Fallback to mock data when database is not connected
    if (mongoose.connection.readyState !== 1) {
      const mockProperty = {
        _id: req.params.id,
        title: 'Mock Property Details',
        description: 'This is a mock property for testing purposes when database is not available',
        price: 1500000,
        location: 'Mock Location',
        bedrooms: 3,
        bathrooms: 2,
        area: 2000,
        type: 'exclusive',
        images: ['/api/placeholder/400/300'],
        features: ['Mock Feature 1', 'Mock Feature 2'],
        status: 'available',
        createdAt: new Date()
      }
      
      return res.json({ success: true, data: mockProperty })
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

    // Fallback when database is not connected
    if (mongoose.connection.readyState !== 1) {
      const mockProperty = {
        _id: 'mock-property-' + Date.now(),
        title,
        description,
        price,
        location,
        image: imagePath,
        type,
        bedrooms,
        bathrooms,
        area,
        features: features || [],
        status: status || 'available',
        developer,
        completionDate,
        paymentPlan,
        roi,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // Add to mock properties array for persistence
      mockProperties.push(mockProperty)
      console.log('Mock property created:', mockProperty)
      console.log('Total mock properties:', mockProperties.length)
      return res.status(201).json({ success: true, data: mockProperty })
    }

    const property = new Property({
      title,
      description,
      price,
      location,
      image: imagePath,
      type,
      bedrooms,
      bathrooms,
      area,
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