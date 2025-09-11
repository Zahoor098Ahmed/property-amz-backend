import mongoose from 'mongoose'

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: false,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['Market Trends', 'Investment Guide', 'Property News', 'Lifestyle', 'Technology']
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    name: {
      type: String,
      required: true,
      default: 'AMZ Properties'
    },
    email: {
      type: String,
      default: 'info@amzproperties.com'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  publishedAt: {
    type: Date
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, {
  timestamps: true
})

// Create slug from title before saving
blogSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
  }
  
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  
  next()
})

// Index for better search performance
blogSchema.index({ title: 'text', content: 'text', excerpt: 'text' })
blogSchema.index({ status: 1, publishedAt: -1 })
blogSchema.index({ category: 1 })
blogSchema.index({ featured: 1 })

const Blog = mongoose.model('Blog', blogSchema)
export default Blog