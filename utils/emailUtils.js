const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
require('dotenv').config();

// Create transporter with improved configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'shivanshu.deific@gmail.com',
    pass: 'dptwtjudzscjtosb',
  },
  tls: {
    rejectUnauthorized: false // Only for development/testing
  }
});

// Verify connection on startup
transporter.verify((error) => {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('Server is ready to send emails');
  }
});

const sendEmail = async (to, subject, templateName, data) => {
  try {
    // Validate inputs
    if (!to || !subject || !templateName) {
      throw new Error('Missing required email parameters');
    }

    const templatePath = path.join(__dirname, `../views/emails/${templateName}.ejs`);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Email template not found: ${templateName}`);
    }

    const template = fs.readFileSync(templatePath, 'utf-8');
    const html = ejs.render(template, data);

    const mailOptions = {
      from: `"Vaidic Parampara" <shivanshu.deific@gmail.com>`,
      to: Array.isArray(to) ? to.join(', ') : to, // Handle single or multiple recipients
      subject,
      html,
      // Add these for better email deliverability
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`, info.messageId);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Email sending failed:', {
      error: error.message,
      recipient: to,
      template: templateName
    });
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = {
  sendEmail,
  transporter // Exporting for direct access if needed
};