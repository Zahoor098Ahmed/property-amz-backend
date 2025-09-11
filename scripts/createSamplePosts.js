import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Admin from '../models/Admin.js'
import Post from '../models/Post.js'
import connectDB from '../config/database.js'

// Load environment variables
dotenv.config()

const createSamplePosts = async () => {
  try {
    // Connect to database
    await connectDB()

    // Find admin user
    const admin = await Admin.findOne({ email: process.env.ADMIN_EMAIL })
    
    if (!admin) {
      console.log('❌ Admin user not found. Please create admin first.')
      process.exit(1)
    }

    // Check if posts already exist
    const existingPosts = await Post.countDocuments()
    
    if (existingPosts > 0) {
      console.log('📝 Posts already exist in database!')
      console.log(`Total posts: ${existingPosts}`)
      process.exit(0)
    }

    // Sample posts data
    const samplePosts = [
      {
        title: 'Dubai Marina: The Ultimate Luxury Living Experience',
        content: `Dubai Marina stands as one of the world's most prestigious waterfront communities, offering an unparalleled luxury living experience. This man-made canal city stretches over 3 kilometers and is home to some of the tallest residential buildings in the world.

## Why Choose Dubai Marina?

### Prime Location
Strategically located between Sheikh Zayed Road and the Arabian Gulf, Dubai Marina offers easy access to key business districts while providing a serene waterfront lifestyle.

### World-Class Amenities
- Private beaches and beach clubs
- Marina Walk with dining and shopping
- Yacht clubs and water sports facilities
- Premium fitness centers and spas

### Investment Potential
With its prime location and luxury amenities, Dubai Marina properties have shown consistent appreciation in value, making it an excellent investment choice for both local and international buyers.

### Lifestyle Benefits
- Stunning waterfront views
- Vibrant nightlife and dining scene
- Family-friendly environment
- Easy access to Dubai's major attractions`,
        excerpt: 'Discover why Dubai Marina is considered the ultimate destination for luxury waterfront living in Dubai.',
        category: 'property-guide',
        tags: ['Dubai Marina', 'Luxury Living', 'Waterfront', 'Investment'],
        status: 'published',
        featured: true,
        author: admin._id,
        featuredImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
        metaTitle: 'Dubai Marina Luxury Living - Premium Waterfront Properties',
        metaDescription: 'Explore luxury living in Dubai Marina with world-class amenities, stunning views, and excellent investment potential.'
      },
      {
        title: 'Real Estate Investment Guide: Dubai Property Market 2024',
        content: `The Dubai real estate market continues to show remarkable resilience and growth potential in 2024. With strategic government initiatives and world-class infrastructure development, Dubai remains a top choice for property investors worldwide.

## Market Overview

### Current Trends
- Steady price appreciation across prime locations
- Increased demand for luxury and ultra-luxury properties
- Growing interest from international investors
- Strong rental yields in key areas

### Key Investment Areas

#### Dubai Marina
- Average ROI: 6-8%
- High rental demand
- Excellent resale value

#### Downtown Dubai
- Premium location
- World-class amenities
- Strong capital appreciation

#### Dubai Hills Estate
- Family-friendly community
- Golf course views
- Modern infrastructure

### Investment Tips
1. Research the developer's track record
2. Consider location and accessibility
3. Evaluate rental potential
4. Understand payment plans
5. Factor in additional costs

### Future Outlook
With Expo 2020's legacy projects and Dubai's vision for 2071, the emirate continues to attract global investment, making it an ideal time to invest in Dubai real estate.`,
        excerpt: 'Complete guide to investing in Dubai real estate market in 2024 with expert insights and market analysis.',
        category: 'investment-tips',
        tags: ['Investment', 'Dubai Real Estate', 'Market Analysis', '2024'],
        status: 'published',
        featured: false,
        author: admin._id,
        featuredImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
        metaTitle: 'Dubai Real Estate Investment Guide 2024 - Market Insights',
        metaDescription: 'Expert guide to Dubai property investment in 2024 with market trends, ROI analysis, and investment tips.'
      },
      {
        title: 'Upcoming Mega Projects: The Future of Dubai Real Estate',
        content: `Dubai's ambitious vision for the future includes several mega projects that will reshape the emirate's real estate landscape. These developments promise to create new investment opportunities and redefine luxury living.

## Major Upcoming Projects

### Dubai Creek Harbour
- 6 square kilometers of waterfront development
- Dubai Creek Tower - set to be the world's tallest structure
- Mixed-use community with residential, commercial, and retail spaces
- Expected completion: 2025-2027

### Dubai South
- Master-planned city surrounding Al Maktoum International Airport
- Residential, commercial, and logistics hub
- Golf courses and recreational facilities
- Strategic location for business and leisure

### Mohammed Bin Rashid City
- One of the largest mixed-use developments in the region
- District One with luxury villas and mansions
- Meydan Racecourse and golf courses
- Crystal Lagoons and beach facilities

### Bluewaters Island
- Artificial island off JBR coast
- Ain Dubai - world's largest observation wheel
- Luxury residences and hospitality
- Entertainment and dining destinations

## Investment Implications

### Infrastructure Development
- New metro lines and transportation links
- Enhanced connectivity across Dubai
- Increased property values in surrounding areas

### Economic Impact
- Job creation and economic diversification
- Increased tourism and business activity
- Long-term appreciation potential

### Investment Opportunities
- Early bird pricing advantages
- Flexible payment plans
- High rental yield potential
- Capital appreciation prospects`,
        excerpt: 'Explore Dubai\'s upcoming mega projects and their impact on the real estate market and investment opportunities.',
        category: 'market-update',
        tags: ['Mega Projects', 'Future Development', 'Investment Opportunity', 'Dubai Vision'],
        status: 'published',
        featured: true,
        author: admin._id,
        featuredImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
        metaTitle: 'Dubai Mega Projects 2024 - Future Real Estate Opportunities',
        metaDescription: 'Discover Dubai\'s upcoming mega projects and their impact on real estate investment opportunities.'
      },
      {
        title: 'Luxury Villa Communities: Premium Living in Dubai',
        content: `Dubai offers some of the world's most exclusive villa communities, providing residents with privacy, luxury, and world-class amenities. These gated communities represent the pinnacle of luxury living in the emirate.

## Top Villa Communities

### Emirates Hills
- Often called the "Beverly Hills of Dubai"
- Exclusive gated community
- Golf course views
- Ultra-luxury villas and mansions
- 24/7 security and concierge services

### Palm Jumeirah
- Iconic man-made island
- Beachfront villas with private beaches
- Stunning views of Dubai skyline
- World-class resorts and amenities
- Excellent investment potential

### Dubai Hills Estate
- Master-planned community
- Championship golf course
- Family-friendly environment
- Modern infrastructure
- Central location with easy access

### Jumeirah Golf Estates
- Two championship golf courses
- Luxury villas with golf views
- Country club lifestyle
- Premium amenities and facilities
- Strong rental demand

## Investment Benefits

### Capital Appreciation
- Limited supply of luxury villas
- High demand from HNWIs
- Consistent price appreciation
- Strong resale value

### Rental Income
- High rental yields (5-7%)
- Strong demand from expatriate families
- Corporate housing opportunities
- Seasonal rental potential

### Lifestyle Benefits
- Privacy and exclusivity
- World-class amenities
- Family-friendly environment
- Prestigious address

## Buying Process
1. Property search and selection
2. Due diligence and inspection
3. Offer and negotiation
4. Legal documentation
5. Payment and transfer
6. Handover and registration`,
        excerpt: 'Discover Dubai\'s most exclusive villa communities offering luxury living and excellent investment potential.',
        category: 'property-guide',
        tags: ['Luxury Villas', 'Gated Communities', 'Premium Living', 'Investment'],
        status: 'published',
        featured: false,
        author: admin._id,
        featuredImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
        metaTitle: 'Luxury Villa Communities Dubai - Premium Gated Living',
        metaDescription: 'Explore Dubai\'s most exclusive villa communities with luxury amenities and excellent investment potential.'
      },
      {
        title: 'AMZ Properties Expands Portfolio with New Luxury Developments',
        content: `AMZ Properties is proud to announce the expansion of our portfolio with several new luxury developments across Dubai's most prestigious locations. These additions reinforce our commitment to providing clients with the finest real estate opportunities in the emirate.

## New Portfolio Additions

### Marina Vista Residences
- 40-story luxury tower in Dubai Marina
- 1, 2, and 3-bedroom apartments
- Panoramic marina and sea views
- Premium amenities and facilities
- Expected completion: Q4 2024

### Downtown Elite Suites
- Boutique development in Downtown Dubai
- Ultra-luxury 2 and 3-bedroom units
- Burj Khalifa and fountain views
- Exclusive amenities and services
- Limited units available

### Hills Garden Villas
- Exclusive villa community in Dubai Hills
- 4 and 5-bedroom luxury villas
- Golf course and park views
- Private gardens and pools
- Family-oriented community

## Why Choose AMZ Properties?

### Expertise and Experience
- Over 15 years in Dubai real estate
- Deep market knowledge
- Strong developer relationships
- Proven track record

### Comprehensive Services
- Property search and selection
- Investment advisory
- Legal and documentation support
- After-sales service
- Property management

### Client-Centric Approach
- Personalized service
- Transparent communication
- Competitive pricing
- Long-term relationships

## Investment Opportunities

### Early Bird Benefits
- Pre-launch pricing
- Flexible payment plans
- Prime unit selection
- Capital appreciation potential

### Financing Support
- Mortgage advisory
- Bank relationships
- Documentation assistance
- Competitive rates

## Contact Us
For more information about our new developments and investment opportunities, contact our expert team today. We're here to help you find the perfect property in Dubai.`,
        excerpt: 'AMZ Properties announces new luxury developments across Dubai with exclusive investment opportunities.',
        category: 'company-news',
        tags: ['AMZ Properties', 'New Developments', 'Luxury Properties', 'Investment'],
        status: 'published',
        featured: false,
        author: admin._id,
        featuredImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
        metaTitle: 'AMZ Properties New Luxury Developments - Investment Opportunities',
        metaDescription: 'Discover AMZ Properties\' new luxury developments across Dubai with exclusive investment opportunities.'
      },
      {
        title: 'Dubai Real Estate Market Analysis Q1 2024',
        content: `The first quarter of 2024 has shown promising trends in Dubai's real estate market, with continued growth in both residential and commercial sectors. This comprehensive analysis provides insights into market performance and future outlook.

## Q1 2024 Market Highlights

### Transaction Volume
- 15% increase in property transactions
- AED 45 billion in total transaction value
- Strong performance across all segments
- Increased investor confidence

### Price Trends
- Average price appreciation of 8%
- Luxury segment leading growth
- Stable rental yields
- Improved affordability in mid-market

### Popular Areas
1. Dubai Marina - High demand for apartments
2. Downtown Dubai - Premium segment growth
3. Dubai Hills Estate - Family villa demand
4. Business Bay - Commercial and residential mix
5. JVC - Affordable housing segment

## Sector Analysis

### Residential Market
- Apartments: 12% price increase
- Villas: 10% price appreciation
- Townhouses: 8% growth
- Strong rental demand across all types

### Commercial Market
- Office spaces: Stable pricing
- Retail: Recovery in prime locations
- Warehouses: High demand
- Co-working spaces: Growing trend

## Investment Insights

### Key Drivers
- Government initiatives and reforms
- Infrastructure development
- Tourism recovery
- Business-friendly policies
- Golden visa program impact

### Opportunities
- Off-plan developments
- Ready properties in prime locations
- Commercial real estate
- Short-term rental investments

### Challenges
- Supply management
- Market competition
- Economic uncertainties
- Regulatory changes

## Future Outlook

### Q2 2024 Predictions
- Continued price stability
- Increased transaction volume
- New project launches
- Enhanced market transparency

### Long-term Prospects
- Sustainable growth trajectory
- Diversified economy benefits
- Infrastructure improvements
- International investor interest

This analysis is based on official data and market research. For personalized investment advice, consult with our expert team.`,
        excerpt: 'Comprehensive analysis of Dubai real estate market performance in Q1 2024 with insights and predictions.',
        category: 'market-update',
        tags: ['Market Analysis', 'Q1 2024', 'Investment Insights', 'Dubai Real Estate'],
        status: 'draft',
        featured: false,
        author: admin._id,
        featuredImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800',
        metaTitle: 'Dubai Real Estate Market Analysis Q1 2024 - Performance Insights',
        metaDescription: 'Detailed analysis of Dubai real estate market performance in Q1 2024 with trends and investment insights.'
      }
    ]

    // Create posts
    const createdPosts = await Post.insertMany(samplePosts)
    
    console.log('✅ Sample posts created successfully!')
    console.log(`📝 Total posts created: ${createdPosts.length}`)
    console.log(`📊 Published posts: ${createdPosts.filter(p => p.status === 'published').length}`)
    console.log(`📝 Draft posts: ${createdPosts.filter(p => p.status === 'draft').length}`)
    console.log(`⭐ Featured posts: ${createdPosts.filter(p => p.featured).length}`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating sample posts:', error.message)
    process.exit(1)
  }
}

createSamplePosts()