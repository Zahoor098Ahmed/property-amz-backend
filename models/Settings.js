import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'AMZ Properties'
  },
  siteDescription: {
    type: String,
    default: 'Premium Real Estate Services in Dubai'
  },
  logo: {
    type: String
  },
  favicon: {
    type: String
  },
  contactInfo: {
    email: {
      type: String,
      default: 'info@amzproperties.com'
    },
    phone: {
      type: String,
      default: '+971 4 123 4567'
    },
    whatsapp: {
      type: String,
      default: '+971 50 123 4567'
    },
    address: {
      type: String,
      default: 'Dubai Marina, Dubai, UAE'
    }
  },
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String,
    youtube: String,
    github: String
  },
  seo: {
    metaTitle: {
      type: String,
      default: 'AMZ Properties - Premium Real Estate Dubai'
    },
    metaDescription: {
      type: String,
      default: 'Discover premium real estate opportunities in Dubai with AMZ Properties. Expert guidance for buying, selling, and investing in Dubai properties.'
    },
    keywords: {
      type: String,
      default: 'Dubai real estate, property investment, luxury homes, Dubai Marina, real estate agent'
    }
  },
  appearance: {
    primaryColor: {
      type: String,
      default: '#1a365d'
    },
    secondaryColor: {
      type: String,
      default: '#2d3748'
    },
    accentColor: {
      type: String,
      default: '#3182ce'
    }
  },
  features: {
    enableBlog: {
      type: Boolean,
      default: true
    },
    enableNewsletter: {
      type: Boolean,
      default: true
    },
    enableLiveChat: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
})

const Settings = mongoose.model('Settings', settingsSchema)
export default Settings