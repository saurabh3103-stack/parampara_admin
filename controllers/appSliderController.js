const express = require('express');
const multer = require('multer');
const path = require('path');
const cloudinary = require('../cloudinaryConfig'); // Import Cloudinary configuration
const Slider = require('../models/appSliderModel');

// Multer memory storage configuration
const storage = multer.memoryStorage(); // Store file in memory instead of on disk
const upload = multer({
    storage: storage,
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

            // Upload image buffer to Cloudinary
            const result = await cloudinary.uploader.upload_stream(
                { resource_type: 'auto' }, // Automatically detect file type (image, video, etc.)
                (error, result) => {
                    if (error) {
                        return res.status(500).json({ message: 'Error uploading to Cloudinary', error: error.message });
                    }

                    // Create a new Slider document
                    const addSlider = new Slider({
                        name: req.body.name,
                        category: req.body.category,
                        image: result.secure_url, // Cloudinary provides a secure URL
                        status: req.body.status || 'active',
                        updated_at: Date.now(),
                    });

                    addSlider.save()
                        .then(() => {
                            res.status(200).json({ message: 'Slider Created', status: 1, image: result.secure_url });
                        })
                        .catch(error => {
                            res.status(500).json({ message: error.message, status: 0 });
                        });
                }
            );

            // Upload the file buffer to Cloudinary
            result.end(req.file.buffer); // Send the buffer directly to Cloudinary
        } catch (error) {
            console.error('Error creating slider:', error);
            res.status(500).json({ message: error.message, status: 0 });
        }
    }
];

// Route to serve uploaded files (if needed in your setup, otherwise this is not necessary for Cloudinary)
exports.getSlider = async (req, res) => {
    try {
        const sliders = await Slider.find();
        res.json({ message: 'All Sliders', status: 1, data: sliders });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};
