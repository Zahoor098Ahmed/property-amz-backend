import mongoose from 'mongoose'

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: false,
    default: 'default-property.jpg'
  },
  type: {
    type: String,
    enum: ['exclusive', 'off-plan', 'villa', 'apartment', 'townhouse'],
    required: true
  },
  bedrooms: {
    type: Number,
    required: true
  },
  bathrooms: {
    type: Number,
    required: true
  },
  area: {
    type: String,
    required: true
  },
  features: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available'
  },
  developer: {
    type: String
  },
  completionDate: {
    type: Date
  },
  paymentPlan: {
    type: String
  },
  roi: {
    type: String
  }
}, {
  timestamps: true
})

export default mongoose.model('Property', propertySchema)