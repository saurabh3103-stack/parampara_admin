const ParamarshaCategory = require('../models/paramarshaModel');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure upload folder exists
const uploadDir = path.join(__dirname, '../public/uploads/paramarash');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup (inside controller)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});
const upload = multer({ storage: storage }).single('featurd_image');

// Controller function
exports.addParamarsha = async (req, res) => {
    upload(req, res, async function (err) {
        if (err) {
            return res.status(400).json({ success: false, message: 'Image upload failed', error: err.message });
        }

        try {
            const bodyData = req.body;
            if (req.file) {
                bodyData.featurd_image = `/uploads/paramarash/${req.file.filename}`;
            }

            const newCategory = new ParamarshaCategory(bodyData);
            const savedCategory = await newCategory.save();

            res.status(201).json({ success: true, data: savedCategory });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });
};

// Update Paramarsha
exports.updateParamarsha = async (req, res) => {
    upload(req, res, async function (err) {
        if (err) {
            return res.status(400).json({ success: false, message: 'Image upload failed', error: err.message });
        }
        try {
            const updateData = { ...req.body, update_at: Date.now() };
            if (req.file) {
                updateData.featurd_image = `/uploads/paramarash/${req.file.filename}`;
            }
            const updatedCategory = await ParamarshaCategory.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true }
            );
            if (!updatedCategory) {
                return res.status(404).json({ success: false, message: "Paramarsha not found" });
            }
            res.json({ success: true, data: updatedCategory });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });
};

// Delete Paramarsha
exports.deleteParamarsha = async (req, res) => {
    try {
        const deleted = await ParamarshaCategory.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Paramarsha not found" });
        }
        res.json({ success: true, message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Status
exports.updateparamarshStatus = async (req, res) => {
    try {
        const updated = await ParamarshaCategory.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status, update_at: Date.now() },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ success: false, message: "Paramarsha not found" });
        }
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Paramarshas
exports.getAllParamarsha = async (req, res) => {
    try {
        const allCategories = await ParamarshaCategory.find().sort({ created_at: -1 });
        res.json({ success: true, data: allCategories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Paramarsha by ID
exports.getParamarshaById = async (req, res) => {
    try {
        const category = await ParamarshaCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Paramarsha not found" });
        }
        res.json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Active Paramarshas
exports.getActiveParamarshas = async (req, res) => {
    try {
        const activeCategories = await ParamarshaCategory.find({ status: "1" }).sort({ created_at: -1 });
        res.json({ success: true, data: activeCategories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
