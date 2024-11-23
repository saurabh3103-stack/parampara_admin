const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;  // Only if using Cloudinary for cloud storage
const sliderCategory = require('../models/appSliderCategoryModel');

// Multer storage configuration for local file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/sliderCategory/');  // Local storage directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Generate unique file name
  },
});

// File filter to only allow specific types of images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);  // Allow file
  } else {
    cb(new Error('Invalid file type'), false);  // Reject file
  }
};

// Multer configuration with file size limit (5MB)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB file size limit
}).single('image');  // Expecting the field name as 'image'

/**
 * Controller for creating a slider category (with local storage or Cloudinary).
 */
exports.createSliderCategory = [
  // Multer middleware to handle file upload
  upload,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded', status: 0 });
      }

      // Option 1: Local file storage (if using local storage for images)
      const imageUrl = '/uploads/sliderCategory/' + req.file.filename;

      // Option 2: Cloudinary (if you want to upload to Cloudinary instead of local storage)
      /*
      const result = await cloudinary.uploader.upload(req.file.path);
      const imageUrl = result.secure_url;  // Cloudinary URL for the uploaded image
      */

      // Create a new slider category
      const newSliderCategory = new sliderCategory({
        name: req.body.name,
        image: imageUrl,  // Store the image URL (local or Cloudinary)
        status: req.body.status || 'active',  // Default to 'active' if not provided
        updated_at: Date.now(),
      });

      // Save the new slider category to the database
      await newSliderCategory.save();
      res.status(200).json({ message: 'Slider Category Added', status: 1 });
    } catch (error) {
      res.status(500).json({ message: 'Error creating slider: ' + error.message, status: 0 });
    }
  }
];

/**
 * Controller to get all slider categories.
 */
exports.getSliderCategory = async (req, res) => {
  try {
    const sliderCategoryList = await sliderCategory.find();
    res.json({ message: 'All Slider Categories', status: 1, data: sliderCategoryList });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};
