const mongoose = require("mongoose");
const slugify = require("slugify");

/**
 * SubStory Schema
 */
const SubStorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String },
  description: { type: String },
  long_description: { type: String },
  images: [{ type: String }],
  metaTitle: { type: String },
  metaKeywords: { type: String },
  metaDescription: { type: String },
}, { timestamps: true });

// Auto-generate slug for sub-stories
SubStorySchema.pre("save", async function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
    const existingSlug = await mongoose
      .model("Story")
      .findOne({ "subStories.slug": this.slug });
    if (existingSlug) {
      this.slug += `-${Date.now()}`;
    }
  }
  next();
});

/**
 * Story Schema
 */
const StorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String },
  long_description: { type: String },
  metaTitle: { type: String },
  metaKeywords: { type: String },
  metaDescription: { type: String },
  image: { type: String },

  // ✅ Add category reference here
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StoryCategory", // This should match the name used in mongoose.model("StoryCategory", ...)
  },

  subStories: [SubStorySchema],
}, { timestamps: true });

// Auto-generate slug for stories
StorySchema.pre("save", async function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
    const existingSlug = await mongoose.model("Story").findOne({ slug: this.slug });
    if (existingSlug) {
      this.slug += `-${Date.now()}`;
    }
  }
  next();
});

const Story = mongoose.model("Story", StorySchema);
module.exports = Story;
