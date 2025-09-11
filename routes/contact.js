import express from 'express'
import mongoose from 'mongoose'
import Contact from '../models/Contact.js'

const router = express.Router()

// In-memory storage for contact submissions (fallback when database is not connected)
let contactSubmissions = []
let submissionIdCounter = 1

// POST /api/contact - Submit contact form
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
      propertyId,
      inquiryType = 'general'
    } = req.body

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Name, email, and message are required fields'
      })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      })
    }

    console.log('Processing contact form submission:', { name, email, subject })

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, using in-memory storage')
      // Create submission object for in-memory storage
      const submission = {
        id: submissionIdCounter++,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        subject: subject ? subject.trim() : 'General Inquiry',
        message: message.trim(),
        propertyId: propertyId ? parseInt(propertyId) : null,
        inquiryType,
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Store submission in memory
      contactSubmissions.push(submission)

      return res.status(201).json({
        success: true,
        message: 'Thank you for your inquiry! We will get back to you soon.',
        data: {
          id: submission.id,
          status: submission.status,
          createdAt: submission.createdAt
        }
      })
    }

    // Create and save contact to database
    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      subject: subject ? subject.trim() : 'General Inquiry',
      message: message.trim(),
      propertyId: propertyId || null,
      inquiryType,
      status: 'new'
    })

    await contact.save()
    console.log('Contact saved to database with ID:', contact._id)

    res.status(201).json({
      success: true,
      message: 'Thank you for your inquiry! We will get back to you soon.',
      data: {
        id: contact._id,
        status: contact.status,
        createdAt: contact.createdAt
      }
    })
  } catch (error) {
    console.error('Error submitting contact form:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to submit contact form',
      message: error.message
    })
  }
})

// GET /api/contact - Get all contact submissions (admin only)
router.get('/', async (req, res) => {
  try {
    const {
      status,
      inquiryType,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, using in-memory storage for contacts')
      let filteredSubmissions = [...contactSubmissions]
      
      // Continue with in-memory filtering...
      return res.json({
        success: true,
        data: filteredSubmissions,
        pagination: {
          total: filteredSubmissions.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(filteredSubmissions.length / parseInt(limit))
        }
      })
    }
    
    // Database query
    const query = {}
    if (status) query.status = status
    if (inquiryType) query.inquiryType = inquiryType
    
    // Count total documents for pagination
    const total = await Contact.countDocuments(query)
    
    // Create sort object
    const sort = {}
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1
    
    // Fetch contacts from database with pagination
    const contacts = await Contact.find(query)
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
    
    return res.json({
      success: true,
      data: contacts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contacts',
      message: error.message
    })
  }
})

    // This code is now handled in the database query section above
    // This code is now handled in the database query section above

// GET /api/contact/:id - Get single contact submission by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, using in-memory storage')
      const submission = contactSubmissions.find(s => s.id === parseInt(id))

      if (!submission) {
        return res.status(404).json({
          success: false,
          error: 'Contact submission not found',
          message: `Submission with ID ${id} does not exist`
        })
      }

      return res.json({
        success: true,
        data: submission
      })
    }
    
    // Find contact in database
    const contact = await Contact.findById(id)
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact submission not found',
        message: `Submission with ID ${id} does not exist`
      })
    }

    res.json({
      success: true,
      data: contact
    })
  } catch (error) {
    console.error('Error fetching contact:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contact submission',
      message: error.message
    })
  }
})

// PUT /api/contact/:id - Update contact submission
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, phone, subject, message, status } = req.body

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, using in-memory storage')
      const submissionIndex = contactSubmissions.findIndex(s => s.id === parseInt(id))
      if (submissionIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Contact submission not found',
          message: `Submission with ID ${id} does not exist`
        })
      }

      // Update contact fields
      if (name) contactSubmissions[submissionIndex].name = name.trim()
      if (email) contactSubmissions[submissionIndex].email = email.trim().toLowerCase()
      if (phone !== undefined) contactSubmissions[submissionIndex].phone = phone ? phone.trim() : null
      if (subject) contactSubmissions[submissionIndex].subject = subject.trim()
      if (message) contactSubmissions[submissionIndex].message = message.trim()
      if (status) contactSubmissions[submissionIndex].status = status
      
      contactSubmissions[submissionIndex].updatedAt = new Date().toISOString()

      return res.json({
        success: true,
        message: 'Contact updated successfully',
        data: contactSubmissions[submissionIndex]
      })
    }
    
    // Find and update contact in database
    const contact = await Contact.findById(id)
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact submission not found',
        message: `Submission with ID ${id} does not exist`
      })
    }
    
    // Update contact fields
    if (name) contact.name = name.trim()
    if (email) contact.email = email.trim().toLowerCase()
    if (phone !== undefined) contact.phone = phone ? phone.trim() : null
    if (subject) contact.subject = subject.trim()
    if (message) contact.message = message.trim()
    if (status) contact.status = status
    
    await contact.save()
    console.log('Contact updated in database with ID:', contact._id)

    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    })
  } catch (error) {
    console.error('Error updating contact:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update contact',
      message: error.message
    })
  }
})

