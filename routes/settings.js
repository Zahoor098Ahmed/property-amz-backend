import express from 'express'
import Settings from '../models/Settings.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// Get public settings
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne()
    
    if (!settings) {
      settings = new Settings()
      await settings.save()
    }

    // Return only public settings
    const publicSettings = {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      logo: settings.logo,
      favicon: settings.favicon,
      contactInfo: settings.contactInfo,
      socialMedia: settings.socialMedia,
      seo: settings.seo,
      appearance: settings.appearance,
      features: settings.features
    }

    res.json(publicSettings)
  } catch (error) {
    console.error('Get settings error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update settings (admin only)
router.put('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let settings = await Settings.findOne()
    
    if (!settings) {
      settings = new Settings()
    }

    // Handle nested objects properly
    const updateData = { ...req.body }
    
    // Merge nested objects
    if (updateData.contactInfo) {
      settings.contactInfo = { ...settings.contactInfo, ...updateData.contactInfo }
    }
    if (updateData.socialMedia) {
      settings.socialMedia = { ...settings.socialMedia, ...updateData.socialMedia }
    }
    if (updateData.seo) {
      settings.seo = { ...settings.seo, ...updateData.seo }
    }
    if (updateData.appearance) {
      settings.appearance = { ...settings.appearance, ...updateData.appearance }
    }
    if (updateData.features) {
      settings.features = { ...settings.features, ...updateData.features }
    }

    // Update other fields
    Object.keys(updateData).forEach(key => {
      if (!['contactInfo', 'socialMedia', 'seo', 'appearance', 'features'].includes(key)) {
        settings[key] = updateData[key]
      }
    })

    await settings.save()

    res.json({
      message: 'Settings updated successfully',
      settings
    })
  } catch (error) {
    console.error('Update settings error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update specific setting section
router.patch('/admin/:section', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let settings = await Settings.findOne()
    
    if (!settings) {
      settings = new Settings()
    }

    const { section } = req.params
    const validSections = ['contactInfo', 'socialMedia', 'seo', 'appearance', 'features']
    
    if (!validSections.includes(section)) {
      return res.status(400).json({ message: 'Invalid settings section' })
    }

    settings[section] = { ...settings[section], ...req.body }
    await settings.save()

    res.json({
      message: `${section} updated successfully`,
      [section]: settings[section]
    })
  } catch (error) {
    console.error('Update settings section error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Reset settings to default
router.post('/admin/reset', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await Settings.deleteMany({})
    const settings = new Settings()
    await settings.save()

    res.json({
      message: 'Settings reset to default successfully',
      settings
    })
  } catch (error) {
    console.error('Reset settings error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get admin settings (with all fields)
router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let settings = await Settings.findOne()
    
    if (!settings) {
      settings = new Settings()
      await settings.save()
    }

    res.json(settings)
  } catch (error) {
    console.error('Get admin settings error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router