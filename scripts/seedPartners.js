import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Partner from '../models/Partner.js'
import connectDB from '../config/database.js'

// Load environment variables
dotenv.config()

const seedPartners = async () => {
  try {
    // Connect to database
    await connectDB()

    // Check if partners already exist
    const existingPartners = await Partner.countDocuments()
    
    if (existingPartners > 0) {
      console.log('🤝 Partners already exist in database!')
      console.log(`Total partners: ${existingPartners}`)
      process.exit(0)
    }

    // Sample partners data
    const samplePartners = [
      {
        name: 'Emaar Properties',
        logo: '/uploads/partners/emaar-logo.png',
        totalProjects: 150,
        description: 'Emaar Properties is a leading real estate development company in the UAE, known for iconic projects like Burj Khalifa, Dubai Mall, and Dubai Marina.',
        specialties: ['Luxury Developments', 'Mixed-Use Projects', 'Residential Communities', 'Commercial Properties']
      },
      {
        name: 'Dubai Properties',
        logo: '/uploads/partners/dubai-properties-logo.png',
        totalProjects: 85,
        description: 'Dubai Properties is a leading real estate master developer that has delivered iconic residential, commercial, and mixed-use developments across Dubai.',
        specialties: ['Master Communities', 'Waterfront Developments', 'Business Districts', 'Retail Centers']
      },
      {
        name: 'Nakheel',
        logo: '/uploads/partners/nakheel-logo.png',
        totalProjects: 120,
        description: 'Nakheel is Dubai\'s leading master developer, responsible for creating iconic developments including Palm Jumeirah, The World Islands, and Dubai Islands.',
        specialties: ['Iconic Developments', 'Waterfront Projects', 'Luxury Resorts', 'Mixed-Use Communities']
      },
      {
        name: 'DAMAC Properties',
        logo: '/uploads/partners/damac-logo.png',
        totalProjects: 200,
        description: 'DAMAC Properties is a leading luxury real estate developer in the Middle East, known for delivering high-end residential, commercial, and leisure properties.',
        specialties: ['Luxury Residences', 'Golf Communities', 'Serviced Hotels', 'Commercial Towers']
      },
      {
        name: 'Sobha Realty',
        logo: '/uploads/partners/sobha-logo.png',
        totalProjects: 45,
        description: 'Sobha Realty is an international luxury real estate developer committed to redefining the art of living by creating beautiful, innovative, and sustainable communities.',
        specialties: ['Luxury Villas', 'Premium Apartments', 'Sustainable Communities', 'Waterfront Living']
      },
      {
        name: 'Meraas',
        logo: '/uploads/partners/meraas-logo.png',
        totalProjects: 75,
        description: 'Meraas is a Dubai-based holding company that creates innovative real estate, entertainment, and lifestyle experiences that enhance the urban fabric of the city.',
        specialties: ['Urban Development', 'Entertainment Districts', 'Beachfront Properties', 'Cultural Projects']
      },
      {
        name: 'Aldar Properties',
        logo: '/uploads/partners/aldar-logo.png',
        totalProjects: 90,
        description: 'Aldar Properties is the leading real estate developer, investor, and manager in Abu Dhabi, with a diversified portfolio of residential, commercial, and retail assets.',
        specialties: ['Residential Communities', 'Commercial Developments', 'Retail Centers', 'Mixed-Use Projects']
      },
      {
        name: 'Azizi Developments',
        logo: '/uploads/partners/azizi-logo.png',
        totalProjects: 100,
        description: 'Azizi Developments is a leading developer in the UAE, known for creating modern, stylish, and affordable residential and commercial properties across Dubai.',
        specialties: ['Affordable Housing', 'Modern Apartments', 'Commercial Spaces', 'Mixed-Use Developments']
      }
    ]

    // Insert sample partners
    const createdPartners = await Partner.insertMany(samplePartners)
    
    console.log('✅ Sample partners created successfully!')
    console.log(`Created ${createdPartners.length} partners`)
    
    // Display created partners
    createdPartners.forEach((partner, index) => {
      console.log(`${index + 1}. ${partner.name} - ${partner.totalProjects} projects`)
    })
    
  } catch (error) {
    console.error('❌ Error creating sample partners:', error.message)
  } finally {
    mongoose.connection.close()
  }
}

// Run the seed function
seedPartners()