import mongoose from 'mongoose'

const partnerSchema = new mongoose.Schema({
  name: {
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
  description: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String,
    required: false
  },
  logoUrl: {
    type: String,
    required: false
  },
  coverImage: {
    type: String,
    required: false,
    default: ''
  },
  coverImageUrl: {
    type: String,
    required: false,
    default: ''
  },
  established: {
    type: String,
    required: true
  },
  totalProjects: {
    type: Number,
    required: true,
    default: 0
  },
  completedProjects: {
    type: Number,
    default: 0
  },
  ongoingProjects: {
    type: Number,
    default: 0
  },
  contact: {
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    website: {
      type: String
    },
    address: {
      street: String,
      city: String,
      country: String,
      zipCode: String
    }
  },
  specialties: [{
    type: String,
    trim: true
  }],
  awards: [{
    type: String,
    trim: true
  }],
  projects: [{
    name: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['Residential', 'Commercial', 'Mixed-Use', 'Hospitality', 'Retail']
    },
    status: {
      type: String,
      enum: ['Completed', 'Ongoing', 'Upcoming', 'Planning']
    },
    image: String,
    description: String,
    completionYear: String
  }],
  about: {
    type: String,
    required: true
  },
  vision: {
    type: String
  },
  mission: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String
  }
}, {
  timestamps: true
})

// Create slug from name before saving
partnerSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
  }
  next()
})

// Index for better search performance
partnerSchema.index({ name: 'text', description: 'text', about: 'text' })
partnerSchema.index({ status: 1 })
partnerSchema.index({ featured: 1 })
partnerSchema.index({ rating: -1 })

const Partner = mongoose.model('Partner', partnerSchema)
export default Partner