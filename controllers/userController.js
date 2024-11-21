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


exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();  
    res.json({message:'User Data', status:1, data:users});
  } catch (error) {
    res.status(500).json({ message: error.message,status:0 });
  }
};