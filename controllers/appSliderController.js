const multer = require('multer');
const Slider = require('../models/appSliderModel');
const path = require('path');
const fs = require('fs');

// Multer memory storage configuration (saving image in memory as a buffer)
const storage = multer.memoryStorage();

// File filter to allow only certain image types
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

// Multer upload configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit to 5MB
});

// Create Slider with base64 image
exports.createSlider = [
    upload.single('image'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded', status: 0 });
            }

            // Convert image to base64 string
            const base64Image = req.file.buffer.toString('base64');

            // Create new Slider entry
            const addSlider = new Slider({
                name: req.body.name,
                category: req.body.category,
                image: base64Image, // Save base64 string of the image
                status: req.body.status || 'active',
                updated_at: Date.now(),
            });

            await addSlider.save();
            res.status(200).json({ message: 'Slider Created', status: 1 });
        } catch (error) {
            res.status(500).json({ message: error.message, status: 0 });
        }
    }
];

// Get Slider data with image in base64
exports.getSlider = async (req, res) => {
    try {
        const sliders = await Slider.find();  
        res.json({ message: 'All Sliders', status: 1, data: sliders });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};
