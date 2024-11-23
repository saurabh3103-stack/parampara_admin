const Slider = require('../models/appSliderModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const uploadedFolder = path.join(__dirname, '../src/assets/upload'); // Corrected path
if (!fs.existsSync(uploadedFolder)) {
    fs.mkdirSync(uploadedFolder, { recursive: true });
}

// Multer disk storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadedFolder); // Save to the correct upload folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});


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

// Create Slider with image path
exports.createSlider = [
    upload.single('image'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded', status: 0 });
            }

            // Save the file path to the database
            const addSlider = new Slider({
                name: req.body.name,
                category: req.body.category,
                image: req.file.path, // Save the temporary file path
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


// Get Slider data with image path
exports.getSlider = async (req, res) => {
    try {
        const sliders = await Slider.find();
        res.json({ message: 'All Sliders', status: 1, data: sliders });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};
