import express from 'express'
import Post from '../models/Post.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// Get all posts (public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status = 'published' } = req.query
    
    const query = { status }
    if (category) query.category = category

    const posts = await Post.find(query)
      .populate('author', 'name')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content')

    const total = await Post.countDocuments(query)

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    })
  } catch (error) {
    console.error('Get posts error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get single post by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    }).populate('author', 'name')

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    // Increment views
    post.views += 1
    await post.save()

    res.json(post)
  } catch (error) {
    console.error('Get post error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Admin routes (protected)

// Get all posts for admin
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('GET /api/posts/admin/all - Request received with query:', req.query);
    const { page = 1, limit = 10, status, category, search } = req.query
    
    const query = {}
    if (status) query.status = status
    if (category) query.category = category
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    }
    
    console.log('Querying posts with:', query);

    const posts = await Post.find(query)
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Post.countDocuments(query)
    
    console.log(`Found ${posts.length} posts out of ${total} total posts`);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    })
    
    console.log('Response sent successfully');
  } catch (error) {
    console.error('Get admin posts error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create new post
router.post('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Creating new post with data:', req.body);
    const postData = {
      ...req.body,
      author: req.admin._id
    }

    const post = new Post(postData)
    await post.save()
    await post.populate('author', 'name')

    res.status(201).json({
      message: 'Post created successfully',
      post
    })
  } catch (error) {
    console.error('Create post error:', error)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Post with this title already exists' })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

// Update post
router.put('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    Object.assign(post, req.body)
    await post.save()
    await post.populate('author', 'name')

    res.json({
      message: 'Post updated successfully',
      post
    })
  } catch (error) {
    console.error('Update post error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete post
router.delete('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    await Post.findByIdAndDelete(req.params.id)

    res.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Delete post error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get single post for editing
router.get('/admin/edit/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name')
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    res.json(post)
  } catch (error) {
    console.error('Get post for edit error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router