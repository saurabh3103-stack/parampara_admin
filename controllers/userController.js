const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
  try {
    const { password, ...otherDetails } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({
      ...otherDetails,
      password: hashedPassword,
    });
    await newUser.save();
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({message:'User add', status:1, data : userResponse});
  } catch (error) {
    res.status(500).json({ message: error.message,status:0 });
  }
};


// Get all users
exports.getUsers = async (req, res) => {
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