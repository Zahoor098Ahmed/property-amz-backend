import express from 'express'

const router = express.Router()

// Sample properties data (in a real app, this would come from a database)
const properties = [
  {
    id: 1,
    title: 'Luxury Villa in Palm Jumeirah',
    description: 'Stunning 5-bedroom villa with private beach access and panoramic views of Dubai skyline. This exceptional property features modern architecture, premium finishes, and world-class amenities.',
    price: 15000000,
    priceFormatted: 'AED 15,000,000',
    bedrooms: 5,
    bathrooms: 6,
    area: 8500,
    areaFormatted: '8,500 sq ft',
    type: 'villa',
    status: 'available',
    location: 'Palm Jumeirah',
    coordinates: { lat: 25.1124, lng: 55.1390 },
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    features: ['Private Beach', 'Swimming Pool', 'Garden', 'Parking', 'Security', 'Maid Room'],
    yearBuilt: 2020,
    furnished: true,
    featured: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    title: 'Modern Apartment in Downtown',
    description: 'Contemporary 2-bedroom apartment in the heart of Downtown Dubai with stunning Burj Khalifa views. Premium building with luxury amenities and prime location.',
    price: 2500000,
    priceFormatted: 'AED 2,500,000',
    bedrooms: 2,
    bathrooms: 3,
    area: 1200,
    areaFormatted: '1,200 sq ft',
    type: 'apartment',
    status: 'available',
    location: 'Downtown Dubai',
    coordinates: { lat: 25.1972, lng: 55.2744 },
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    features: ['Burj Khalifa View', 'Gym', 'Pool', 'Concierge', 'Parking', 'Balcony'],
    yearBuilt: 2019,
    furnished: false,
    featured: true,
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z'
  },
  {
    id: 3,
    title: 'Penthouse in Marina',
    description: 'Exclusive 4-bedroom penthouse with 360-degree views of Dubai Marina and the Arabian Gulf. Features include private terrace, jacuzzi, and premium finishes throughout.',
    price: 8000000,
    priceFormatted: 'AED 8,000,000',
    bedrooms: 4,
    bathrooms: 5,
    area: 3500,
    areaFormatted: '3,500 sq ft',
    type: 'penthouse',
    status: 'available',
    location: 'Dubai Marina',
    coordinates: { lat: 25.0657, lng: 55.1713 },
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    features: ['Marina View', 'Private Terrace', 'Jacuzzi', 'Maid Room', 'Storage', 'Premium Finishes'],
    yearBuilt: 2021,
    furnished: true,
    featured: false,
    createdAt: '2024-01-08T09:15:00Z',
    updatedAt: '2024-01-08T09:15:00Z'
  },
  {
    id: 4,
    title: 'Townhouse in Arabian Ranches',
    description: 'Spacious 4-bedroom townhouse in the prestigious Arabian Ranches community. Family-friendly environment with golf course views and excellent amenities.',
    price: 4200000,
    priceFormatted: 'AED 4,200,000',
    bedrooms: 4,
    bathrooms: 5,
    area: 2800,
    areaFormatted: '2,800 sq ft',
    type: 'townhouse',
    status: 'available',
    location: 'Arabian Ranches',
    coordinates: { lat: 25.0657, lng: 55.2708 },
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    features: ['Golf Course View', 'Garden', 'Community Pool', 'Playground', 'Security', 'Parking'],
    yearBuilt: 2018,
    furnished: false,
    featured: false,
    createdAt: '2024-01-05T16:45:00Z',
    updatedAt: '2024-01-05T16:45:00Z'
  },
  {
    id: 5,
    title: 'Studio in Business Bay',
    description: 'Modern studio apartment in Business Bay with canal views. Perfect for young professionals or investors. High-quality finishes and excellent rental potential.',
    price: 850000,
    priceFormatted: 'AED 850,000',
    bedrooms: 0,
    bathrooms: 1,
    area: 450,
    areaFormatted: '450 sq ft',
    type: 'studio',
    status: 'available',
    location: 'Business Bay',
    coordinates: { lat: 25.1877, lng: 55.2633 },
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    features: ['Canal View', 'Gym', 'Pool', 'Metro Access', 'Balcony', 'Modern Kitchen'],
    yearBuilt: 2020,
    furnished: true,
    featured: false,
    createdAt: '2024-01-03T11:20:00Z',
    updatedAt: '2024-01-03T11:20:00Z'
  },
  {
    id: 6,
    title: 'Luxury Apartment in JBR',
    description: 'Beachfront 3-bedroom apartment in Jumeirah Beach Residence with direct beach access. Stunning sea views and resort-style living in the heart of Dubai.',
    price: 3800000,
    priceFormatted: 'AED 3,800,000',
    bedrooms: 3,
    bathrooms: 4,
    area: 1800,
    areaFormatted: '1,800 sq ft',
    type: 'apartment',
    status: 'available',
    location: 'JBR',
    coordinates: { lat: 25.0657, lng: 55.1390 },
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    features: ['Beach Access', 'Sea View', 'Resort Amenities', 'Restaurants', 'Shopping', 'Parking'],
    yearBuilt: 2017,
    furnished: false,
    featured: false,
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z'
  }
]

