import express from 'express'

const router = express.Router()

// In-memory storage for contact submissions (in a real app, this would be a database)
let contactSubmissions = []
let submissionIdCounter = 1

// POST /api/contact - Submit contact form
router.post('/', (req, res) => {
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

    // Create submission object
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

    // Store submission
    contactSubmissions.push(submission)

    // In a real application, you would:
    // 1. Save to database
    // 2. Send email notification to admin
    // 3. Send confirmation email to user
    // 4. Integrate with CRM system

    res.status(201).json({
      success: true,
      message: 'Thank you for your inquiry! We will get back to you soon.',
      data: {
        id: submission.id,
        status: submission.status,
        createdAt: submission.createdAt
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to submit contact form',
      message: error.message
    })
  }
})

// GET /api/contact - Get all contact submissions (admin only)
router.get('/', (req, res) => {
  try {
    const {
      status,
      inquiryType,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    let filteredSubmissions = [...contactSubmissions]

    // Apply filters
    if (status) {
      filteredSubmissions = filteredSubmissions.filter(s => s.status === status)
    }

    if (inquiryType) {
      filteredSubmissions = filteredSubmissions.filter(s => s.inquiryType === inquiryType)
    }

    // Apply sorting
    filteredSubmissions.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit)
    const endIndex = startIndex + parseInt(limit)
    const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex)

    res.json({
      success: true,
      data: paginatedSubmissions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredSubmissions.length / parseInt(limit)),
        totalItems: filteredSubmissions.length,
        itemsPerPage: parseInt(limit),
        hasNextPage: endIndex < filteredSubmissions.length,
        hasPrevPage: startIndex > 0
      },
      filters: {
        status,
        inquiryType
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contact submissions',
      message: error.message
    })
  }
})

// GET /api/contact/:id - Get single contact submission by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    const submission = contactSubmissions.find(s => s.id === parseInt(id))

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Contact submission not found',
        message: `Submission with ID ${id} does not exist`
      })
    }

    res.json({
      success: true,
      data: submission
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contact submission',
      message: error.message
    })
  }
})

// PUT /api/contact/:id/status - Update contact submission status
router.put('/:id/status', (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['new', 'in-progress', 'resolved', 'closed']
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      })
    }

    const submissionIndex = contactSubmissions.findIndex(s => s.id === parseInt(id))
    if (submissionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Contact submission not found',
        message: `Submission with ID ${id} does not exist`
      })
    }

    contactSubmissions[submissionIndex].status = status
    contactSubmissions[submissionIndex].updatedAt = new Date().toISOString()

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: contactSubmissions[submissionIndex]
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
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params
    const submissionIndex = contactSubmissions.findIndex(s => s.id === parseInt(id))

    if (submissionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Contact submission not found',
        message: `Submission with ID ${id} does not exist`
      })
    }

    const deletedSubmission = contactSubmissions.splice(submissionIndex, 1)[0]

    res.json({
      success: true,
      message: 'Contact submission deleted successfully',
      data: deletedSubmission
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
router.get('/stats/summary', (req, res) => {
  try {
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