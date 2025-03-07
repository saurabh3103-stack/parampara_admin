const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10; // Define the number of salt rounds for hashing
const BhajanMandal = require('../models/bhajanmandalModel');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderPath = path.join(__dirname, '..', 'public', 'uploads', 'bhajan_image');
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName); // 
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single('bhajan_image');

//  **Create Bhajan**
exports.createBhajan = [
    upload,
    async (req, res) => {
        console.log(req.body);
        try {
            const {
                bhajan_name, slug_url, bhajan_category, bhajan_price, bhajan_member, exp_year,
                short_discription, long_discription, address, city, location, state, country, pin_code, area,
                owner_name, owner_email, owner_phone, owner_password
            } = req.body;

            if (!bhajan_name || !slug_url || !bhajan_category || !bhajan_price || !exp_year ||
                !bhajan_member || !short_discription || !long_discription || !address ||
                !city || !location || !state || !country || !pin_code || !area ||
                !owner_name || !owner_email || !owner_phone || !owner_password) {
                return res.status(400).json({ message: 'All required fields must be provided', status: 0 });
            }

            let bhajan_image = null;
            if (req.file) {
                bhajan_image = `/uploads/bhajan_image/${req.file.filename}`;
            }

            // Hash the owner's password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(owner_password, salt);

            const newBhajan = new BhajanMandal({
                bhajan_name, slug_url, bhajan_category, bhajan_price, bhajan_member, exp_year,
                short_discription, long_discription, bhajan_image, status: 1,
                mandali_address: { address, city, location, state, country, pin_code, area },
                bhajan_owner: { owner_name: owner_name, owner_email: owner_email, owner_phone: owner_phone, owner_password: hashedPassword }
            });

            await newBhajan.save();
            res.status(201).json({ message: 'Bhajan Added Successfully', data: newBhajan, status: 1 });
        } catch (error) {
            res.status(500).json({ message: error.message, status: 0 });
        }
    },
];




// **Get All Bhajans**
exports.getAllBhajans = async (req, res) => {
    try {
        const bhajans = await BhajanMandal.find();
        res.status(200).json({ message: 'All Bhajans fetched', data: bhajans, status: 1 });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};

// **Get Single Bhajan by Slug**
exports.getBhajanBySlug = async (req, res) => {
    try {
        const bhajan = await BhajanMandal.findOne({ slug_url: req.params.slug });
        if (!bhajan) {
            return res.status(404).json({ message: 'Bhajan not found', status: 0 });
        }
        res.status(200).json({ message: 'Bhajan fetched', data: bhajan, status: 1 });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};

// **Get Bhajans with Status = 1**
exports.getActiveBhajans = async (req, res) => {
    try {
        const bhajans = await BhajanMandal.find({ status: 1 });
        res.status(200).json({ message: 'Active Bhajans fetched', data: bhajans, status: 1 });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};

// **Update Bhajan Status**
exports.updateBhajanStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const bhajan = await BhajanMandal.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!bhajan) {
            return res.status(404).json({ message: 'Bhajan not found', status: 0 });
        }
        res.status(200).json({ message: 'Bhajan status updated', data: bhajan, status: 1 });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};

// **Update Bhajan**
exports.updateBhajan = [
    upload,
    async (req, res) => {
        try {
            const {
                bhajan_name, slug_url, bhajan_category, bhajan_price, bhajan_member,exp_year,
                short_discription, long_discription,address, city, location, state, country, pin_code, area
            } = req.body;

            let bhajan = await BhajanMandal.findById(req.params.id);
            if (!bhajan) {
                return res.status(404).json({ message: 'Bhajan not found', status: 0 });
            }

            let bhajan_image = bhajan.bhajan_image;
            if (req.file) {
                bhajan_image = `/uploads/bhajan_image/${req.file.filename}`;
            }

            bhajan = await BhajanMandal.findByIdAndUpdate(req.params.id, {
                bhajan_name, slug_url, bhajan_category, bhajan_price, bhajan_member,exp_year,
                short_discription, long_discription, bhajan_image,
                mandali_address: { address, city, location, state, country, pin_code, area }
            }, { new: true });

            res.status(200).json({ message: 'Bhajan updated successfully', data: bhajan, status: 1 });
        } catch (error) {
            res.status(500).json({ message: error.message, status: 0 });
        }
    },
];

// Get Bhajan by ID
exports.getBhajanById = async (req, res) => {
    try {
        const { id } = req.params;
        const bhajan = await BhajanMandal.findById(id);
        if (!bhajan) {
            return res.status(404).json({ message: 'Bhajan not found', status: 0 });
        }
        res.status(200).json({ data: bhajan, status: 1 });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};

//  **Delete Bhajan**
exports.deleteBhajan = async (req, res) => {
    try {
        const bhajan = await BhajanMandal.findByIdAndDelete(req.params.id);
        if (!bhajan) {
            return res.status(404).json({ message: 'Bhajan not found', status: 0 });
        }
        res.status(200).json({ message: 'Bhajan deleted successfully', status: 1 });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};

// **Get Bhajans by Category ID**
exports.getBhajansByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const bhajans = await BhajanMandal.find({ bhajan_category: categoryId });

        if (bhajans.length === 0) {
            return res.status(200).json({ message: 'No Bhajans found for this category', status: 0 });
        }

        res.status(200).json({ message: 'Bhajans fetched successfully', data: bhajans, status: 1 });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};


exports.bhajanLogin = async (req, res) => {
    const { owner_email, owner_password, fcm_tokken } = req.body;
    if (!owner_email || !owner_password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    try {
        const bhajanMandal = await BhajanMandal.findOne({ "bhajan_owner.owner_email": owner_email });
        if (!bhajanMandal || !bhajanMandal.bhajan_owner || !bhajanMandal.bhajan_owner.owner_password) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const storedHashedPassword = bhajanMandal.bhajan_owner.owner_password;
        if (typeof storedHashedPassword !== "string" || typeof owner_password !== "string") {
            return res.status(400).json({ message: "Invalid password format" });
        }
        const isMatch = await bcrypt.compare(owner_password, storedHashedPassword);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        // Update FCM token if provided
        if (fcm_tokken) {
            await BhajanMandal.updateOne(
                { _id: bhajanMandal._id },
                { $set: { "bhajan_owner.fcm_tokken": fcm_tokken } }
            );
        }
        res.json({
            message: "Login successful",
            user: {
                email: bhajanMandal.bhajan_owner.owner_email,
                name: bhajanMandal.bhajan_owner.owner_name,
                id: bhajanMandal._id,
                fcm_tokken: fcm_tokken || bhajanMandal.bhajan_owner.fcm_tokken
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

