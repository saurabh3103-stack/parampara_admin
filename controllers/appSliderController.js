const AWS = require('aws-sdk');
const multer = require('multer');
const Slider = require('../models/appSliderModel');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
});

exports.createSlider = [
    upload.single('image'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded', status: 0 });
            }

            const s3Params = {
                Bucket: process.env.S3_BUCKET_NAME, // Replace with your S3 bucket name
                Key: `uploads/${Date.now()}-${req.file.originalname}`,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
                ACL: 'public-read', // Makes the file publicly accessible
            };

            const s3Response = await s3.upload(s3Params).promise();

            const addSlider = new Slider({
                name: req.body.name,
                category: req.body.category,
                image: s3Response.Location, // Save the S3 URL
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

exports.getSlider = async (req, res) => {
    try {
        const sliders = await Slider.find();
        res.json({ message: 'All Sliders', status: 1, data: sliders });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};
