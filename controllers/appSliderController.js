const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PoojaCategory = require('../models/PoojaCategory');

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '../public/uploads/poojaCategory');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // Create the folder and any necessary parent directories
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);  
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    },
});

// File filter for image validation
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); 
    } else {
        cb(new Error('Invalid file type'), false); 
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, 
});

// Create Pooja Category
exports.createPoojaCategory = [
    upload.single('pooja_image'), 
    async (req, res) => {
        try {
            const { ...poojaCategoryDetails } = req.body;
            let imagePath = null;

            if (req.file) {
                imagePath = '/uploads/poojaCategory/' + req.file.filename;
            } else {
                return res.status(400).json({ message: 'Pooja Category image is required', status: 0 });
            }

            const addPoojacategory = new PoojaCategory({
                ...poojaCategoryDetails,
                pooja_image: imagePath,
            });

            await addPoojacategory.save();
            res.status(200).json({ message: 'Pooja category created successfully', data: addPoojacategory, status: 1 });
        } catch (error) {
            res.status(500).json({ message: error.message, status: 0 });
        }
    },
];

// Get Pooja Categories
exports.getPoojaCategory = async (req, res) => {
    try {
        const poojaCategory = await PoojaCategory.find();
        res.json({ message: 'Pooja Category Data', status: 1, data: poojaCategory });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};
