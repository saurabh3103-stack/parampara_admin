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

            // If no file is provided, skip Cloudinary upload
            let imageUrl = null;

            if (req.file) {
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

                imageUrl = cloudinaryUpload.secure_url;
            }

            // Save Pooja data with or without image
            const addPooja = new Pooja({
                ...poojaDetails,
                pooja_image: imageUrl, // Use null if no image is uploaded
            });

            await addPooja.save();

            // Send success response
            return res.status(200).json({
                message: 'Pooja created successfully',
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

exports.getPooja = async (req, res) => {
    try {
        const pooja = await Pooja.find();
        res.json({ message: 'All Pooja Data', status: 1, data: pooja });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPoojaUser = async (req, res) => {
    try {
        const pooja = await Pooja.find({ status: 'active' });
        res.json({ message: 'All Pooja For User', status: 1, data: pooja });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};

exports.updatePoojaStatus = async (req, res) => {
    try {
        const { poojaId, newStatus } = req.body;
        if (!poojaId || !newStatus) {
            return res.status(400).json({ message: 'Pooja ID and status are required.', status: 0 });
        }

        const updatedPooja = await Pooja.findByIdAndUpdate(
            poojaId,
            { status: newStatus },
            { new: true }
        );

        if (!updatedPooja) {
            return res.status(404).json({ message: 'Pooja not found.', status: 0 });
        }

        res.status(200).json({ message: 'Pooja status updated successfully', updatedPooja });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};

exports.deletePooja = async (req, res) => {
    try {
        const poojaId = req.params.poojaId;
        if (!poojaId) {
            return res.status(400).json({ message: 'Pooja ID is required.', status: 0 });
        }

        const deletedPooja = await Pooja.findByIdAndDelete(poojaId);
        if (!deletedPooja) {
            return res.status(404).json({ message: 'Pooja not found.', status: 0 });
        }

        res.status(200).json({ message: 'Pooja deleted successfully', status: 1 });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};
