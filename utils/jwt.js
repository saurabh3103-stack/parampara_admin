const jwt = require('jsonwebtoken');
require('dotenv').config();

// Function to generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION, // Set expiration time, e.g. 1h
  });
};

// Function to verify JWT
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
