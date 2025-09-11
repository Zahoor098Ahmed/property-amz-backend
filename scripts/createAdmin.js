import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Admin from '../models/Admin.js'
import connectDB from '../config/database.js'

// Load environment variables
dotenv.config()

const createAdmin = async () => {
  try {
    // Connect to database
    await connectDB()

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL })
    
    if (existingAdmin) {
      console.log('Admin user already exists!')
      console.log('Email:', existingAdmin.email)
      process.exit(0)
    }

    // Create new admin
    const admin = new Admin({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@amzproperties.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      isActive: true
    })

    await admin.save()

    console.log('✅ Admin user created successfully!')
    console.log('Email:', admin.email)
    console.log('Password:', process.env.ADMIN_PASSWORD || 'admin@123')
    console.log('\n🔐 Please change the default password after first login!')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin:', error.message)
    process.exit(1)
  }
}

createAdmin()