const multer = require('multer');
const path = require('path');
const sliderCategory = require('../models/appSliderCategoryModel'); // Assuming this path

// Set storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store images in 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate unique filename
  },
});

// File filter for image files only (JPEG, PNG)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);  // Accept file
  } else {
    cb(new Error('Invalid file type'), false);  // Reject file
  }
};

// Initialize multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }  // Limit file size to 5MB
});

// Upload image via a POST request to '/slider/create-category'
exports.createSliderCategory = [
  upload.single('image'),  // Handle single image upload with field name 'image'
  async (req, res) => {
    try {
      // Check if a file is uploaded
      if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded', status: 0 });
      }

      // Create a new slider category object
      const newSliderCategory = new sliderCategory({
        name: req.body.name,
        image: '/uploads/' + req.file.filename,  // Correctly reference req.file.filename
        status: req.body.status || 'active',  // Optional field
        updated_at: Date.now(),
      });

      // Save the new slider category to the database
      await newSliderCategory.save();
      res.status(200).json({ message: 'Slider Category Added', status: 1 });
    } catch (error) {
      res.status(500).json({ message: error.message, status: 0 });
    }
  }
];

exports.getSliderCategory= async(req,res)=>{
    try{
        const SliderCategory= await SliderCategory.find();
        res.json({message:'All Slider Category',status:1,data:SliderCategory});
    }
    catch(error){
        res.status(500).json({message:error.message,status:0});
    }
}