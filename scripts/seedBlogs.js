import mongoose from 'mongoose'
import Blog from '../models/Blog.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Static blog data from frontend
const staticBlogPosts = [
  {
    id: 1,
    title: 'Dubai Real Estate Market Trends 2024',
    excerpt: 'Discover the latest trends shaping Dubai\'s luxury property market and investment opportunities.',
    content: `
      <h2>The Dubai Real Estate Market in 2024</h2>
      <p>Dubai's real estate market continues to show remarkable resilience and growth in 2024. With new developments, innovative financing options, and a growing international investor base, the market presents numerous opportunities for both local and international buyers.</p>
      
      <h3>Key Market Trends</h3>
      <ul>
        <li><strong>Sustainable Development:</strong> Green building initiatives and eco-friendly properties are becoming increasingly popular.</li>
        <li><strong>Smart Homes:</strong> Integration of IoT and smart home technologies in luxury developments.</li>
        <li><strong>Off-Plan Investments:</strong> Continued strong demand for off-plan properties with attractive payment plans.</li>
        <li><strong>International Investment:</strong> Growing interest from European and Asian investors.</li>
      </ul>
      
      <h3>Investment Opportunities</h3>
      <p>The current market conditions present excellent opportunities for investors looking to enter the Dubai real estate market. With competitive pricing and flexible payment plans, now is an ideal time to invest in Dubai's growing property sector.</p>
    `,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=400&fit=crop',
    category: 'Market Trends',
    status: 'published',
    featured: true,
    tags: ['Dubai', 'Real Estate', 'Investment', 'Market Trends', '2024'],
    author: {
      name: 'Market Analysis Team',
      email: 'market@amzproperties.com'
    }
  },
  {
    id: 2,
    title: 'Investment Guide: Off-Plan Properties in Dubai',
    excerpt: 'A comprehensive guide to investing in off-plan properties in Dubai, including benefits, risks, and key considerations.',
    content: `
      <h2>Understanding Off-Plan Property Investment</h2>
      <p>Off-plan property investment involves purchasing a property before it's completed, often during the construction phase. This investment strategy has become increasingly popular in Dubai due to attractive payment plans and potential for capital appreciation.</p>
      
      <h3>Benefits of Off-Plan Investment</h3>
      <ul>
        <li><strong>Lower Initial Investment:</strong> Typically requires only 10-20% down payment</li>
        <li><strong>Flexible Payment Plans:</strong> Spread payments over construction period</li>
        <li><strong>Capital Appreciation:</strong> Potential for property value increase upon completion</li>
        <li><strong>Modern Amenities:</strong> Latest designs and smart home features</li>
      </ul>
      
      <h3>Key Considerations</h3>
      <ul>
        <li>Developer reputation and track record</li>
        <li>Location and future development plans</li>
        <li>Payment schedule and terms</li>
        <li>Expected completion date</li>
        <li>Market conditions and trends</li>
      </ul>
      
      <h3>Top Off-Plan Projects in Dubai</h3>
      <p>Some of the most promising off-plan projects currently available include developments in Dubai Creek Harbour, Downtown Dubai, and Dubai South. These areas offer excellent connectivity, world-class amenities, and strong potential for capital appreciation.</p>
    `,
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=400&fit=crop',
    category: 'Investment Guide',
    status: 'published',
    featured: false,
    tags: ['Off-Plan', 'Investment', 'Dubai', 'Property Guide'],
    author: {
      name: 'Investment Team',
      email: 'investment@amzproperties.com'
    }
  },
  {
    id: 3,
    title: 'Luxury Living: Premium Amenities in Dubai Properties',
    excerpt: 'Explore the world-class amenities and lifestyle features that make Dubai properties stand out in the global luxury market.',
    content: `
      <h2>The Luxury Lifestyle in Dubai</h2>
      <p>Dubai has established itself as a global hub for luxury living, offering residents an unparalleled lifestyle with world-class amenities and services. From private beaches to rooftop infinity pools, Dubai's luxury properties redefine modern living.</p>
      
      <h3>Premium Amenities</h3>
      <ul>
        <li><strong>Private Beach Access:</strong> Exclusive beachfront locations with pristine sandy beaches</li>
        <li><strong>Infinity Pools:</strong> Rooftop and ground-level pools with stunning city views</li>
        <li><strong>Spa and Wellness Centers:</strong> Full-service spas with massage therapy and wellness programs</li>
        <li><strong>Fitness Centers:</strong> State-of-the-art gyms with personal training services</li>
        <li><strong>Concierge Services:</strong> 24/7 concierge for all resident needs</li>
      </ul>
      
      <h3>Smart Home Technology</h3>
      <p>Modern Dubai properties feature cutting-edge smart home technology, including automated lighting, climate control, security systems, and entertainment centers, all controllable through mobile apps.</p>
      
      <h3>Community Features</h3>
      <p>Luxury developments in Dubai often include parks, playgrounds, retail outlets, restaurants, and community centers, creating self-contained neighborhoods that offer everything residents need within walking distance.</p>
    `,
    image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=400&fit=crop',
    category: 'Lifestyle',
    status: 'published',
    featured: false,
    tags: ['Luxury', 'Amenities', 'Dubai', 'Lifestyle', 'Premium'],
    author: {
      name: 'Lifestyle Team',
      email: 'lifestyle@amzproperties.com'
    }
  }
]

const seedBlogs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/amz-properties')
    console.log('Connected to MongoDB')

    // Clear existing blogs
    await Blog.deleteMany({})
    console.log('Cleared existing blogs')

    // Insert static blog data
    for (const blogData of staticBlogPosts) {
      const { id, ...blogWithoutId } = blogData // Remove the id field
      
      // Generate slug from title
      blogWithoutId.slug = blogWithoutId.title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-')
      
      // Set published date for published blogs
      if (blogWithoutId.status === 'published') {
        blogWithoutId.publishedAt = new Date()
      }
      
      const blog = new Blog(blogWithoutId)
      await blog.save()
      console.log(`Saved blog: ${blog.title}`)
    }

    console.log('All blogs seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding blogs:', error)
    process.exit(1)
  }
}

seedBlogs()