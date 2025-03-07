const ProductReview = require("../../models/EcommerceModel/ProductReviewModel");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Define upload directory
const uploadDir = path.join(__dirname, "../public/upload/reviews/");

// Ensure the upload directory exists, create if not
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Save images in 'public/upload/reviews/' directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

// Multer upload middleware
const upload = multer({ storage: storage }).single("image");

//Create Review
exports.createReview = (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(400).json({ error: "Image upload failed!" });
        try {
            const { productId, userId, rating, comment } = req.body;
            const image = req.file ? req.file.filename : null;
            const review = new ProductReview({
                productId,
                userId,
                rating,
                comment,
                image,
                isHidden: false
            });

            await review.save();
            res.status(201).json({ message: "Review created successfully!", review });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};

//Update Review
exports.updateReview = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(400).json({ error: "Image upload failed!" });

        try {
            const { reviewId } = req.params;
            const { rating, comment } = req.body;
            let updatedData = { rating, comment };

            // Handle image update
            if (req.file) {
                updatedData.image = req.file.filename;
            }

            const updatedReview = await ProductReview.findByIdAndUpdate(reviewId, updatedData, { new: true });

            if (!updatedReview) return res.status(404).json({ error: "Review not found!" });

            res.json({ message: "Review updated successfully!", review: updatedReview });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};

//Delete Review
exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await ProductReview.findByIdAndDelete(reviewId);

        if (!review) return res.status(404).json({ error: "Review not found!" });

        // Remove image file if it exists
        if (review.image) {
            const imagePath = path.join(uploadDir, review.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        res.json({ message: "Review deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Hide Review
exports.hideReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await ProductReview.findByIdAndUpdate(reviewId, { isHidden: true }, { new: true });

        if (!review) return res.status(404).json({ error: "Review not found!" });

        res.json({ message: "Review hidden successfully!", review });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Show All Reviews
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await ProductReview.find({ isHidden: false });
        res.json({ reviews });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

