const mongoose = require("mongoose");

// Sub-Story Schema
const SubStorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  images: [{ type: String }], // Multiple images
});

// Main Story Schema
const StorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  subStories: [SubStorySchema], // Array of sub-stories
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Story", StorySchema);