// PUT /api/contact/:id/status - Update contact submission status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status, isEdited } = req.body

    const validStatuses = ['new', 'contacted', 'resolved']
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      })
    }

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, using in-memory storage')
      const submissionIndex = contactSubmissions.findIndex(s => s.id === parseInt(id))
      if (submissionIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Contact submission not found',
          message: `Submission with ID ${id} does not exist`
        })
      }

      contactSubmissions[submissionIndex].status = status
      contactSubmissions[submissionIndex].isEdited = isEdited || contactSubmissions[submissionIndex].isEdited || false
      contactSubmissions[submissionIndex].updatedAt = new Date().toISOString()

      return res.json({
        success: true,
        message: 'Status updated successfully',
        data: contactSubmissions[submissionIndex]
      })
    }
    
    // Find and update contact in database
    const contact = await Contact.findById(id)
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact submission not found',
        message: `Submission with ID ${id} does not exist`
      })
    }
    
    contact.status = status
    contact.isEdited = isEdited || contact.isEdited || false
    await contact.save()
    console.log('Contact status updated in database with ID:', contact._id)

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: contact
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update status',
      message: error.message
    })
  }
})

// DELETE /api/contact/:id - Delete contact submission
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, using in-memory storage')
      const submissionIndex = contactSubmissions.findIndex(s => s.id === parseInt(id))

      if (submissionIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Contact submission not found',
          message: `Submission with ID ${id} does not exist`
        })
      }

      const deletedSubmission = contactSubmissions.splice(submissionIndex, 1)[0]

      return res.json({
        success: true,
        message: 'Contact submission deleted successfully',
        data: deletedSubmission
      })
    }
    
    // Find and delete contact in database
    const contact = await Contact.findById(id)
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact submission not found',
        message: `Submission with ID ${id} does not exist`
      })
    }
    
    await Contact.findByIdAndDelete(id)
    console.log('Contact deleted from database with ID:', id)

    res.json({
      success: true,
      message: 'Contact submission deleted successfully',
      data: contact
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete contact submission',
      message: error.message
    })
  }
})

// GET /api/contact/stats/summary - Get contact statistics
router.get('/stats/summary', async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, using in-memory storage')
      const stats = {
        total: contactSubmissions.length,
        byStatus: {
          new: contactSubmissions.filter(s => s.status === 'new').length,
          'in-progress': contactSubmissions.filter(s => s.status === 'in-progress').length,
          resolved: contactSubmissions.filter(s => s.status === 'resolved').length,
          closed: contactSubmissions.filter(s => s.status === 'closed').length
        },
        byInquiryType: {
          general: contactSubmissions.filter(s => s.inquiryType === 'general').length,
          property: contactSubmissions.filter(s => s.inquiryType === 'property').length,
          viewing: contactSubmissions.filter(s => s.inquiryType === 'viewing').length,
          investment: contactSubmissions.filter(s => s.inquiryType === 'investment').length
        },
        recent: contactSubmissions
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
      }

      return res.json({
        success: true,
        data: stats
      })
    }
    
    // Get stats from database
    const total = await Contact.countDocuments()
    
    // Get counts by status
    const byStatus = {
      new: await Contact.countDocuments({ status: 'new' }),
      'in-progress': await Contact.countDocuments({ status: 'in-progress' }),
      resolved: await Contact.countDocuments({ status: 'resolved' }),
      closed: await Contact.countDocuments({ status: 'closed' })
    }
    
    // Get counts by inquiry type
    const byInquiryType = {
      general: await Contact.countDocuments({ inquiryType: 'general' }),
      property: await Contact.countDocuments({ inquiryType: 'property' }),
      viewing: await Contact.countDocuments({ inquiryType: 'viewing' }),
      investment: await Contact.countDocuments({ inquiryType: 'investment' })
    }
    
    // Get recent contacts
    const recent = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
    
    const stats = {
      total,
      byStatus,
      byInquiryType,
      recent
    }

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contact statistics',
      message: error.message
    })
  }
})

export default router