import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import Partner from '../models/Partner.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/partners'
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const prefix = file.fieldname === 'logo' ? 'logo-' : 'cover-'
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname))
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

// GET /api/partners - Get all partners (public)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = 'active', 
      featured, 
      search 
    } = req.query

    const query = {}
    
    // Only show active partners for public access
    if (!req.user) {
      query.status = 'active'
    } else if (status) {
      query.status = status
    }
    
    if (featured !== undefined) query.featured = featured === 'true'
    
    if (search) {
      query.$text = { $search: search }
    }

    const partners = await Partner.find(query)
      .sort({ featured: -1, rating: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-projects -about -vision -mission') // Exclude detailed info for list view

    const total = await Partner.countDocuments(query)

    res.json({
      partners,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    })
  } catch (error) {
    console.error('Error fetching partners:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/partners/:id - Get single partner
router.get('/:id', async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id)
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' })
    }

    // Only show active partners for public access
    if (!req.user && partner.status !== 'active') {
      return res.status(404).json({ message: 'Partner not found' })
    }

    res.json(partner)
  } catch (error) {
    console.error('Error fetching partner:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/partners - Create new partner (admin only)
router.post('/', authenticateToken, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), async (req, res) => {
  try {
    const {
      name,
      description,
      established,
      totalProjects,
      completedProjects,
      ongoingProjects,
      phone,
      email,
      website,
      address,
      specialties,
      awards,
      about,
      vision,
      mission,
      status,
      featured,
      rating,
      socialMedia,
      logoUrl,
      coverImageUrl,
      imageUploadType
    } = req.body

    if (!name || !description || !established || !phone || !email || !about) {
      return res.status(400).json({ 
        message: 'Name, description, established, phone, email, and about are required' 
      })
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    const partnerData = {
      name,
      slug,
      description,
      established,
      totalProjects: totalProjects || 0,
      completedProjects: completedProjects || 0,
      ongoingProjects: ongoingProjects || 0,
      contact: {
        phone,
        email,
        website
      },
      about,
      status: status || 'active',
      featured: featured === 'true',
      rating: rating || 0
    }

    // Handle image uploads (file or URL)
    const uploadTypes = imageUploadType ? JSON.parse(imageUploadType) : { logo: 'file', coverImage: 'file' }
    
    // Handle logo
    if (uploadTypes.logo === 'url' && logoUrl) {
      partnerData.logoUrl = logoUrl
    } else if (req.files && req.files.logo) {
      partnerData.logo = `/uploads/partners/${req.files.logo[0].filename}`
    }
    
    // Handle cover image
    if (uploadTypes.coverImage === 'url' && coverImageUrl) {
      partnerData.coverImageUrl = coverImageUrl
    } else if (req.files && req.files.coverImage) {
      partnerData.coverImage = `/uploads/partners/${req.files.coverImage[0].filename}`
    }

    // Handle address
    if (address) {
      try {
        partnerData.contact.address = typeof address === 'string' ? JSON.parse(address) : address
      } catch (e) {
        partnerData.contact.address = address
      }
    }

    // Handle arrays
    if (specialties) {
      partnerData.specialties = typeof specialties === 'string' 
        ? specialties.split(',').map(s => s.trim()) 
        : specialties
    }

    if (awards) {
      partnerData.awards = typeof awards === 'string' 
        ? awards.split(',').map(a => a.trim()) 
        : awards
    }

    // Handle optional fields
    if (vision) partnerData.vision = vision
    if (mission) partnerData.mission = mission

    // Handle social media
    if (socialMedia) {
      try {
        partnerData.socialMedia = typeof socialMedia === 'string' ? JSON.parse(socialMedia) : socialMedia
      } catch (e) {
        partnerData.socialMedia = socialMedia
      }
    }

    const partner = new Partner(partnerData)
    await partner.save()

    res.status(201).json(partner)
  } catch (error) {
    console.error('Error creating partner:', error)
    if (error.code === 11000) {
      res.status(400).json({ message: 'Partner with this name already exists' })
    } else {
      res.status(500).json({ message: 'Server error' })
    }
  }
})

// PUT /api/partners/:id - Update partner (admin only)
router.put('/:id', authenticateToken, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id)
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' })
    }

    const {
      name,
      description,
      established,
      totalProjects,
      completedProjects,
      ongoingProjects,
      phone,
      email,
      website,
      address,
      specialties,
      awards,
      about,
      vision,
      mission,
      status,
      featured,
      rating,
      socialMedia,
      logoUrl,
      coverImageUrl,
      imageUploadType
    } = req.body

    // Update basic fields
    if (name) partner.name = name
    if (description) partner.description = description
    if (established) partner.established = established
    if (totalProjects !== undefined) partner.totalProjects = totalProjects
    if (completedProjects !== undefined) partner.completedProjects = completedProjects
    if (ongoingProjects !== undefined) partner.ongoingProjects = ongoingProjects
    if (about) partner.about = about
    if (vision) partner.vision = vision
    if (mission) partner.mission = mission
    if (status) partner.status = status
    if (featured !== undefined) partner.featured = featured === 'true'
    if (rating !== undefined) partner.rating = rating

    // Update contact info
    if (phone) partner.contact.phone = phone
    if (email) partner.contact.email = email
    if (website) partner.contact.website = website

    // Handle image uploads (file or URL)
    const uploadTypes = imageUploadType ? JSON.parse(imageUploadType) : { logo: 'file', coverImage: 'file' }
    
    // Handle logo
    if (uploadTypes.logo === 'url' && logoUrl !== undefined) {
      // Clear file-based logo if switching to URL
      if (partner.logo && partner.logo.startsWith('/uploads/')) {
        const oldLogoPath = path.join(process.cwd(), partner.logo)
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath)
        }
        partner.logo = undefined
      }
      partner.logoUrl = logoUrl
    } else if (uploadTypes.logo === 'file' && req.files && req.files.logo) {
      // Delete old logo file
      if (partner.logo && partner.logo.startsWith('/uploads/')) {
        const oldLogoPath = path.join(process.cwd(), partner.logo)
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath)
        }
      }
      // Clear URL-based logo if switching to file
      partner.logoUrl = undefined
      partner.logo = `/uploads/partners/${req.files.logo[0].filename}`
    }
    
    // Handle cover image
    if (uploadTypes.coverImage === 'url' && coverImageUrl !== undefined) {
      // Clear file-based cover image if switching to URL
      if (partner.coverImage && partner.coverImage.startsWith('/uploads/')) {
        const oldCoverPath = path.join(process.cwd(), partner.coverImage)
        if (fs.existsSync(oldCoverPath)) {
          fs.unlinkSync(oldCoverPath)
        }
        partner.coverImage = undefined
      }
      partner.coverImageUrl = coverImageUrl
    } else if (uploadTypes.coverImage === 'file' && req.files && req.files.coverImage) {
      // Delete old cover image file
      if (partner.coverImage && partner.coverImage.startsWith('/uploads/')) {
        const oldCoverPath = path.join(process.cwd(), partner.coverImage)
        if (fs.existsSync(oldCoverPath)) {
          fs.unlinkSync(oldCoverPath)
        }
      }
      // Clear URL-based cover image if switching to file
      partner.coverImageUrl = undefined
      partner.coverImage = `/uploads/partners/${req.files.coverImage[0].filename}`
    }

    // Handle address
    if (address) {
      try {
        partner.contact.address = typeof address === 'string' ? JSON.parse(address) : address
      } catch (e) {
        partner.contact.address = address
      }
    }

    // Handle arrays
    if (specialties) {
      partner.specialties = typeof specialties === 'string' 
        ? specialties.split(',').map(s => s.trim()) 
        : specialties
    }

    if (awards) {
      partner.awards = typeof awards === 'string' 
        ? awards.split(',').map(a => a.trim()) 
        : awards
    }

    // Handle social media
    if (socialMedia) {
      try {
        partner.socialMedia = typeof socialMedia === 'string' ? JSON.parse(socialMedia) : socialMedia
      } catch (e) {
        partner.socialMedia = socialMedia
      }
    }

    await partner.save()
    res.json(partner)
  } catch (error) {
    console.error('Error updating partner:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// DELETE /api/partners/:id - Delete partner (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id)
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' })
    }

    // Delete associated images
    if (partner.logo && partner.logo.startsWith('/uploads/')) {
      const logoPath = path.join(process.cwd(), partner.logo)
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath)
      }
    }

    if (partner.coverImage && partner.coverImage.startsWith('/uploads/')) {
      const coverPath = path.join(process.cwd(), partner.coverImage)
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath)
      }
    }

    await Partner.findByIdAndDelete(req.params.id)
    res.json({ message: 'Partner deleted successfully' })
  } catch (error) {
    console.error('Error deleting partner:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/partners/:id/projects - Add project to partner (admin only)
router.post('/:id/projects', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id)
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' })
    }

    const { name, location, type, status, description, completionYear } = req.body

    if (!name || !location || !type || !status) {
      return res.status(400).json({ 
        message: 'Name, location, type, and status are required' 
      })
    }

    const projectData = {
      name,
      location,
      type,
      status,
      description,
      completionYear
    }

    if (req.file) {
      projectData.image = `/uploads/partners/${req.file.filename}`
    }

    partner.projects.push(projectData)
    await partner.save()

    res.status(201).json(partner)
  } catch (error) {
    console.error('Error adding project:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router