const express = require('express');
const multer = require('multer');
const path = require('path');
const cloudinary = require('../cloudinaryConfig'); 
const Slider = require('../models/appSliderModel');

const storage = multer.memoryStorage(); 
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
});

exports.createSlider = [
    upload.single('image'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded', status: 0 });
            }
            const result = await cloudinary.uploader.upload_stream(
                { resource_type: 'auto' }, 
                (error, result) => {
                    if (error) {
                        return res.status(500).json({ message: 'Error uploading to Cloudinary', error: error.message });
                    }
                    const addSlider = new Slider({
                        name: req.body.name,
                        category: req.body.category,
                        image: result.secure_url, 
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
            result.end(req.file.buffer); 
        } catch (error) {
            console.error('Error creating slider:', error);
            res.status(500).json({ message: error.message, status: 0 });
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
