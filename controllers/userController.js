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
    res.status(500).json({ message: error.message, status:0 });
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
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required", status: 0 });
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found", status: 0 });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Incorrect password", status: 0 });
    }
    res.status(200).json({
      message: "Login successful",
      status: 1,
      data: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};
