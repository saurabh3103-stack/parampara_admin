const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const Pandit = require('../models/panditModel');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/panditImages'); 
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); 
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

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
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'aadhar_image', maxCount: 1 },
]);

exports.createPandit = [
  upload,
  async (req, res) => {
    try {
      const { password, ...otherDetails } = req.body;

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      let imagePath = null;
      let aadharImagePath = null;
      const newPandit = new Pandit({
        ...otherDetails,
        password: hashedPassword,
        image: imagePath,
        aadhar_image: aadharImagePath,
      });
      await newPandit.save();
      const panditResponse = newPandit.toObject();
      delete panditResponse.password;
      res.status(201).json({ message: 'Pandit added', status: 1,data:panditResponse });
    } catch (error) {
      res.status(500).json({ message: error.message, status: 0 });
    }
  },
];

exports.updatePanditById = [
  upload, // Add your image upload middleware here
  async (req, res) => {
    try {
      const { id } = req.params; // Get Pandit ID from request params
      const { password, ...otherDetails } = req.body; // Extract password and other details

      // Check if password is being updated, if so, hash the new password
      let updatedData = { ...otherDetails };
      if (password) {
        const saltRounds = 10;
        updatedData.password = await bcrypt.hash(password, saltRounds);
      }

      // Handle image update if any (assuming you are saving the path of the image)
      if (req.file) {
        updatedData.image = req.file.path; // Store new image path
      }
      if (req.body.aadhar_image) {
        updatedData.aadhar_image = req.body.aadhar_image; // Update Aadhar image if provided
      }

      // Find the Pandit by ID and update
      const updatedPandit = await Pandit.findByIdAndUpdate(id, updatedData, { new: true });
      if (!updatedPandit) {
        return res.status(404).json({ message: 'Pandit not found', status: 0 });
      }

      // Remove the password from the response before sending back
      const panditResponse = updatedPandit.toObject();
      delete panditResponse.password;

      res.status(200).json({ message: 'Pandit updated successfully', status: 1, data: panditResponse });
    } catch (error) {
      res.status(500).json({ message: error.message, status: 0 });
    }
  },
];

// Get all Pandits
exports.getPandits = async (req, res) => {
  try {
    const pandits = await Pandit.find();
    res.json({ message: 'Pandit Data', status: 1, data: pandits });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};

exports.loginPandit = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required', status: 0 });
    }

    const pandit = await Pandit.findOne({ email });
    if (!pandit) {
      return res.status(404).json({ message: 'Pandit not found', status: 0 });
    }

    const match = await bcrypt.compare(password, pandit.password);
    if (!match) {
      return res.status(401).json({ message: 'Incorrect password', status: 0 });
    }

    res.status(200).json({
      message: 'Login successful',
      status: 1,
      data: { id: pandit._id, username: pandit.username, email: pandit.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};



exports.deletePanditById = async (req, res) => {
  try {
    const { id } = req.params; // Get Pandit ID from request params

    // Find and delete the Pandit by ID
    const deletedPandit = await Pandit.findByIdAndDelete(id);
    if (!deletedPandit) {
      return res.status(404).json({ message: 'Pandit not found', status: 0 });
    }

    // Respond with a success message
    res.status(200).json({ message: 'Pandit deleted successfully', status: 1 });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};

// Get Pandit by ID
exports.getPanditById = async (req, res) => {
  try {
    const { id } = req.params; 
    const pandit = await Pandit.findById(id);
    if (!pandit) {
      return res.status(404).json({ message: 'Pandit not found', status: 0 });
    }
    const panditResponse = pandit.toObject();
    delete panditResponse.password;

    res.status(200).json({
      message: 'Pandit data fetched successfully',
      status: 1,
      data: panditResponse,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};
