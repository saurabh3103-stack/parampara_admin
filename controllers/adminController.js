const User = require('../models/adminModel');

// Create a new user
exports.createAdmin = async (req, res) => {
  try {
    const newAdmin = new Admin(req.body);
    await newAdmin.save();
    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users
exports.getAdmin = async (req, res) => {
    try {
      // Static data (mocked user data)
      const users = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
        { id: 3, name: 'Sam Green', email: 'sam@example.com' }
      ];
  
      // Send the static data as JSON response
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };