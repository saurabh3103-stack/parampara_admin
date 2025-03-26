const nodemailer = require('nodemailer');

// Configure your email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendBookingConfirmationEmail = async (toEmail, bookingDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Booking Confirmation',
    html: `
      <h1>Your Booking is Confirmed</h1>
      <p>Booking ID: ${bookingDetails.bookingId}</p>
      <p>Date: ${bookingDetails.date}</p>
      <p>Time: ${bookingDetails.time}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = {
  sendBookingConfirmationEmail
};