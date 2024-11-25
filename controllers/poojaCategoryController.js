const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const PoojaCategory = require('../models/PoojaCategory');

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

exports.createPoojaCategory = [
  upload,
  async (req, res) => {
    try {
      const { ...poojaCategoryDetails } = req.body;

      // If no file is uploaded, save data without image
      if (!req.file) {
        const addPoojaCategory = new PoojaCategory({
          ...poojaCategoryDetails,
        });

        await addPoojaCategory.save();

        return res.status(200).json({
          message: 'Pooja category created successfully without an image',
          data: addPoojaCategory,
          status: 1,
        });
      }

      // If file is uploaded, upload it to Cloudinary
      cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        async (error, result) => {
          if (error) {
            return res.status(500).json({
              message: 'Error uploading to Cloudinary',
              error: error.message,
              status: 0,
            });
          }

          const addPoojaCategory = new PoojaCategory({
            ...poojaCategoryDetails,
            pooja_image: result.secure_url, // Add image URL if uploaded
          });

          try {
            await addPoojaCategory.save();
            res.status(200).json({
              message: 'Pooja category created successfully',
              data: addPoojaCategory,
              status: 1,
            });
          } catch (err) {
            res.status(500).json({
              message: err.message,
              status: 0,
            });
          }
        }
      ).end(req.file.buffer);
    } catch (error) {
      res.status(500).json({
        message: error.message,
        status: 0,
      });
    }
  },
];

exports.getPoojaCategory = async (req, res) => {
  try {
    const poojaCategory = await PoojaCategory.find();
    res.json({
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
