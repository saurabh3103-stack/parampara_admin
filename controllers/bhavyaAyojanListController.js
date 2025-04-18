const path = require('path');
const multer = require('multer');
const BhavyaAyojanList = require('../models/bhavyaAyojanListModel');

// ===================== MULTER SETUP =====================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/bhavyaayojan');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter }).single('ayojanImage');

// ===================== UTILITY =====================
const generateUniqueSlug = async (baseSlug) => {
  let slug = baseSlug;
  let counter = 1;

  while (await BhavyaAyojanList.findOne({ slug_url: slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// ===================== CONTROLLERS =====================

// Create Ayojan
exports.createAyojan = (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      let { slug_url } = req.body;

      if (!slug_url) {
        return res.status(400).json({ success: false, message: 'Slug URL is required' });
      }

      slug_url = await generateUniqueSlug(slug_url);

      const imagePath = req.file ? `/public/bhavyaayojan/${req.file.filename}` : null;

      const newAyojan = new BhavyaAyojanList({
        ...req.body,
        slug_url,
        status: '1',
        ayojanImage: imagePath
      });

      const saved = await newAyojan.save();
      res.status(201).json({ success: true, data: saved });

    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
};

// Get all active Ayojans
exports.getAllAyojans = async (req, res) => {
  try {
    const list = await BhavyaAyojanList.find({ status: '1' }).sort({ created_at: -1 });
    res.status(200).json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Ayojan by ID
exports.getAyojanById = async (req, res) => {
  try {
    const record = await BhavyaAyojanList.findOne({ _id: req.params.id, status: '1' });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Ayojan not found' });
    }
    res.status(200).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Ayojan by slug
exports.getAyojanBySlug = async (req, res) => {
  try {
    const record = await BhavyaAyojanList.findOne({ slug_url: req.params.slug, status: '1' });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Ayojan not found' });
    }
    res.status(200).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Ayojan
exports.updateAyojan = (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const updateData = {
        ...req.body,
        updated_at: Date.now()
      };

      if (req.file) {
        updateData.ayojanImage = `/public/bhavyaayojan/${req.file.filename}`;
      }

      const updated = await BhavyaAyojanList.findOneAndUpdate(
        { _id: req.params.id, status: '1' },
        updateData,
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Ayojan not found' });
      }

      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
};

// Soft Delete Ayojan
exports.deleteAyojan = async (req, res) => {
  try {
    const deleted = await BhavyaAyojanList.findOneAndUpdate(
      { _id: req.params.id, status: '1' },
      { status: '0', updated_at: Date.now() },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Ayojan not found or already deleted' });
    }

    res.status(200).json({ success: true, message: 'Ayojan deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Toggle Status
exports.toggleStatus = async (req, res) => {
  try {
    const record = await BhavyaAyojanList.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Ayojan not found' });
    }

    record.status = record.status === '1' ? '0' : '1';
    record.updated_at = Date.now();
    await record.save();

    res.status(200).json({ success: true, data: record });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
