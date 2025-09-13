import mongoose from 'mongoose'
import Contact from '../models/Contact.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

const sampleContacts = [
  {
    name: 'Ahmed Al Mansouri',
    email: 'ahmed.mansouri@gmail.com',
    phone: '+971 50 123 4567',
    subject: 'Property Investment Inquiry',
    message: 'I am interested in investing in luxury properties in Dubai Marina. Could you please provide me with more information about available options and expected ROI?',
    inquiryType: 'investment',
    status: 'new'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@outlook.com',
    phone: '+971 55 987 6543',
    subject: 'Villa Rental in Palm Jumeirah',
    message: 'Hello, I am looking for a 4-bedroom villa rental in Palm Jumeirah for my family. We need it for a minimum of 2 years. Please share available options.',
    inquiryType: 'rental',
    status: 'contacted'
  },
  {
    name: 'Mohammed Hassan',
    email: 'mohammed.hassan@yahoo.com',
    phone: '+971 52 456 7890',
    subject: 'Downtown Apartment Purchase',
    message: 'I want to buy a 2-bedroom apartment in Downtown Dubai. My budget is around 2.5 million AED. Can you help me find suitable properties?',
    inquiryType: 'property',
    status: 'new'
  },
  {
    name: 'Emily Chen',
    email: 'emily.chen@gmail.com',
    phone: '+971 56 234 5678',
    subject: 'General Property Consultation',
    message: 'I am new to Dubai and looking for guidance on property investment opportunities. Could we schedule a consultation meeting?',
    inquiryType: 'general',
    status: 'resolved'
  },
  {
    name: 'Rajesh Patel',
    email: 'rajesh.patel@hotmail.com',
    phone: '+971 50 345 6789',
    subject: 'Business Bay Office Space',
    message: 'Looking for commercial office space in Business Bay for my consulting firm. Need around 2000 sq ft with parking facilities.',
    inquiryType: 'property',
    status: 'contacted'
  },
  {
    name: 'Fatima Al Zahra',
    email: 'fatima.alzahra@gmail.com',
    phone: '+971 55 678 9012',
    subject: 'Family Villa in Arabian Ranches',
    message: 'We are a family of 5 looking to buy a villa in Arabian Ranches. Prefer 5-bedroom with private garden and pool. Budget is flexible.',
    inquiryType: 'property',
    status: 'new'
  },
  {
    name: 'David Smith',
    email: 'david.smith@gmail.com',
    phone: '+971 52 789 0123',
    subject: 'Investment Portfolio Review',
    message: 'I have an existing property portfolio and would like AMZ Properties to review and suggest improvements or additions.',
    inquiryType: 'investment',
    status: 'contacted'
  },
  {
    name: 'Aisha Abdullah',
    email: 'aisha.abdullah@outlook.com',
    phone: '+971 50 890 1234',
    subject: 'Studio Apartment in JBR',
    message: 'Looking for a furnished studio apartment in JBR for short-term rental investment. Please share available options with rental yields.',
    inquiryType: 'investment',
    status: 'resolved'
  },
  {
    name: 'John Williams',
    email: 'john.williams@yahoo.com',
    phone: '+971 55 901 2345',
    subject: 'Property Management Services',
    message: 'I own 3 properties in Dubai and need professional property management services. Can you provide details about your management packages?',
    inquiryType: 'other',
    status: 'new'
  },
  {
    name: 'Layla Al Rashid',
    email: 'layla.rashid@gmail.com',
    phone: '+971 56 012 3456',
    subject: 'Penthouse in Dubai Marina',
    message: 'Interested in purchasing a luxury penthouse in Dubai Marina with sea view. Budget up to 8 million AED. Please share premium listings.',
    inquiryType: 'property',
    status: 'contacted'
  }
]

const seedContacts = async () => {
  try {
    // Clear existing contacts
    await Contact.deleteMany({})
    console.log('Existing contacts cleared')

    // Insert sample contacts
    const contacts = await Contact.insertMany(sampleContacts)
    console.log(`${contacts.length} sample contacts created successfully`)

    // Display created contacts
    contacts.forEach((contact, index) => {
      console.log(`${index + 1}. ${contact.name} - ${contact.subject} (${contact.status})`)
    })

    console.log('\nContact seeding completed successfully!')
  } catch (error) {
    console.error('Error seeding contacts:', error)
  } finally {
    mongoose.connection.close()
  }
}

// Run the seeding function
connectDB().then(() => {
  seedContacts()
})