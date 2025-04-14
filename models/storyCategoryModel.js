const mongoose = require("mongoose");
const slugify = require("slugify");

/**
 * Story Category Schema
 */
const StoryCategorySchema = new mongoose.Schema({
    title: { type: String, required: true },
    language:{type:String,required:true},
    slug: { type: String, unique: true },
    description: { type: String },
    metaTitle: { type: String },
    metaKeywords: { type: String },
    metaDescription: { type: String },
    image: { type: String }, // ✅ Make sure this exists
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    createdAt: { type: Date, default: Date.now },
  });
// Auto-generate slug for story categories
StoryCategorySchema.pre("save", async function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
    const existingSlug = await mongoose
      .model("StoryCategory")
      .findOne({ slug: this.slug });
    if (existingSlug) {
      this.slug += `-${Date.now()}`;
    }
  }
  next();
});

const StoryCategory = mongoose.model("StoryCategory", StoryCategorySchema);
module.exports = StoryCategory;
