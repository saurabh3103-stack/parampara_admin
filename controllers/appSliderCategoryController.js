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

exports.deleteSliderCategory = async(req,res)=>{
      try {
        const  sliderCatId  = req.params.id;
        if (!sliderCatId) {
          return res.status(400).json({ message: 'Slider Category ID is required.', status: 0 });
        }
        const deleteSliderCategory = await sliderCategory.findByIdAndDelete(sliderCatId);
        if (!deleteSliderCategory) {
          return res.status(404).json({ message: 'Slider Category not found.', status: 0 });
        }
        res.status(200).json({ message: 'Slider Category deleted successfully', status: 1 });
      } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
      }
}; 
exports.updateSliderCategory = [
  upload,
  async (req, res) => {
    try {
      const sliderCatId = req.params.id;
      if (!sliderCatId) {
        return res.status(400).json({ message: 'Slider Category ID is required.', status: 0 });
      }
      const existingSliderCategory = await sliderCategory.findById(sliderCatId);
      if (!existingSliderCategory) {
        return res.status(404).json({ message: 'Slider Category not found.', status: 0 });
      }
      let updatedFields = {
        name: req.body.name || existingSliderCategory.name,
        status: req.body.status || existingSliderCategory.status,
        updated_at: Date.now(),
      };
      if (req.file) {
        cloudinary.uploader.upload_stream(
          { resource_type: 'auto' },
          async (error, result) => {
            if (error) {
              return res.status(500).json({ message: 'Error uploading to Cloudinary', error: error.message });
            }
            updatedFields.image = result.secure_url;
              const updatedSliderCategory = await sliderCategory.findByIdAndUpdate(
              sliderCatId,
              { $set: updatedFields },
              { new: true }
            );
            res.status(200).json({
              message: 'Slider Category updated successfully',
              status: 1,
              data: updatedSliderCategory,
            });
          }
        ).end(req.file.buffer);
      } else {
        const updatedSliderCategory = await sliderCategory.findByIdAndUpdate(
          sliderCatId,
          { $set: updatedFields },
          { new: true }
        );
        res.status(200).json({
          message: 'Slider Category updated successfully',
          status: 1,
          data: updatedSliderCategory,
        });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error updating slider: ' + error.message, status: 0 });
    }
  }
];
exports.getSliderCategoryById = async (req, res) => {
  try {
    const sliderCatId = req.params.id;
    if (!sliderCatId) {
      return res.status(400).json({ message: 'Slider Category ID is required.', status: 0 });
    }
    const sliderCategoryData = await sliderCategory.findById(sliderCatId);
    if (!sliderCategoryData) {
      return res.status(404).json({ message: 'Slider Category not found.', status: 0 });
    }
    res.status(200).json({
      message: 'Slider Category fetched successfully',
      status: 1,
      data: sliderCategoryData,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching slider category: ' + error.message, status: 0 });
  }
};

exports.updateSliderCategoryStatus = async (req, res) => {
  try {
    const { sliderCatId, newStatus } = req.body;

    if (!sliderCatId || !newStatus) {
      return res.status(400).json({ message: 'Slider Category ID and status are required.', status: 0 });
    }

    const updatedSlider = await sliderCategory.findByIdAndUpdate(
      sliderCatId,
      { status: newStatus },
      { new: true }
    );

    if (!updatedSlider) {
      return res.status(404).json({ message: 'Slider Category not found.', status: 0 });
    }

    res.status(200).json({ message: 'Slider Category status updated successfully', data: updatedSlider, status: 1 });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};


