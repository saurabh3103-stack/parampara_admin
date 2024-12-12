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

exports.getSliderUser = async (req, res) => {
    try {
      const activeslider = await Slider.find({ status: 'active' });
      res.status(200).json({ message: 'Active Slider', data: activeslider, status: 1 });
    } catch (error) {
      res.status(500).json({ message: error.message, status: 0 });
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
          const cloudinaryResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              { resource_type: 'auto' },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            ).end(req.file.buffer);
          });
          updateData.image = cloudinaryResult.secure_url; 
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
    },];
  
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