// GET /api/properties - Get all properties with filtering and pagination
router.get('/', (req, res) => {
  try {
    const {
      type,
      minPrice,
      maxPrice,
      bedrooms,
      location,
      featured,
      status = 'available',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    let filteredProperties = [...properties]

    // Apply filters
    if (type && type !== 'all') {
      filteredProperties = filteredProperties.filter(p => p.type === type)
    }

    if (minPrice) {
      filteredProperties = filteredProperties.filter(p => p.price >= parseInt(minPrice))
    }

    if (maxPrice) {
      filteredProperties = filteredProperties.filter(p => p.price <= parseInt(maxPrice))
    }

    if (bedrooms) {
      filteredProperties = filteredProperties.filter(p => p.bedrooms === parseInt(bedrooms))
    }

    if (location) {
      filteredProperties = filteredProperties.filter(p => 
        p.location.toLowerCase().includes(location.toLowerCase())
      )
    }

    if (featured === 'true') {
      filteredProperties = filteredProperties.filter(p => p.featured === true)
    }

    if (status) {
      filteredProperties = filteredProperties.filter(p => p.status === status)
    }

    // Apply sorting
    filteredProperties.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === 'price') {
        aValue = a.price
        bValue = b.price
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit)
    const endIndex = startIndex + parseInt(limit)
    const paginatedProperties = filteredProperties.slice(startIndex, endIndex)

    // Response
    res.json({
      success: true,
      data: paginatedProperties,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredProperties.length / parseInt(limit)),
        totalItems: filteredProperties.length,
        itemsPerPage: parseInt(limit),
        hasNextPage: endIndex < filteredProperties.length,
        hasPrevPage: startIndex > 0
      },
      filters: {
        type,
        minPrice,
        maxPrice,
        bedrooms,
        location,
        featured,
        status
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch properties',
      message: error.message
    })
  }
})

// GET /api/properties/:id - Get single property by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    const property = properties.find(p => p.id === parseInt(id))

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
        message: `Property with ID ${id} does not exist`
      })
    }

    res.json({
      success: true,
      data: property
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch property',
      message: error.message
    })
  }
})

// GET /api/properties/featured - Get featured properties
router.get('/featured/list', (req, res) => {
  try {
    const featuredProperties = properties.filter(p => p.featured === true)
    
    res.json({
      success: true,
      data: featuredProperties,
      count: featuredProperties.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured properties',
      message: error.message
    })
  }
})

// GET /api/properties/search - Search properties
router.get('/search/query', (req, res) => {
  try {
    const { q } = req.query
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
        message: 'Please provide a search query parameter "q"'
      })
    }

    const searchResults = properties.filter(property => 
      property.title.toLowerCase().includes(q.toLowerCase()) ||
      property.description.toLowerCase().includes(q.toLowerCase()) ||
      property.location.toLowerCase().includes(q.toLowerCase()) ||
      property.type.toLowerCase().includes(q.toLowerCase())
    )

    res.json({
      success: true,
      data: searchResults,
      query: q,
      count: searchResults.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message
    })
  }
})

export default router