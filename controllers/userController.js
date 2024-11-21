const multer = require('multer');
const path = require('path');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/userImages/');  
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Invalid file type'), false); // Reject the file
  }
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },  // Maximum file size: 5 MB
});

exports.createUser = [
  upload.single('image'),  // Middleware to handle single file upload (image)
  async (req, res) => {
    try {
      const { password, ...otherDetails } = req.body;

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      let imagePath = null;
      if (req.file) {
        imagePath = '/uploads/userImages/' + req.file.filename;  // Save relative path of uploaded image
      }
      const newUser = new User({
        ...otherDetails,
        password: hashedPassword,
        image: imagePath,  szs
      });

      await newUser.save();

      const userResponse = newUser.toObject();
      delete userResponse.password;
      res.status(201).json({ message: 'User added', status: 1, data: userResponse });
    } catch (error) {
      res.status(500).json({ message: error.message, status: 0 });
    }
  }
];

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({ message: 'User Data', status: 1, data: users });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
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