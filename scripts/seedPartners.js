import mongoose from 'mongoose'
import Partner from '../models/Partner.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Static partner data from frontend
const staticPartnerDevelopers = [
  {
    id: 1,
    name: 'Emaar Properties',
    logo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=400&fit=crop',
    description: 'Emaar Properties is a leading real estate development company in the UAE, known for creating iconic landmarks and communities.',
    about: 'Emaar Properties is a leading real estate development company in the UAE, known for creating iconic landmarks and communities that define modern living.',
    specialties: ['Luxury Residential', 'Commercial', 'Hospitality', 'Retail'],
    established: '1997',
    totalProjects: 50,
    completedProjects: 45,
    ongoingProjects: 5,
    projects: [
      {
        name: 'Burj Khalifa',
        location: 'Downtown Dubai',
        type: 'Mixed-Use',
        status: 'Completed',
        completionYear: '2010'
      },
      {
        name: 'Dubai Mall',
        location: 'Downtown Dubai',
        type: 'Retail',
        status: 'Completed', 
        completionYear: '2008'
      },
      {
        name: 'Downtown Dubai',
        location: 'Downtown Dubai',
        type: 'Mixed-Use',
        status: 'Completed',
        completionYear: '2014'
      }
    ],
    awards: [
      'Best Developer - Middle East 2023',
      'Excellence in Real Estate Development 2022',
      'Sustainable Development Award 2021'
    ],
    contact: {
      phone: '+971 4 367 3333',
      email: 'info@emaar.ae',
      website: 'https://www.emaar.com'
    }
  },
  {
    id: 2,
    name: 'DAMAC Properties',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop',
    description: 'DAMAC Properties is a luxury real estate developer known for creating premium residential and commercial properties.',
    about: 'DAMAC Properties is a luxury real estate developer known for creating premium residential and commercial properties with world-class amenities.',
    specialties: ['Luxury Villas', 'High-end Apartments', 'Golf Communities', 'Branded Residences'],
    established: '2002',
    totalProjects: 35,
    completedProjects: 30,
    ongoingProjects: 5,
    projects: [
      {
        name: 'DAMAC Hills',
        location: 'Dubailand',
        type: 'Residential',
        status: 'Completed',
        completionYear: '2017'
      },
      {
        name: 'DAMAC Towers by Paramount',
        location: 'Business Bay',
        type: 'Residential',
        status: 'Completed',
        completionYear: '2016'
      },
      {
        name: 'Akoya Oxygen',
        location: 'Dubailand',
        type: 'Residential',
        status: 'Ongoing',
        completionYear: '2025'
      }
    ],
    awards: [
      'Best Luxury Developer 2023',
      'Innovation in Design Award 2022',
      'Customer Excellence Award 2021'
    ],
    contact: {
      phone: '+971 4 420 0000',
      email: 'info@damacproperties.com',
      website: 'https://www.damacproperties.com'
    }
  },
  {
    id: 3,
    name: 'Sobha Realty',
    logo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=400&fit=crop',
    description: 'Sobha Realty is renowned for its commitment to quality and craftsmanship in luxury real estate development.',
    about: 'Sobha Realty is renowned for its commitment to quality and craftsmanship in luxury real estate development, creating exceptional living experiences.',
    specialties: ['Premium Apartments', 'Luxury Villas', 'Waterfront Properties', 'Golf Communities'],
    established: '2014',
    totalProjects: 25,
    completedProjects: 15,
    ongoingProjects: 10,
    projects: [
      {
        name: 'Sobha Hartland',
        location: 'Mohammed Bin Rashid City',
        type: 'Residential',
        status: 'Ongoing',
        completionYear: '2025'
      },
      {
        name: 'Sobha Creek Vistas',
        location: 'Sobha Hartland',
        type: 'Residential',
        status: 'Completed',
        completionYear: '2020'
      },
      {
        name: 'Sobha Reserve',
        location: 'Wadi Al Safa 2',
        type: 'Residential',
        status: 'Ongoing',
        completionYear: '2026'
      }
    ],
    awards: [
      'Quality Excellence Award 2023',
      'Best Waterfront Development 2022',
      'Craftsmanship Award 2021'
    ],
    contact: {
      phone: '+971 4 440 1111',
      email: 'info@sobharealty.com',
      website: 'https://www.sobharealty.com'
    }
  }
]

const seedPartners = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/amz-properties')
    console.log('Connected to MongoDB')

    // Clear existing partners
    await Partner.deleteMany({})
    console.log('Cleared existing partners')

    // Insert static partner data
    for (const partnerData of staticPartnerDevelopers) {
      const { id, ...partnerWithoutId } = partnerData // Remove the id field
      
      // Generate slug from name
      partnerWithoutId.slug = partnerWithoutId.name
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-')
      
      const partner = new Partner(partnerWithoutId)
      await partner.save()
      console.log(`Saved partner: ${partner.name}`)
    }

    console.log('All partners seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding partners:', error)
    process.exit(1)
  }
}

seedPartners()