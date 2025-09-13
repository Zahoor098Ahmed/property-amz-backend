import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Property from '../models/Property.js'
import connectDB from '../config/database.js'

// Load environment variables
dotenv.config()

const seedProperties = async () => {
  try {
    // Connect to database
    await connectDB()

    // Check if properties already exist
    const existingProperties = await Property.countDocuments()
    
    if (existingProperties > 0) {
      console.log('🏠 Properties already exist in database!')
      console.log(`Total properties: ${existingProperties}`)
      process.exit(0)
    }

    // Sample properties data
    const sampleProperties = [
      {
        title: 'Luxury Villa in Dubai Marina',
        description: 'Stunning 4-bedroom villa with panoramic marina views, private pool, and premium finishes. Located in the heart of Dubai Marina with easy access to beaches, restaurants, and shopping.',
        price: '8,500,000 AED',
        location: 'Dubai Marina, Dubai',
        type: 'exclusive',
        bedrooms: 4,
        bathrooms: 5,
        area: '4,500 sq ft',
        features: ['Private Pool', 'Marina View', 'Parking', 'Gym', 'Security'],
        status: 'available',
        image: '/uploads/properties/villa-marina.jpg',
        developer: 'Emaar Properties',
        paymentPlan: '20% Down Payment, 80% on Completion',
        roi: '8.5% Annual ROI'
      },
      {
        title: 'Modern Apartment in Downtown Dubai',
        description: 'Contemporary 2-bedroom apartment in the iconic Downtown Dubai. Features floor-to-ceiling windows with Burj Khalifa views, modern kitchen, and access to world-class amenities.',
        price: '2,800,000 AED',
        location: 'Downtown Dubai, Dubai',
        type: 'exclusive',
        bedrooms: 2,
        bathrooms: 3,
        area: '1,200 sq ft',
        features: ['Burj Khalifa View', 'Balcony', 'Parking', 'Pool', 'Concierge'],
        status: 'available',
        image: '/uploads/properties/apartment-downtown.jpg',
        developer: 'Emaar Properties',
        paymentPlan: '10% Down Payment, 90% on Completion',
        roi: '7.2% Annual ROI'
      },
      {
        title: 'Penthouse in Palm Jumeirah',
        description: 'Exclusive penthouse on the prestigious Palm Jumeirah. This 5-bedroom property offers unobstructed sea views, private beach access, and luxury amenities including a private elevator.',
        price: '15,000,000 AED',
        location: 'Palm Jumeirah, Dubai',
        type: 'exclusive',
        bedrooms: 5,
        bathrooms: 6,
        area: '6,000 sq ft',
        features: ['Sea View', 'Private Beach', 'Private Elevator', 'Maid Room', 'Jacuzzi'],
        status: 'available',
        image: '/uploads/properties/penthouse-palm.jpg',
        developer: 'Nakheel',
        paymentPlan: '25% Down Payment, 75% on Completion',
        roi: '9.1% Annual ROI'
      },
      {
        title: 'Townhouse in Arabian Ranches',
        description: 'Family-friendly 3-bedroom townhouse in the gated community of Arabian Ranches. Features a private garden, community pool, golf course access, and excellent schools nearby.',
        price: '3,200,000 AED',
        location: 'Arabian Ranches, Dubai',
        type: 'off-plan',
        bedrooms: 3,
        bathrooms: 4,
        area: '2,200 sq ft',
        features: ['Private Garden', 'Golf Course', 'Community Pool', 'School Access', 'Pet Friendly'],
        status: 'available',
        image: '/uploads/properties/townhouse-ranches.jpg',
        developer: 'Emaar Properties',
        completionDate: new Date('2025-12-31'),
        paymentPlan: '5% Down Payment, 95% During Construction',
        roi: '6.8% Annual ROI'
      },
      {
        title: 'Studio Apartment in JBR',
        description: 'Compact and modern studio apartment in Jumeirah Beach Residence. Perfect for young professionals or investors. Walking distance to the beach, restaurants, and nightlife.',
        price: '950,000 AED',
        location: 'JBR, Dubai',
        type: 'exclusive',
        bedrooms: 0,
        bathrooms: 1,
        area: '500 sq ft',
        features: ['Beach Access', 'Furnished', 'Balcony', 'Gym', 'Metro Access'],
        status: 'available',
        image: '/uploads/properties/studio-jbr.jpg',
        developer: 'Dubai Properties',
        paymentPlan: '15% Down Payment, 85% on Completion',
        roi: '8.9% Annual ROI'
      },
      {
        title: 'Off-Plan Villa in Mohammed Bin Rashid City',
        description: 'Premium off-plan villa in the prestigious Mohammed Bin Rashid City. Features modern architecture, smart home technology, and access to world-class amenities including Crystal Lagoon.',
        price: '5,500,000 AED',
        location: 'Mohammed Bin Rashid City, Dubai',
        type: 'off-plan',
        bedrooms: 4,
        bathrooms: 5,
        area: '3,800 sq ft',
        features: ['Smart Home', 'Crystal Lagoon Access', 'Private Garden', 'Maid Room', 'Study Room'],
        status: 'available',
        image: '/uploads/properties/villa-mbr.jpg',
        developer: 'Sobha Realty',
        completionDate: new Date('2026-06-30'),
        paymentPlan: '10% Down Payment, 90% During Construction',
        roi: '7.5% Annual ROI'
      }
    ]

    // Insert sample properties
    const createdProperties = await Property.insertMany(sampleProperties)
    
    console.log('✅ Sample properties created successfully!')
    console.log(`Created ${createdProperties.length} properties`)
    
    // Display created properties
    createdProperties.forEach((property, index) => {
      console.log(`${index + 1}. ${property.title} - AED ${property.price.toLocaleString()}`)
    })
    
  } catch (error) {
    console.error('❌ Error creating sample properties:', error.message)
  } finally {
    mongoose.connection.close()
  }
}

// Run the seed function
seedProperties()