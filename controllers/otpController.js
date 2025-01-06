const express = require('express');
const crypto = require("crypto");

const otpStore = {};

function generateOtp(length = 6) {
  return crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
}
exports.sendOtp = (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: "Phone number is required" });
  }
  const otp = generateOtp();
  const expiry = Date.now() + 5 * 60 * 1000; 
  otpStore[phone] = { otp, expiry };
  console.log(`OTP for ${phone}: ${otp}`);
  res.status(200).json({
    success: 1,
    message: "OTP sent successfully",
    otp, 
  });
};
exports.verifyOtp = (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: "Phone number and OTP are required" });
  }
  const otpDetails = otpStore[phone];
  if (!otpDetails) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
  }
  const { otp: storedOtp, expiry } = otpDetails;
  if (Date.now() > expiry) {
    delete otpStore[phone];
    return res.status(400).json({ success: false, message: "OTP has expired" });
  }
  if (otp !== storedOtp) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }
  delete otpStore[phone]; 
  res.status(200).json({ success: true, message: "OTP verified successfully" });
};
