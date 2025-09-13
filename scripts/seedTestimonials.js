import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Testimonial from '../models/Testimonial.js'
import Property from '../models/Property.js'
import connectDB from '../config/database.js'

// Load environment variables
dotenv.config()

const seedTestimonials = async () => {
  try {
    // Connect to database
    await connectDB()

    // Check if testimonials already exist
    const existingTestimonials = await Testimonial.countDocuments()
    
    if (existingTestimonials > 0) {
      console.log('💬 Testimonials already exist in database!')
      console.log(`Total testimonials: ${existingTestimonials}`)
      process.exit(0)
    }

    // Get some properties for reference
    const properties = await Property.find().limit(3)

    // Sample testimonials data
    const sampleTestimonials = [
      {
        name: 'Ahmed Al Mansouri',
        position: 'CEO',
        company: 'Al Mansouri Trading LLC',
        content: 'AMZ Properties helped me find the perfect villa in Dubai Marina. Their professional service and deep market knowledge made the entire process smooth and stress-free. I highly recommend them for anyone looking to invest in Dubai real estate.',
        rating: 5,
        image: '/uploads/testimonials/ahmed-al-mansouri.jpg',
        status: 'active',
        featured: true,
        propertyId: properties[0]?._id,
        location: 'Dubai Marina',
        purchaseDate: new Date('2024-01-15')
      },
      {
        name: 'Sarah Johnson',
        position: 'Investment Manager',
        company: 'Global Investments Group',
        content: 'As an international investor, I was impressed by AMZ Properties\' transparency and expertise. They guided me through every step of purchasing my apartment in Downtown Dubai. The ROI has exceeded my expectations!',
        rating: 5,
        image: '/uploads/testimonials/sarah-johnson.jpg',
        status: 'active',
        featured: true,
        propertyId: properties[1]?._id,
        location: 'Downtown Dubai',
        purchaseDate: new Date('2024-02-20')
      },
      {
        name: 'Mohammed Hassan',
        position: 'Business Owner',
        company: 'Hassan Enterprises',
        content: 'Excellent service from start to finish! The team at AMZ Properties understood exactly what I was looking for and found me a beautiful townhouse in Arabian Ranches. Their after-sales support has been outstanding.',
        rating: 5,
        image: '/uploads/testimonials/mohammed-hassan.jpg',
        status: 'active',
        featured: false,
        propertyId: properties[2]?._id,
        location: 'Arabian Ranches',
        purchaseDate: new Date('2024-03-10')
      },
      {
        name: 'Elena Rodriguez',
        position: 'Marketing Director',
        company: 'Rodriguez Marketing Solutions',
        content: 'AMZ Properties made my dream of owning a property in Dubai come true. Their team was incredibly patient, answering all my questions and helping me navigate the buying process as a first-time buyer in the UAE.',
        rating: 5,
        image: '/uploads/testimonials/elena-rodriguez.jpg',
        status: 'active',
        featured: false,
        location: 'JBR',
        purchaseDate: new Date('2024-02-28')
      },
      {
        name: 'Rajesh Patel',
        position: 'IT Consultant',
        company: 'TechSolutions Dubai',
        content: 'Professional, reliable, and trustworthy - that\'s how I would describe AMZ Properties. They helped me secure an excellent off-plan property with a great payment plan. I\'m already seeing great returns on my investment.',
        rating: 5,
        image: '/uploads/testimonials/rajesh-patel.jpg',
        status: 'active',
        featured: true,
        location: 'Mohammed Bin Rashid City',
        purchaseDate: new Date('2024-01-25')
      },
      {
        name: 'Fatima Al Zahra',
        position: 'Architect',
        company: 'Al Zahra Design Studio',
        content: 'The expertise and dedication of the AMZ Properties team is unmatched. They not only found me the perfect penthouse but also provided valuable insights about the market trends and future developments in the area.',
        rating: 5,
        image: '/uploads/testimonials/fatima-al-zahra.jpg',
        status: 'active',
        featured: false,
        location: 'Palm Jumeirah',
        purchaseDate: new Date('2024-03-05')
      }
    ]

    // Insert sample testimonials
    const createdTestimonials = await Testimonial.insertMany(sampleTestimonials)
    
    console.log('✅ Sample testimonials created successfully!')
    console.log(`Created ${createdTestimonials.length} testimonials`)
    
    // Display created testimonials
    createdTestimonials.forEach((testimonial, index) => {
      console.log(`${index + 1}. ${testimonial.name} - ${testimonial.company} (${testimonial.rating} stars)`)
    })
    
  } catch (error) {
    console.error('❌ Error creating sample testimonials:', error.message)
  } finally {
    mongoose.connection.close()
  }
}

// Run the seed function
seedTestimonials()