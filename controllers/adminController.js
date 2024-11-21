const User = require('../models/adminModel'); // Ensure correct model is imported
const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10; // Define the number of salt rounds for hashing

// Create a new admin
exports.createAdmin = async (req, res) => {
  try {
    // Hash the password before saving
    const { password, ...otherFields } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log(hashedPassword);
    // Create a new admin user with hashed password
    const newAdmin = new User({
      ...otherFields,
      password: hashedPassword,
    });

    await newAdmin.save();
    res.status(201).json({ message: 'Admin created successfully', newAdmin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all admins
exports.getAdmin = async (req, res) => {
  try {
    // Fetch all admin users from the database
    const admins = await User.find(); // Adjust query if necessary (e.g., filter by role)
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
