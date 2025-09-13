import express from 'express';
import Testimonial from '../models/Testimonial.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get all testimonials (public endpoint)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'active' } = req.query;
    
    // Fallback when database is not connected
    if (mongoose.connection.readyState !== 1) {
      const mockTestimonials = [
        {
          _id: 'mock-testimonial-1',
          name: 'Ahmed Al Mansouri',
          role: 'Business Owner',
          text: 'AMZ Properties helped me find the perfect villa in Dubai Marina. Their service was exceptional and professional throughout the entire process.',
          rating: 5,
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          isActive: true,
          order: 1,
          createdAt: new Date()
        },
        {
          _id: 'mock-testimonial-2',
          name: 'Sarah Johnson',
          role: 'Investment Consultant',
          text: 'Outstanding real estate agency! They provided excellent guidance for my property investment in Downtown Dubai. Highly recommended!',
          rating: 5,
          image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          isActive: true,
          order: 2,
          createdAt: new Date()
        },
        {
          _id: 'mock-testimonial-3',
          name: 'Mohammed Hassan',
          role: 'Entrepreneur',
          text: 'Professional team with deep market knowledge. They made my property purchase smooth and hassle-free. Great experience overall!',
          rating: 5,
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          isActive: true,
          order: 3,
          createdAt: new Date()
        }
      ];
      
      return res.json({
        success: true,
        data: mockTestimonials,
        pagination: {
          current: parseInt(page),
          pages: 1,
          total: mockTestimonials.length,
          limit: parseInt(limit)
        }
      });
    }

    let query = {};
    
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const testimonials = await Testimonial.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Testimonial.countDocuments(query);

    res.json({
      success: true,
      data: testimonials,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get single testimonial by ID (public endpoint)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fallback when database is not connected
    if (mongoose.connection.readyState !== 1) {
      const mockTestimonial = {
        _id: id,
        name: 'Ahmed Al Mansouri',
        role: 'Business Owner',
        text: 'AMZ Properties helped me find the perfect villa in Dubai Marina. Their service was exceptional and professional throughout the entire process.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        isActive: true,
        order: 1,
        createdAt: new Date()
      };
      
      return res.json({
        success: true,
        data: mockTestimonial
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid testimonial ID'
      });
    }

    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    console.error('Get testimonial error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;