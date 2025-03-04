const multer = require("multer");
const path = require("path");
const Product = require("../../models/EcommerceModel/ProductModel");

// ✅ Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Store images in the "uploads" folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// ✅ File Filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    return cb(null, true);
  } else {
    return cb(new Error("Only images (jpeg, jpg, png, gif) are allowed!"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

// ✅ Add a new Pooja Samagri Product
exports.addProduct = async (req, res) => {
  console.log(req.body);
  upload.fields([
    { name: "featuredImage", maxCount: 1 }, 
    { name: "galleryImages", maxCount: 5 } // Allow up to 5 gallery images
  ])(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    try {
      const {
        name,
        slug_url: slug,
        category,
        price,
        sellingPrice,
        gst,
        local_delivery,
        stock,
        short_discription,
        long_discription,
        isFeatured,  
        offer,       
      } = req.body;
      const featuredImage = req.files["featuredImage"] ? req.files["featuredImage"][0].filename : null;
      const galleryImages = req.files["galleryImages"] ? req.files["galleryImages"].map(file => file.filename) : [];
      const newProduct = new Product({
        name,
        slug,
        category,
        price,
        sellingPrice,
        gst,
        local_delivery,
        stock,
        featuredImage,
        galleryImages,
        short_discription,
        long_discription,
        isFeatured: isFeatured || null,  
        offer: offer || null,            
      });

      await newProduct.save();
      res.status(201).json({ success: true, message: "Product added successfully", data: newProduct });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

// ✅ Update Pooja Samagri Product
exports.updateProduct = async (req, res) => {
  upload.single("featuredImage")(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const { 
        name, 
        slug, 
        category, 
        packSize, 
        weight, 
        price, 
        sellingPrice, 
        tags, 
        stock, 
        quantity, 
        size, 
        isFeatured,  // New field
        offer        // New field
      } = req.body;

      const updatedData = {
        name,
        slug,
        category,
        packSize,
        weight,
        price,
        sellingPrice,
        tags: tags ? tags.split(",") : [],
        stock,
        quantity,
        size: size ? size.split(",") : [],
        isFeatured: isFeatured || null,  // Ensure proper default value
        offer: offer || null,            // Ensure proper default value
      };

      if (req.file) {
        updatedData.featuredImage = req.file.filename;
      }

      const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updatedData, { new: true });

      if (!updatedProduct) return res.status(404).json({ success: false, message: "Product not found" });

      res.status(200).json({ success: true, message: "Product updated successfully", data: updatedProduct });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
};


// ✅ Other Controller Methods (Without File Upload)
exports.getAllProduct = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ success: false, message: "Product not found" });

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!updatedProduct) return res.status(404).json({ success: false, message: "Product not found" });

    res.status(200).json({ success: true, message: "Status updated successfully", data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, { quantity }, { new: true });

    if (!updatedProduct) return res.status(404).json({ success: false, message: "Product not found" });

    res.status(200).json({ success: true, message: "Quantity updated successfully", data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Featured Status of a Product
exports.updateFeaturedStatus = async (req, res) => {
  try {
    const { isFeatured } = req.body; // Boolean value (true/false)
    if (typeof isFeatured === "undefined") {
      return res.status(400).json({ success: false, message: "isFeatured field is required" });
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      { isFeatured }, 
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ 
      success: true, 
      message: `Product ${isFeatured ? "marked as Featured" : "removed from Featured"}`,
      data: updatedProduct 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
