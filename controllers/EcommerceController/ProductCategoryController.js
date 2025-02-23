const multer = require('multer');
const fs = require('fs');
const path = require('path');
const ProductCategory = require("../../models/EcommerceModel/ProductCategoryModel");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderPath = path.join(__dirname, '..', 'public', 'uploads', 'product');
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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg','image/webp'];
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
}).single('category_image');


// Create Product Category
exports.createCategory = [
    upload,
    async (req,res) => {
    console.log(req.body);
    try {
        const { category_name, category_image, discription,slug_url } = req.body;
        let productImageUrl = null;
            if (req.file) {
                productImageUrl = `uploads/bhajan_category/${req.file.filename}`;
            } else {
                return res.status(400).json({ message: "File is not defined", status: 0 });
            }
        if (!category_name) {
            return res.status(400).json({ message: "Category name is required", status: 0 });
        }
        const newCategory = new ProductCategory({
            category_name,
            category_image: productImageUrl,
            discription: discription || null,
            slug_url,
            status: "1"
        });
        await newCategory.save();
        res.status(201).json({ message: "Category created successfully", status: 1, data: newCategory });

    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
}
]
// Get All Product Categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await ProductCategory.find();
        res.status(200).json({ message: "Categories fetched successfully", status: 1, data: categories });

    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};

// Get Single Category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const category = await ProductCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: "Category not found", status: 0 });
        }

        res.status(200).json({ message: "Category fetched successfully", status: 1, data: category });

    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};

// Update Product Category
exports.updateCategory = async (req, res) => {
    try {
        const { category_name, category_image, discription,slug_url, status } = req.body;
        const updatedCategory = await ProductCategory.findByIdAndUpdate(
            req.params.id,
            { category_name, category_image, discription,slug_url, status },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found", status: 0 });
        }

        res.status(200).json({ message: "Category updated successfully", status: 1, data: updatedCategory });

    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};

// Delete Product Category
exports.deleteCategory = async (req, res) => {
    try {
        const deletedCategory = await ProductCategory.findByIdAndDelete(req.params.id);

        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found", status: 0 });
        }

        res.status(200).json({ message: "Category deleted successfully", status: 1 });

    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};

exports.getActiveCategories = async (req, res) => {
    try {
        const activeCategories = await ProductCategory.find({ status: "1" });

        if (!activeCategories.length) {
            return res.status(404).json({ message: "No active categories found", status: 0 });
        }

        res.status(200).json({ message: "Active categories fetched successfully", status: 1, data: activeCategories });

    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};

exports.activeInactive = async (req, res) => {
    try {
        const category = await ProductCategory.findById(req.params.id);
        console.log(category);
        if (!category) {
            return res.status(404).json({ message: "Category not found", status: 0 });
        }

        category.status = category.status === "1" ? "0" : "1"; // Toggle status
        await category.save();

        res.status(200).json({ message: `Category status changed to ${category.status === "1" ? "Active" : "Inactive"}`, status: 1, data: category });

    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};