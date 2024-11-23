const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;  
const sliderCategory = require('../models/appSliderCategoryModel');

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

exports.createSliderCategory = [
  upload,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded', status: 0 });
      }
      cloudinary.uploader.upload_stream(
        { resource_type: 'auto' }, 
        async (error, result) => {
          if (error) {
            return res.status(500).json({ message: 'Error uploading to Cloudinary', error: error.message });
          }
          const newSliderCategory = new sliderCategory({
            name: req.body.name,
            image: result.secure_url,  
            status: req.body.status || 'active',  
            updated_at: Date.now(),
          });
          await newSliderCategory.save();
          res.status(200).json({ message: 'Slider Category Added', status: 1 });
        }
      ).end(req.file.buffer); 
    } catch (error) {
      res.status(500).json({ message: 'Error creating slider: ' + error.message, status: 0 });
    }
  }
];

exports.getSliderCategory = async (req, res) => {
  try {
    const sliderCategoryList = await sliderCategory.find();
    res.json({ message: 'All Slider Categories', status: 1, data: sliderCategoryList });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};
