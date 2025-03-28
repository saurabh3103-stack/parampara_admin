const mongoose = require("mongoose");
const slugify = require("slugify");

const SubStorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  metaTitle: { type: String },
  metaKeywords: { type: String },
  metaDescription: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
});

// Middleware to auto-generate unique slug for sub-stories
SubStorySchema.pre("save", async function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
    let existingSlug = await mongoose.model("Story").findOne({ "subStories.slug": this.slug });
    if (existingSlug) {
      this.slug += `-${Date.now()}`;
    }
  }
  next();
});

const StorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  subStories: [SubStorySchema],
  metaTitle: { type: String },
  metaKeywords: { type: String },
  metaDescription: { type: String },
  image: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdAt: { type: Date, default: Date.now },
});

// Middleware to auto-generate unique slug for stories
StorySchema.pre("save", async function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
    let existingSlug = await mongoose.model("Story").findOne({ slug: this.slug });
    if (existingSlug) {
      this.slug += `-${Date.now()}`;
    }
  }
  next();
});

module.exports = mongoose.model("Story", StorySchema);
