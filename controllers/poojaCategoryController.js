const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Pooja = require('../models/PoojaModel');

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

exports.createPooja = [
    upload,
    async (req, res) => {
        try {
            const { ...poojaDetails } = req.body;

            // Check if file is provided
            if (!req.file) {
                return res.status(400).json({
                    message: 'Pooja image is required',
                    status: 0,
                });
            }

            // Upload to Cloudinary
            const cloudinaryUpload = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: 'auto' },
                    (error, result) => {
                        if (error) {
                            return reject(error);
                        }
                        resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });

            // Save Pooja data
            const addPooja = new Pooja({
                ...poojaDetails,
                pooja_image: cloudinaryUpload.secure_url,
            });

            await addPooja.save();

            // Send success response
            return res.status(200).json({
                message: 'Pooja Data',
                data: addPooja,
                status: 1,
            });
        } catch (error) {
            // Handle errors
            console.error(error);
            return res.status(500).json({
                message: error.message,
                status: 0,
            });
        }
    },
];

exports.getPoojaCategory = async (req, res) => {
  try {
    const poojaCategory = await PoojaCategory.find();
    res.json({ message: 'Pooja Category Data', status: 1, data: poojaCategory });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};
