import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// Create transporter for sending emails
const createTransporter = () => {
  // For development, use Gmail SMTP or any other email service
  // In production, use a proper email service like SendGrid, AWS SES, etc.
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  })
}

// Send contact form notification to admin
export const sendContactNotification = async (contactData) => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@amzproperties.com',
      to: process.env.ADMIN_EMAIL || 'admin@amzproperties.com',
      subject: `New Contact Form Submission - ${contactData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h1 style="color: #d4af37; margin: 0; text-align: center; font-size: 28px;">AMZ Properties</h1>
            <p style="color: #ffffff; text-align: center; margin: 10px 0 0 0; font-size: 16px;">New Contact Form Submission</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #1a1a1a; margin-top: 0; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Contact Details</h2>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #d4af37; display: inline-block; width: 120px;">Name:</strong>
              <span style="color: #333;">${contactData.name}</span>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #d4af37; display: inline-block; width: 120px;">Email:</strong>
              <span style="color: #333;">${contactData.email}</span>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #d4af37; display: inline-block; width: 120px;">Phone:</strong>
              <span style="color: #333;">${contactData.phone || 'Not provided'}</span>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #d4af37; display: inline-block; width: 120px;">Source:</strong>
              <span style="color: #333;">${contactData.source || 'Contact Form'}</span>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #d4af37; display: inline-block; width: 120px; vertical-align: top;">Message:</strong>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #d4af37; margin-top: 10px;">
                <p style="color: #333; margin: 0; line-height: 1.6;">${contactData.message}</p>
              </div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #666; margin: 0; font-size: 14px;">Submitted on: ${new Date().toLocaleString()}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>This email was sent from AMZ Properties contact form.</p>
          </div>
        </div>
      `
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('Contact notification email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('Error sending contact notification email:', error)
    return { success: false, error: error.message }
  }
}

// Send confirmation email to user
export const sendContactConfirmation = async (contactData) => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@amzproperties.com',
      to: contactData.email,
      subject: 'Thank you for contacting AMZ Properties',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h1 style="color: #d4af37; margin: 0; text-align: center; font-size: 28px;">AMZ Properties</h1>
            <p style="color: #ffffff; text-align: center; margin: 10px 0 0 0; font-size: 16px;">Thank You for Your Inquiry</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #1a1a1a; margin-top: 0;">Dear ${contactData.name},</h2>
            
            <p style="color: #333; line-height: 1.6; font-size: 16px;">Thank you for reaching out to AMZ Properties. We have received your inquiry and our team will get back to you within 24 hours.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #d4af37; margin: 20px 0;">
              <h3 style="color: #d4af37; margin-top: 0;">Your Message:</h3>
              <p style="color: #333; margin: 0; line-height: 1.6;">${contactData.message}</p>
            </div>
            
            <p style="color: #333; line-height: 1.6; font-size: 16px;">In the meantime, feel free to explore our latest properties and investment opportunities on our website.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://amzproperties.com" style="background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); color: #1a1a1a; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Visit Our Website</a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <h3 style="color: #d4af37; margin-top: 0;">Contact Information:</h3>
              <p style="color: #333; margin: 5px 0;"><strong>Phone:</strong> +971 4 123 4567</p>
              <p style="color: #333; margin: 5px 0;"><strong>Email:</strong> info@amzproperties.com</p>
              <p style="color: #333; margin: 5px 0;"><strong>Address:</strong> Dubai, UAE</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>Best regards,<br>AMZ Properties Team</p>
          </div>
        </div>
      `
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('Contact confirmation email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('Error sending contact confirmation email:', error)
    return { success: false, error: error.message }
  }
}

export default {
  sendContactNotification,
  sendContactConfirmation
}