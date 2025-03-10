const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Slider = require('../models/appSliderModel');

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for local storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 5MB limit
});

exports.createSlider = [
    upload.single('image'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded', status: 0 });
            }
            const filePath = `/uploads/${req.file.filename}`;
            const addSlider = new Slider({
                name: req.body.name,
                category: req.body.category,
                image: filePath,
                status: req.body.status || 'active',
                updated_at: Date.now(),
            });

            await addSlider.save();
            res.status(200).json({ message: 'Slider Created', status: 1, image: filePath });

        } catch (error) {
            console.error('Error creating slider:', error);
            res.status(500).json({ message: error.message, status: 0 });
        }
    }
];

exports.updateSlider = [
    upload.single('image'),
    async (req, res) => {
        try {
            const sliderId = req.params.id;
            if (!sliderId) {
                return res.status(400).json({ message: 'Slider ID is required.', status: 0 });
            }

            const slider = await Slider.findById(sliderId);
            if (!slider) {
                return res.status(404).json({ message: 'Slider not found.', status: 0 });
            }

            const updateData = {
                name: req.body.name || slider.name,
                category: req.body.category || slider.category,
                status: req.body.status || slider.status,
                updated_at: Date.now(),
            };

            if (req.file) {
                const filePath = `/uploads/${req.file.filename}`;
                updateData.image = filePath;
            }

            const updatedSlider = await Slider.findByIdAndUpdate(sliderId, updateData, { new: true });
            res.status(200).json({
                message: 'Slider updated successfully',
                status: 1,
                data: updatedSlider,
            });

        } catch (error) {
            console.error('Error updating slider:', error);
            res.status(500).json({ message: 'Error updating slider: ' + error.message, status: 0 });
        }
    }
];

exports.getSlider = async (req, res) => {
    try {
        const sliders = await Slider.find();
        res.json({ message: 'All Sliders', status: 1, data: sliders });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};

// POST method to fetch sliders based on status and category
exports.getSliderUser = async (req, res) => {
    try {
        const { category } = req.body;
        const status = "active";
        const sliders = await Slider.find({ status, category });
        console.log('Fetched sliders:', sliders);
        res.status(200).json({
            message: `Active sliders for category "${category}"`,
            status: 1,
            data: sliders
        });
    } catch (error) {
        console.error('Error fetching sliders:', error.message);
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

exports.deleteSlider = async(req,res)=>{
      try {
        const sliderId  = req.params.id;
        if (!sliderId) {
          return res.status(400).json({ message: 'Slider ID is required.', status: 0 });
        }
        const deleteSlider = await Slider.findByIdAndDelete(sliderId);
        if (!deleteSlider) {
          return res.status(404).json({ message: 'Slider not found.', status: 0 });
        }
    
        res.status(200).json({ message: 'Slider deleted successfully', status: 1 });
      } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
      }
}; 
exports.getSliderById = async (req, res) => {
  try {
    const sliderId = req.params.id;
    if (!sliderId) {
      return res.status(400).json({ message: 'Slider ID is required.', status: 0 });
    }
    const sliderData = await Slider.findById(sliderId);
    if (!sliderData) {
      return res.status(404).json({ message: 'Slider not found.', status: 0 });
    }
    res.status(200).json({
      message: 'Slider fetched successfully',
      status: 1,
      data: sliderData,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching slider: ' + error.message, status: 0 });
  }
};

  
exports.updateSliderStatus = async (req, res) => {
  try {
    const { sliderId, newStatus } = req.body;

    if (!sliderId || !newStatus) {
      return res.status(400).json({ message: 'Slider ID and status are required.', status: 0 });
    }

    const updatedStatus = await Slider.findByIdAndUpdate(
      sliderId,
      { status: newStatus },
      { new: true }
    );

    if (!updatedStatus) {
      return res.status(404).json({ message: 'Slider not found.', status: 0 });
    }

    res.status(200).json({ message: 'Slider status updated successfully', data: updatedStatus, status: 1 });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};