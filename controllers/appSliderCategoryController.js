const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;  // Cloudinary for cloud storage
const sliderCategory = require('../models/appSliderCategoryModel');

// Multer storage configuration (in memory storage for Cloudinary)
const storage = multer.memoryStorage();

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
 * Controller for creating a slider category (using Cloudinary for image upload).
 */
exports.createSliderCategory = [
  // Multer middleware to handle file upload
  upload,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded', status: 0 });
      }

      // Upload image to Cloudinary
      cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },  // Automatically detect the resource type (image/video)
        async (error, result) => {
          if (error) {
            return res.status(500).json({ message: 'Error uploading to Cloudinary', error: error.message });
          }

          // Create a new slider category
          const newSliderCategory = new sliderCategory({
            name: req.body.name,
            image: result.secure_url,  // Cloudinary URL for the uploaded image
            status: req.body.status || 'active',  // Default to 'active' if not provided
            updated_at: Date.now(),
          });

          // Save the new slider category to the database
          await newSliderCategory.save();
          res.status(200).json({ message: 'Slider Category Added', status: 1 });
        }
      ).end(req.file.buffer);  // Use the file buffer for upload
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
