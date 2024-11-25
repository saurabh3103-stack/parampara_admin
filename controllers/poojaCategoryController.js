const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const PoojaCategory = require('../models/PoojaCategory');

// Multer configuration
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
}).single('image');

// Helper function to upload to Cloudinary
const uploadToCloudinary = (fileBuffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: 'image', folder: 'pooja_categories' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    ).end(fileBuffer);
  });

// Controller to create a Pooja Category
exports.createPoojaCategory = [
  upload,
  async (req, res) => {
    try {
      const { ...poojaCategoryDetails } = req.body;

      let poojaImageUrl = null;

      // If a file is uploaded, upload it to Cloudinary
      if (req.file) {
        try {
          poojaImageUrl = await uploadToCloudinary(req.file.buffer);
        } catch (error) {
          return res.status(500).json({
            message: 'Failed to upload image to Cloudinary.',
            error: error.message,
            status: 0,
          });
        }
      }

      // Save category details to the database
      const addPoojaCategory = new PoojaCategory({
        ...poojaCategoryDetails,
        pooja_image: poojaImageUrl, // Add image URL if uploaded
      });

      await addPoojaCategory.save();

      return res.status(200).json({
        message: 'Pooja category created successfully.',
        data: addPoojaCategory,
        status: 1,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
        status: 0,
      });
    }
  },
];

// Controller to get all Pooja Categories
exports.getPoojaCategory = async (req, res) => {
  try {
    const poojaCategory = await PoojaCategory.find();
    res.status(200).json({
      message: 'Pooja Category Data',
      status: 1,
      data: poojaCategory,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: 0,
    });
  }
};
