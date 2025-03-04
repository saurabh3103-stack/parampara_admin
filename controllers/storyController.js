const fs = require("fs");
const path = require("path");
const multer = require("multer");
const Story = require("../models/storyModel");

// Ensure the upload folder exists
const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const storyId = req.params.storyId || "default";
    const subStoryIndex = req.params.subStoryIndex || "general";
    const folderPath = path.join(uploadDir, storyId, subStoryIndex);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage });

// Add Story with Sub-Stories
exports.addStory = async (req, res) => {
  try {
    const { title, description, subStories } = req.body;

    if (!title || !description || !subStories || !Array.isArray(subStories)) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newStory = new Story({ title, description, subStories });
    await newStory.save();

    res.status(201).json({ message: "Story added successfully!", story: newStory });
  } catch (error) {
    res.status(500).json({ error: "Error adding story" });
  }
};

// Upload Images for a Sub-Story
exports.uploadSubStoryImages = [
    upload.array("images", 10), // Max 10 images per request
    async (req, res) => {
      try {
        const { storyId, subStoryIndex } = req.params;
        const { description } = req.body; 
        const images = req.files.map((file) => `/uploads/stories/${file.filename}`);
        const story = await Story.findById(storyId);
        if (!story) return res.status(404).json({ error: "Story not found" });
        if (!story.subStories[subStoryIndex]) {
          return res.status(400).json({ error: "Invalid sub-story index" });
        }
        story.subStories[subStoryIndex].images.push(...images);
        if (description) {
          story.subStories[subStoryIndex].content = description;
        }
        await story.save();
        res.json({
          message: "Images uploaded successfully!",
          story,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error uploading images" });
      }
    },
  ];

// Fetch All Stories
exports.getStories = async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({ error: "Error fetching stories" });
  }
};

// Delete a Story (Including Its Images)
exports.deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    const story = await Story.findByIdAndDelete(id);

    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    // Delete the story's folder
    const storyFolder = path.join(uploadDir, id);
    if (fs.existsSync(storyFolder)) {
      fs.rmSync(storyFolder, { recursive: true, force: true });
    }

    res.json({ message: "Story deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting story" });
  }
};

// Fetch a Single Story by ID
exports.getStoryById = async (req, res) => {
    try {
      const { id } = req.params;
      const story = await Story.findById(id);
  
      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }
  
      res.status(200).json(story);
    } catch (error) {
      res.status(500).json({ error: "Error fetching story" });
    }
  };
  
// Update a Story
exports.updateStory = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, subStories } = req.body;
      // Find and update the story
      const updatedStory = await Story.findByIdAndUpdate(
        id,
        { title, description, subStories },
        { new: true, runValidators: true }
      );
      if (!updatedStory) {
        return res.status(404).json({ error: "Story not found" });
      }
      res.status(200).json({ message: "Story updated successfully!", story: updatedStory });
    } catch (error) {
      res.status(500).json({ error: "Error updating story" });
    }
  };
  
