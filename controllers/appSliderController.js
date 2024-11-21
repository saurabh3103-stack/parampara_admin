const multer = require('multer');
const Slider = require('../models/appSliderModel'); // Make sure this matches the model name
const path = require('path');

// Storage configuration for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/slider/'); // Set the destination folder
    },
    filename: (req, file, cb) => {
        // Use Date.now() correctly and append the file extension
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// File filter to allow only specific image types
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

// Multer upload configuration with file size limit and file filter
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB file size limit
});

// Slider creation endpoint with image upload
exports.createSlider = [
    upload.single('image'),  // Corrected to pass 'image' string here
    async (req, res) => {
        try {
            // Check if the file exists
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded', status: 0 });
            }

            // Creating a new slider with the provided data
            const addSlider = new Slider({
                name: req.body.name,
                category: req.body.category,
                image: '/uploads/slider/' + req.file.filename,
                status: req.body.status || 'active',
                updated_at: Date.now(),
            });

            // Saving the slider to the database
            await addSlider.save();
            res.status(200).json({ message: 'Slider Created', status: 1 });
        } catch (error) {
            res.status(500).json({ message: error.message, status: 0 });
        }
    }
];


// Fetch all sliders
exports.getSlider = async (req, res) => {
    try {
        const sliders = await Slider.find();  // Use the correct model variable
        res.json({ message: 'All Sliders', status: 1, data: sliders });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};
