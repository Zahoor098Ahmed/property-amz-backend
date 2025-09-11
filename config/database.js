import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)

    console.log(`MongoDB Connected: ${conn.connection.host}`)
    return true
  } catch (error) {
    console.error('Database connection error:', error.message)
    console.log('⚠️  Running without database connection - using mock data instead')
    console.log('💡 To fix this error, please install and start MongoDB locally or update MONGODB_URI in .env file')
    // Don't exit process, allow server to run without DB for development
    return false
  }
}

export default connectDB