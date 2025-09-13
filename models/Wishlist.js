import mongoose from 'mongoose'

const wishlistSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    default: null
  },
  itemId: {
    type: String,
    required: true
  },
  itemType: {
    type: String,
    required: true,
    enum: ['property', 'project']
  },
  itemData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Compound index for efficient queries
wishlistSchema.index({ sessionId: 1, itemId: 1, itemType: 1 }, { unique: true })
wishlistSchema.index({ userId: 1, itemId: 1, itemType: 1 })
wishlistSchema.index({ createdAt: -1 })

const Wishlist = mongoose.model('Wishlist', wishlistSchema)

export default Wishlist