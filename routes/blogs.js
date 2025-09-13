import express from 'express';
import Blog from '../models/Blog.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get all blogs (public endpoint)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'published', category, search } = req.query;
    
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
        },
        {
          _id: 'mock-blog-2',
          title: 'Investment Opportunities in UAE Real Estate',
          slug: 'investment-opportunities-uae-real-estate',
          excerpt: 'Explore the best investment opportunities in UAE real estate market',
          content: 'Comprehensive guide to real estate investment...',
          category: 'Investment',
          tags: ['investment', 'uae', 'real estate'],
          status: 'published',
          featured: false,
          views: 89,
          likes: 12,
          createdAt: new Date(),
          publishedAt: new Date()
        },
        {
          _id: 'mock-blog-3',
          title: 'Luxury Properties in Downtown Dubai',
          slug: 'luxury-properties-downtown-dubai',
          excerpt: 'Discover the most luxurious properties in Downtown Dubai',
          content: 'Exclusive look at luxury real estate options...',
          category: 'Luxury',
          tags: ['luxury', 'downtown', 'dubai'],
          status: 'published',
          featured: true,
          views: 203,
          likes: 34,
          createdAt: new Date(),
          publishedAt: new Date()
        }
      ];
      
      return res.json({
        success: true,
        data: mockBlogs,
        pagination: {
          current: parseInt(page),
          pages: 1,
          total: mockBlogs.length,
          limit: parseInt(limit)
        }
      });
    }

    let query = { status };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { excerpt: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      data: blogs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get single blog by ID or slug (public endpoint)
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Fallback when database is not connected
    if (mongoose.connection.readyState !== 1) {
      const mockBlog = {
        _id: identifier,
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
      };
      
      return res.json({
        success: true,
        data: mockBlog
      });
    }

    let blog;
    
    // Try to find by ID first, then by slug
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      blog = await Blog.findById(identifier);
    } else {
      blog = await Blog.findOne({ slug: identifier });
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment views
    blog.views = (blog.views || 0) + 1;
    await blog.save();

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;