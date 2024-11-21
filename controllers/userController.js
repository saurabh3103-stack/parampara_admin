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
        image: imagePath,  
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
