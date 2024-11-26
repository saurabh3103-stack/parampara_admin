const multer = require('multer');
const fs = require('fs');
const path = require('path');
const PoojaCategory = require('../models/PoojaCategory');

// Helper function to ensure a folder exists
const ensureDirectoryExistence = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true }); // Create folder recursively
  }
};

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = path.join(__dirname, '..', 'public', 'uploads', 'pooja_categories'); // Public folder path
    ensureDirectoryExistence(folderPath); // Ensure folder exists
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`; // Add timestamp to filename
    cb(null, uniqueName);
  },
});

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
}).single('pooja_image');

// Controller to create a Pooja Category
exports.createPoojaCategory = [
  upload,
  async (req, res) => {
    try {
      const { ...poojaCategoryDetails } = req.body;

      let poojaImageUrl = null;

      // If a file is uploaded, save its path
      if (req.file) {
        poojaImageUrl = `/uploads/pooja_categories/${req.file.filename}`; // Relative URL
      }

      // Save category details to the database
      const addPoojaCategory = new PoojaCategory({
        ...poojaCategoryDetails,
        pooja_image: poojaImageUrl, // Add image path if uploaded
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
  exports.getPoojaCategoryWeb =  async(req,res)=>{
    try{
      const poojaCategory = await PoojaCategory.find({status:"active"});
      res.status(200).json({
        message:'Pooja Category Data For Web',status:1,data:poojaCategory
      })
    }
    catch (error){
      res.status(500).json({message:error.messgae,status:0});
    }
  }
};
