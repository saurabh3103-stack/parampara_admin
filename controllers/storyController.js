const fs = require("fs");
const path = require("path");
const multer = require("multer");
const Story = require("../models/storyModel");
const slugify = require("slugify");

// Upload Directory
const uploadDir = path.join(__dirname, "../public/uploads/story/");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ✅ **Create Story**
exports.addStory = async (req, res) => {
  try {
    const { title, description, metaTitle, metaKeywords, metaDescription } = req.body;
    let slug = slugify(title, { lower: true, strict: true });
    let existingStory = await Story.findOne({ slug });
    if (existingStory) {
      slug += `-${Date.now()}`;
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const newStory = new Story({ title, slug, description, metaTitle, metaKeywords, metaDescription, image });
    await newStory.save();

    res.status(201).json({ message: "Story created successfully!", story: newStory });
  } catch (error) {
    res.status(500).json({ error: "Error creating story" });
  }
};

// ✅ **Create Sub-Story**
exports.addSubStory = async (req, res) => {
  try {
    const { storyId, title, description, metaTitle, metaKeywords, metaDescription } = req.body;
    const story = await Story.findById(storyId);
    if (!story) return res.status(404).json({ error: "Story not found" });

    let slug = slugify(title, { lower: true, strict: true });
    let existingSubStory = story.subStories.find((s) => s.slug === slug);
    if (existingSubStory) {
      slug += `-${Date.now()}`;
    }

    const images = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : [];
    story.subStories.push({ title, slug, description, images, metaTitle, metaKeywords, metaDescription });
    await story.save();

    res.status(201).json({ message: "Sub-story added successfully!", story });
  } catch (error) {
    res.status(500).json({ error: "Error creating sub-story" });
  }
};

// ✅ **Get Story by Slug**
exports.getStoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const story = await Story.findOne({ slug });
    if (!story) return res.status(404).json({ error: "Story not found" });
    res.status(200).json(story);
  } catch (error) {
    res.status(500).json({ error: "Error fetching story" });
  }
};

// ✅ **Get Sub-Story by Slug**
exports.getSubStoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const story = await Story.findOne({ "subStories.slug": slug }, { "subStories.$": 1 });
    if (!story) return res.status(404).json({ error: "Sub-story not found" });
    res.status(200).json(story.subStories[0]);
  } catch (error) {
    res.status(500).json({ error: "Error fetching sub-story" });
  }
};

// ✅ **Update Story**
exports.updateStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, metaTitle, metaKeywords, metaDescription, status } = req.body;

    let story = await Story.findById(id);
    if (!story) return res.status(404).json({ error: "Story not found" });

    if (title) story.slug = slugify(title, { lower: true, strict: true }) + `-${Date.now()}`;
    Object.assign(story, { title, description, metaTitle, metaKeywords, metaDescription, status });

    await story.save();
    res.status(200).json({ message: "Story updated successfully!", story });
  } catch (error) {
    res.status(500).json({ error: "Error updating story" });
  }
};

// ✅ **Update Sub-Story**
exports.updateSubStory = async (req, res) => {
  try {
    const { storyId, subStoryId } = req.params;
    const { title, description, metaTitle, metaKeywords, metaDescription, status } = req.body;

    let story = await Story.findById(storyId);
    if (!story) return res.status(404).json({ error: "Story not found" });

    let subStory = story.subStories.id(subStoryId);
    if (!subStory) return res.status(404).json({ error: "Sub-story not found" });

    if (title) subStory.slug = slugify(title, { lower: true, strict: true }) + `-${Date.now()}`;
    Object.assign(subStory, { title, description, metaTitle, metaKeywords, metaDescription, status });

    await story.save();
    res.status(200).json({ message: "Sub-story updated successfully!", story });
  } catch (error) {
    res.status(500).json({ error: "Error updating sub-story" });
  }
};

// ✅ **Update Story Status**
exports.updateStoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const story = await Story.findByIdAndUpdate(id, { status }, { new: true });

    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    res.status(200).json({ message: "Story status updated successfully!", story });
  } catch (error) {
    res.status(500).json({ error: "Error updating story status" });
  }
};

// ✅ **Update Sub-Story Status**
exports.updateSubStoryStatus = async (req, res) => {
  try {
    const { storyId, subStoryId } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const story = await Story.findById(storyId);
    if (!story) return res.status(404).json({ error: "Story not found" });

    const subStory = story.subStories.id(subStoryId);
    if (!subStory) return res.status(404).json({ error: "Sub-story not found" });

    subStory.status = status;
    await story.save();

    res.status(200).json({ message: "Sub-story status updated successfully!", subStory });
  } catch (error) {
    res.status(500).json({ error: "Error updating sub-story status" });
  }
};

// ✅ **Delete Story**
exports.deleteStory = async (req, res) => {
  try {
    const {id}=req.params.id;
    await Story.findByIdAndDelete(id);
    res.json({ message: "Story deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting story" });
  }
};
