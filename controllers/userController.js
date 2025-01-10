const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier'); 
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
}).single('image');

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'userImages' }, 
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url); 
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream); 
  });
};

exports.createUser = [
  upload,
  async (req, res) => {
    try {
      const { password, ...otherDetails } = req.body;
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      let imagePath = null;

      if (req.file) {
        imagePath = await uploadToCloudinary(req.file.buffer); 
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
exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required", status: 0 });
    }
    const user = await User.findOne({ email: email });
    console.log(user );
    if (!user) {
      return res.status(404).json({ message: "User not found", status: 0 });
    }
    const userResponse = user.toObject();
    delete userResponse.password; 
    res.status(200).json({ message: "User found", status: 1, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};

exports.updateUser = [
  upload,
  async (req, res) => {
    try {
      const { userId } = req.params;  // Extracting userId from params
      const updateData = req.body;  // Extracting the rest of the data from body
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found", status: 0 });
      }
      if (updateData.password) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(updateData.password, saltRounds);
      }
      if (req.file) {
        const imagePath = await uploadToCloudinary(req.file.buffer);
        updateData.image = imagePath;
      }
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
      const userResponse = updatedUser.toObject();
      delete userResponse.password; 
      res.status(200).json({ message: "User updated successfully", status: 1, data: userResponse });
    } catch (error) {
      res.status(500).json({ message: error.message, status: 0 });
    }
  }
];


exports.updateUserStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", status: 0 });
    }
    user.status = status;
    await user.save();
    res.status(200).json({ message: "User status updated successfully", status: 1, data: { id: user._id, status: user.status } });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};