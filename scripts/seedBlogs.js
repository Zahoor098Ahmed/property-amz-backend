import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Blog from '../models/Blog.js'
import Admin from '../models/Admin.js'
import connectDB from '../config/database.js'

// Load environment variables
dotenv.config()

const seedBlogs = async () => {
  try {
    // Connect to database
    await connectDB()

    // Check if blogs already exist
    const existingBlogs = await Blog.countDocuments()
    
    if (existingBlogs > 0) {
      console.log('📝 Blogs already exist in database!')
      console.log(`Total blogs: ${existingBlogs}`)
      process.exit(0)
    }

    // Get admin user for author reference
    let admin = await Admin.findOne()
    if (!admin) {
      console.log('Creating admin user for blog authorship...')
      admin = new Admin({
        name: 'Admin User',
        email: 'admin@amzproperties.com',
        password: 'admin123',
        role: 'admin'
      })
      await admin.save()
    }

    // Sample blogs data
    const sampleBlogs = [
      {
        title: 'Dubai Real Estate Market Trends 2024',
        slug: 'dubai-real-estate-market-trends-2024',
        excerpt: 'Discover the latest trends shaping Dubai\'s real estate market in 2024, including price movements, popular areas, and investment opportunities.',
        content: `<h2>Dubai Real Estate Market Overview</h2>
        <p>Dubai's real estate market continues to show remarkable resilience and growth in 2024. With new developments, government initiatives, and increasing foreign investment, the market presents numerous opportunities for both investors and homebuyers.</p>
        
        <h3>Key Market Trends</h3>
        <ul>
          <li><strong>Price Appreciation:</strong> Property values have increased by 15-20% year-over-year</li>
          <li><strong>High Demand Areas:</strong> Dubai Marina, Downtown Dubai, and Palm Jumeirah remain top choices</li>
          <li><strong>Off-Plan Properties:</strong> Strong investor interest in upcoming developments</li>
          <li><strong>Luxury Segment:</strong> Ultra-luxury properties showing exceptional performance</li>
        </ul>
        
        <h3>Investment Opportunities</h3>
        <p>The current market conditions present excellent opportunities for investors looking to capitalize on Dubai's growing real estate sector. With attractive payment plans and high rental yields, now is an ideal time to invest.</p>`,
        category: 'Market Trends',
        tags: ['Dubai', 'Real Estate', 'Investment', 'Market Analysis'],
        status: 'published',
        featured: true,
        image: '/uploads/blogs/dubai-market-trends.jpg',
        author: admin._id,
        views: 1250,
        likes: 89,
        metaTitle: 'Dubai Real Estate Market Trends 2024 | AMZ Properties',
        metaDescription: 'Stay updated with the latest Dubai real estate market trends, price movements, and investment opportunities in 2024.',
        keywords: 'Dubai real estate, market trends, property investment, Dubai property prices',
        publishedAt: new Date('2024-01-15')
      },
      {
        title: 'Complete Guide to Property Investment in UAE',
        slug: 'complete-guide-property-investment-uae',
        excerpt: 'A comprehensive guide covering everything you need to know about investing in UAE real estate, from legal requirements to financing options.',
        content: `<h2>Why Invest in UAE Real Estate?</h2>
        <p>The UAE offers one of the most attractive real estate investment environments globally, with tax-free income, high rental yields, and a stable political climate.</p>
        
        <h3>Legal Requirements for Foreign Investors</h3>
        <ul>
          <li>Freehold ownership available in designated areas</li>
          <li>No restrictions on property resale</li>
          <li>Investor visa eligibility for property owners</li>
          <li>Transparent legal framework</li>
        </ul>
        
        <h3>Financing Options</h3>
        <p>Various financing options are available for both residents and non-residents, with competitive interest rates and flexible payment terms.</p>
        
        <h3>Best Areas for Investment</h3>
        <p>Popular investment areas include Dubai Marina, Business Bay, Downtown Dubai, and emerging areas like Dubai South and Mohammed Bin Rashid City.</p>`,
        category: 'Investment Guide',
        tags: ['UAE', 'Property Investment', 'Real Estate Guide', 'Foreign Investment'],
        status: 'published',
        featured: true,
        image: '/uploads/blogs/uae-investment-guide.jpg',
        author: admin._id,
        views: 2100,
        likes: 156,
        metaTitle: 'UAE Property Investment Guide 2024 | AMZ Properties',
        metaDescription: 'Complete guide to property investment in UAE covering legal requirements, financing options, and best investment areas.',
        keywords: 'UAE property investment, Dubai real estate, foreign investment, property guide',
        publishedAt: new Date('2024-02-01')
      },
      {
        title: 'Luxury Living: Premium Properties in Palm Jumeirah',
        slug: 'luxury-living-premium-properties-palm-jumeirah',
        excerpt: 'Explore the epitome of luxury living with premium properties in Palm Jumeirah, featuring exclusive amenities and breathtaking views.',
        content: `<h2>Palm Jumeirah: The Crown Jewel of Dubai</h2>
        <p>Palm Jumeirah stands as one of the world's most prestigious addresses, offering unparalleled luxury living with stunning sea views and world-class amenities.</p>
        
        <h3>Premium Property Features</h3>
        <ul>
          <li>Private beach access</li>
          <li>Panoramic sea and city views</li>
          <li>Luxury amenities and concierge services</li>
          <li>Exclusive community facilities</li>
          <li>High-end retail and dining options</li>
        </ul>
        
        <h3>Investment Potential</h3>
        <p>Properties in Palm Jumeirah have shown consistent appreciation and offer excellent rental yields, making them ideal for both lifestyle and investment purposes.</p>
        
        <h3>Lifestyle Benefits</h3>
        <p>Residents enjoy access to pristine beaches, luxury resorts, fine dining restaurants, and exclusive beach clubs, all within a secure and prestigious community.</p>`,
        category: 'Lifestyle',
        tags: ['Palm Jumeirah', 'Luxury Properties', 'Premium Living', 'Dubai Lifestyle'],
        status: 'published',
        featured: false,
        image: '/uploads/blogs/palm-jumeirah-luxury.jpg',
        author: admin._id,
        views: 890,
        likes: 67,
        metaTitle: 'Luxury Properties in Palm Jumeirah | AMZ Properties',
        metaDescription: 'Discover premium luxury properties in Palm Jumeirah offering exclusive amenities and breathtaking views.',
        keywords: 'Palm Jumeirah properties, luxury real estate, Dubai premium properties',
        publishedAt: new Date('2024-02-15')
      },
      {
        title: 'Smart Home Technology in Modern Dubai Properties',
        slug: 'smart-home-technology-modern-dubai-properties',
        excerpt: 'Discover how smart home technology is revolutionizing modern living in Dubai properties, from automated systems to energy efficiency.',
        content: `<h2>The Future of Living: Smart Homes in Dubai</h2>
        <p>Dubai's real estate market is embracing cutting-edge smart home technology, offering residents unprecedented convenience, security, and energy efficiency.</p>
        
        <h3>Key Smart Home Features</h3>
        <ul>
          <li>Automated lighting and climate control</li>
          <li>Smart security systems with facial recognition</li>
          <li>Voice-controlled home assistants</li>
          <li>Energy management systems</li>
          <li>Smart appliances and entertainment systems</li>
        </ul>
        
        <h3>Benefits for Residents</h3>
        <p>Smart home technology enhances comfort, security, and energy efficiency while increasing property value and appeal to tech-savvy buyers and tenants.</p>
        
        <h3>Popular Smart Home Developments</h3>
        <p>Leading developers in Dubai are incorporating smart home features in new projects, making technology-enabled living the new standard for premium properties.</p>`,
        category: 'Technology',
        tags: ['Smart Homes', 'Technology', 'Modern Living', 'Dubai Properties'],
        status: 'published',
        featured: false,
        image: '/uploads/blogs/smart-home-technology.jpg',
        author: admin._id,
        views: 1450,
        likes: 112,
        metaTitle: 'Smart Home Technology in Dubai Properties | AMZ Properties',
        metaDescription: 'Explore how smart home technology is transforming modern living in Dubai properties with automated systems and energy efficiency.',
        keywords: 'smart homes Dubai, property technology, automated homes, modern living',
        publishedAt: new Date('2024-03-01')
      }
    ]

    // Insert sample blogs
    const createdBlogs = await Blog.insertMany(sampleBlogs)
    
    console.log('✅ Sample blogs created successfully!')
    console.log(`Created ${createdBlogs.length} blogs`)
    
    // Display created blogs
    createdBlogs.forEach((blog, index) => {
      console.log(`${index + 1}. ${blog.title} - ${blog.category}`)
    })
    
  } catch (error) {
    console.error('❌ Error creating sample blogs:', error.message)
  } finally {
    mongoose.connection.close()
  }
}

// Run the seed function
seedBlogs()