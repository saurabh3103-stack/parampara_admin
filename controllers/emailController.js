// controllers/emailController.js
const { sendEmail } = require('../services/emailService');

const sendBookingConfirmation = async (userEmail, userName, bookingDetails) => {
  const mailOptions = {
    to: userEmail,
    subject: 'Booking Confirmation',
    html: `
      <h1>Hello ${userName}!</h1>
      <p>Your booking has been confirmed with the following details:</p>
      <ul>
        <li>Booking ID: ${bookingDetails.bookingId}</li>
        <li>Date: ${bookingDetails.date}</li>
        <li>Time: ${bookingDetails.time}</li>
      </ul>
      <p>Thank you for choosing our service!</p>
    `,
  };

  return await sendEmail(mailOptions);
};

const sendOTPEmail = async (userEmail, otp) => {
  const mailOptions = {
    to: userEmail,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
    html: `
      <p>Your OTP code is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `,
  };

  return await sendEmail(mailOptions);
};

module.exports = {
  sendBookingConfirmation,
  sendOTPEmail,
};