const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Slider = require('../models/appSliderModel');

// Writable folder in serverless environments
const uploadedFolder = path.resolve('/tmp/uploads');
if (!fs.existsSync(uploadedFolder)) {
    fs.mkdirSync(uploadedFolder, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadedFolder); // Use writable directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

// File filter for allowed file types
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
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
});

// Create slider
exports.createSlider = [
    upload.single('image'), // Single file upload for slider image
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded', status: 0 });
            }

            // Generate public file URL for the uploaded image
            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${path.basename(req.file.path)}`;

            // Create a new Slider document
            const addSlider = new Slider({
                name: req.body.name,
                category: req.body.category,
                image: fileUrl, // Store public URL of the image
                status: req.body.status || 'active',
                updated_at: Date.now(),
            });

            await addSlider.save();
            res.status(200).json({ message: 'Slider Created', status: 1, image: fileUrl });
        } catch (error) {
            console.error('Error creating slider:', error);
            res.status(500).json({ message: error.message, status: 0 });
        }
    }
];

// Route to serve uploaded files
exports.getSlider = async (req, res) => {
    try {
        const sliders = await Slider.find();
        res.json({ message: 'All Sliders', status: 1, data: sliders });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};

