const multer = require('multer');
const path = require('path');
const sliderCategory = require('../models/appSliderCategoryModel');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/sliderCategory/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
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
});

exports.createSliderCategory = [
  upload.single('image'),
  async (req, res) => {
    try {
      console.log(req.file);  // Debugging line to see file
      if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded', status: 0 });
      }

      const newSliderCategory = new sliderCategory({
        name: req.body.name,
        image: '/uploads/sliderCategory/' + req.file.filename,
        status: req.body.status || 'active',
        updated_at: Date.now(),
      });

      await newSliderCategory.save();
      res.status(200).json({ message: 'Slider Category Added', status: 1 });
    } catch (error) {
      res.status(500).json({ message: error.message, status: 0 });
    }
  }
];

exports.getSliderCategory = async (req, res) => {
  try {
    const SliderCategory = await sliderCategory.find();
    res.json({ message: 'All Slider Category', status: 1, data: SliderCategory });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};
