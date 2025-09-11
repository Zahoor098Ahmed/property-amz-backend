import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import Blog from '../models/Blog.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/blogs'
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname))
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

// GET /api/blogs - Get all blogs (public)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      status = 'published', 
      featured, 
      search 
    } = req.query

    const query = {}
    
    // Only show published blogs for public access
    if (!req.user) {
      query.status = 'published'
    } else if (status) {
      query.status = status
    }
    
    if (category) query.category = category
    if (featured !== undefined) query.featured = featured === 'true'
    
    if (search) {
      query.$text = { $search: search }
    }

    const blogs = await Blog.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content') // Exclude content for list view

    const total = await Blog.countDocuments(query)

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    })
  } catch (error) {
    console.error('Error fetching blogs:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/blogs/:id - Get single blog
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' })
    }

    // Only show published blogs for public access
    if (!req.user && blog.status !== 'published') {
      return res.status(404).json({ message: 'Blog not found' })
    }

    // Increment views for published blogs
    if (blog.status === 'published') {
      blog.views += 1
      await blog.save()
    }

    res.json(blog)
  } catch (error) {
    console.error('Error fetching blog:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/blogs - Create new blog (admin only)
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      category,
      tags,
      status,
      featured,
      metaTitle,
      metaDescription,
      keywords
    } = req.body

    if (!title || !excerpt || !content || !category) {
      return res.status(400).json({ 
        message: 'Title, excerpt, content, and category are required' 
      })
    }

    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    const blogData = {
      title,
      slug,
      excerpt,
      content,
      category,
      status: status || 'draft',
      featured: featured === 'true'
    }

    if (req.file) {
      blogData.image = `/uploads/blogs/${req.file.filename}`
    }

    if (tags) {
      blogData.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags
    }

    if (metaTitle || metaDescription || keywords) {
      blogData.seo = {}
      if (metaTitle) blogData.seo.metaTitle = metaTitle
      if (metaDescription) blogData.seo.metaDescription = metaDescription
      if (keywords) {
        blogData.seo.keywords = typeof keywords === 'string' 
          ? keywords.split(',').map(keyword => keyword.trim()) 
          : keywords
      }
    }

    const blog = new Blog(blogData)
    await blog.save()

    res.status(201).json(blog)
  } catch (error) {
    console.error('Error creating blog:', error)
    if (error.code === 11000) {
      res.status(400).json({ message: 'Blog with this title already exists' })
    } else {
      res.status(500).json({ message: 'Server error' })
    }
  }
})

// PUT /api/blogs/:id - Update blog (admin only)
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' })
    }

    const {
      title,
      excerpt,
      content,
      category,
      tags,
      status,
      featured,
      metaTitle,
      metaDescription,
      keywords
    } = req.body

    // Update fields
    if (title) blog.title = title
    if (excerpt) blog.excerpt = excerpt
    if (content) blog.content = content
    if (category) blog.category = category
    if (status) blog.status = status
    if (featured !== undefined) blog.featured = featured === 'true'

    if (req.file) {
      // Delete old image if exists
      if (blog.image && blog.image.startsWith('/uploads/')) {
        const oldImagePath = path.join(process.cwd(), blog.image)
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
      }
      blog.image = `/uploads/blogs/${req.file.filename}`
    }

    if (tags) {
      blog.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags
    }

    // Update SEO
    if (metaTitle || metaDescription || keywords) {
      if (!blog.seo) blog.seo = {}
      if (metaTitle) blog.seo.metaTitle = metaTitle
      if (metaDescription) blog.seo.metaDescription = metaDescription
      if (keywords) {
        blog.seo.keywords = typeof keywords === 'string' 
          ? keywords.split(',').map(keyword => keyword.trim()) 
          : keywords
      }
    }

    await blog.save()
    res.json(blog)
  } catch (error) {
    console.error('Error updating blog:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// DELETE /api/blogs/:id - Delete blog (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' })
    }

    // Delete associated image
    if (blog.image && blog.image.startsWith('/uploads/')) {
      const imagePath = path.join(process.cwd(), blog.image)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    await Blog.findByIdAndDelete(req.params.id)
    res.json({ message: 'Blog deleted successfully' })
  } catch (error) {
    console.error('Error deleting blog:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/blogs/categories/list - Get all categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Blog.distinct('category')
    res.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router