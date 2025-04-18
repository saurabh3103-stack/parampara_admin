const fs = require("fs");
const path = require("path");
const multer = require("multer");
const slugify = require("slugify");
const Story = require("../models/storyModel");
const StoryCategory = require("../models/storyCategoryModel");

// Upload Directory
const uploadDir = path.join(__dirname, "../public/uploads/story/");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Ensure we use the absolute path
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage }).single("image");

// ✅ Create Category Controller
exports.addStoryCategory = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(500).json({ error: "Image upload failed", details: err.message,status:0 });
    }

    try {
      const { title, description, metaTitle, metaKeywords, metaDescription,language } = req.body;

      if (!title) {
        return res.status(400).json({ error: "Category title is required",status:0});
      }

      const slug = slugify(title, { lower: true, strict: true });
      const existing = await StoryCategory.findOne({ slug });
      const uniqueSlug = existing ? `${slug}-${Date.now()}` : slug;

      // ✅ Correct image path (use relative path for frontend)
      const image = req.file ? `/uploads/story/${req.file.filename}` : null;

      const category = new StoryCategory({
        title,
        slug: uniqueSlug,
        description,
        metaTitle,
        metaKeywords,
        metaDescription,
        language,
        status: "active",
        image: image, // ✅ Save image path to database
      });

      await category.save();

      res.status(200).json({
        message: "Category created successfully!",
        category,
        status:1
      });

    } catch (error) {
      console.error("Error in addStoryCategory:", error);
      res.status(500).json({ error: "Error creating category", details: error.message,status:0 });
    }
  });
};

// ✅ Update Category
exports.updateStoryCategory = async (req, res) => {
  try {
    console.log(req.body);
    const { id } = req.params;
    const {
      name,
      metaTitle,
      metaKeywords,
      metaDescription,
      status,
    } = req.body;
    const category = await StoryCategory.findById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found",status:0 });
    }

    // Update fields only if they're provided
    if (name) {
      category.name = name;
      category.slug = slugify(name, { lower: true, strict: true }) + `-${Date.now()}`;
    }
    if (metaTitle !== undefined) category.metaTitle = metaTitle;
    if (metaKeywords !== undefined) category.metaKeywords = metaKeywords;
    if (metaDescription !== undefined) category.metaDescription = metaDescription;
    if (status !== undefined) category.status = status;
    if (req.file) category.image = `/uploads/story/${req.file.filename}`;

    await category.save(); // ✅ Save the instance, not the model

    res.status(200).json({ message: "Category updated successfully!", category,status:1 });

  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Error updating category",status:0 });
  }
};

// ✅ Delete Category
exports.deleteStoryCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await StoryCategory.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Category not found",status:1 });
    }
    res.json({ message: "Category deleted successfully!" });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: "Error deleting category",status:0 });
  }
};

// ✅ Update Category Status
exports.updateStoryCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" ,status:0});
    }

    const category = await Category.findByIdAndUpdate(id, { status }, { new: true });
    if (!category) return res.status(404).json({ error: "Category not found",status:0 });

    res.status(200).json({ message: "Category status updated!", category ,status:1});
  } catch (error) {
    res.status(500).json({ error: "Error updating category status",status:0 });
  }
};

// ✅ Create Story
exports.addStory = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(500).json({ error: "Image upload failed", details: err.message, status: 0 });
    }

    try {
      const { title, description, metaTitle, metaKeywords, metaDescription, category,long_description } = req.body;

      // Basic validations
      if (!title || !description || !category) {
        return res.status(400).json({ error: "Title, Description, and Category are required", status: 0 });
      }

      // Check if category exists
      const categoryExists = await StoryCategory.findById(category);
      if (!categoryExists) {
        return res.status(404).json({ error: "Category not found", status: 0 });
      }

      // Generate unique slug
      let slug = slugify(title, { lower: true, strict: true });
      const existing = await Story.findOne({ slug });
      if (existing) {
        slug += `-${Date.now()}`;
      }

      // Save image path
      const image = req.file ? `/uploads/story/${req.file.filename}` : null;

      // Create story object
      const story = new Story({
        title,
        slug,
        description,
        long_description,
        metaTitle,
        metaKeywords,
        metaDescription,
        image,
        category,
      });

      await story.save();

      return res.status(200).json({
        message: "Story created successfully!",
        story,
        status: 1,
      });
    } catch (error) {
      console.error("Error in addStory:", error);
      return res.status(500).json({ error: "Error creating story", details: error.message, status: 0 });
    }
  });
};

// ✅ Update Story
exports.updateStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, metaTitle, metaKeywords, metaDescription, status } = req.body;

    const story = await Story.findById(id);
    if (!story) return res.status(404).json({ error: "Story not found",status:0 });

    if (title) story.slug = slugify(title, { lower: true, strict: true }) + `-${Date.now()}`;
    if (req.file) story.image = `/uploads/story/${req.file.filename}`;
    Object.assign(story, { title, description, metaTitle, metaKeywords, metaDescription, status });

    await story.save();
    res.status(200).json({ message: "Story updated successfully!", story,status:1 });
  } catch (error) {
    res.status(500).json({ error: "Error updating story",status:0 });
  }
};

// ✅ Delete Story
exports.deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    await Story.findByIdAndDelete(id);
    res.json({ message: "Story deleted successfully!",status:1 });
  } catch (error) {
    res.status(500).json({ error: "Error deleting story",status:0 });
  }
};

// ✅ Update Story Status
exports.updateStoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" ,status:0});
    }
    const story = await Story.findByIdAndUpdate(id, { status }, { new: true });
    if (!story) return res.status(404).json({ error: "Story not found",status:0 });

    res.status(200).json({ message: "Story status updated!", story,status:1 });
  } catch (error) {
    res.status(500).json({ error: "Error updating story status",status:0 });
  }
};

// ✅ Add Sub-Story
const uploadMultiple = multer({ storage }).array("images", 10); // up to 10 images

exports.addSubStory = (req, res) => {
  uploadMultiple(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(500).json({ error: "Image upload failed", details: err.message });
    }

    try {
      const {
        storyId,
        title,
        description,
        long_description,
        metaTitle,
        metaKeywords,
        metaDescription
      } = req.body;

      // Validation
      if (!title || !long_description) {
        return res.status(400).json({
          error: "Validation Error",
          details: "Title and long description are required."
        });
      }

      const story = await Story.findById(storyId);
      if (!story) return res.status(404).json({ error: "Story not found" });

      // Base slug from title
      let baseSlug = slugify(title, { lower: true, strict: true });
      if (!baseSlug) {
        return res.status(400).json({ error: "Invalid title for slug generation." });
      }

      // Generate a unique slug
      let slug = baseSlug;
      let suffix = 1;
      while (story.subStories.some(sub => sub.slug === slug)) {
        slug = `${baseSlug}-${suffix++}`;
      }

      // Image path mapping
      const images = req.files ? req.files.map(file => `/uploads/story/${file.filename}`) : [];
      // Push the new sub-story
      story.subStories.push({
        title,
        slug,
        description,
        long_description,
        images,
        metaTitle,
        metaKeywords,
        metaDescription
      });

      await story.save();

      res.status(200).json({
        message: "Sub-story added successfully!",
        story,
        status: 1
      });

    } catch (error) {
      console.error("Error in addSubStory:", error);
      res.status(500).json({ error: "Error adding sub-story", details: error.message });
    }
  });
};

// ✅ Update Sub-Story
exports.updateSubStory = (req, res) => {
  uploadMultiple(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(500).json({ error: "Image upload failed", details: err.message });
    }

    try {
      const { storyId, subStoryId } = req.params;
      const {
        title,
        description,
        long_description,
        metaTitle,
        metaKeywords,
        metaDescription,
        status
      } = req.body;

      const story = await Story.findById(storyId);
      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }

      const subStory = story.subStories.id(subStoryId);
      if (!subStory) {
        return res.status(404).json({ error: "Sub-story not found" });
      }

      // Update fields if provided
      if (title) {
        subStory.title = title;

        // Slug generation with uniqueness check
        let baseSlug = slugify(title, { lower: true, strict: true });
        let slug = baseSlug;
        let suffix = 1;

        // Make sure other subStories don't have the same slug
        while (
          story.subStories.some(
            sub => sub._id.toString() !== subStoryId && sub.slug === slug
          )
        ) {
          slug = `${baseSlug}-${suffix++}`;
        }

        subStory.slug = slug;
      }

      if (description !== undefined) subStory.description = description;
      if (long_description !== undefined) subStory.long_description = long_description;
      if (metaTitle !== undefined) subStory.metaTitle = metaTitle;
      if (metaKeywords !== undefined) subStory.metaKeywords = metaKeywords;
      if (metaDescription !== undefined) subStory.metaDescription = metaDescription;
      if (status !== undefined) subStory.status = status;

      // Update images if provided
      if (req.files && req.files.length > 0) {
        subStory.images = req.files.map(file => `/uploads/story/${file.filename}`);
      }

      await story.save();

      res.status(200).json({
        message: "Sub-story updated successfully!",
        subStory,
        status: 1
      });

    } catch (error) {
      console.error("Error updating sub-story:", error);
      res.status(500).json({ error: "Error updating sub-story", details: error.message });
    }
  });
};



// ✅ Update Sub-Story Status
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

    res.status(200).json({ message: "Sub-story status updated!", subStory });
  } catch (error) {
    res.status(500).json({ error: "Error updating sub-story status" });
  }
};

// ✅ Delete Sub-Story
exports.deleteSubStory = async (req, res) => {
  try {
    const { storyId, subStoryId } = req.params;
    const story = await Story.findById(storyId);
    if (!story) return res.status(404).json({ error: "Story not found" });

    story.subStories.id(subStoryId).remove();
    await story.save();

    res.status(200).json({ message: "Sub-story deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting sub-story" });
  }
};

exports.getAllStoryCategories = async (req, res) => {
  try{
  const categories = await StoryCategory.find();
  res.status(200).json({'data':categories,message:'All Story Category found',status:1});
  }
   catch (error) {
  res.status(500).json({
    message: error.message,
    status: 0,
  });
}
};
exports.getActiveStoryCategory = async (req, res) => {
  try {
    const categories = await StoryCategory.find({ status: "active" });
    res.status(200).json({
      data: categories,
      message: "Active Story Categories found",
      status: 1,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: 0,
    });
  }
};


exports.getStoryCategoryById = async (req, res) => {
  const { id } = req.params;
  const category = await StoryCategory.findById(id);
  if (!category) return res.status(404).json({ message: "Not Found" });
  res.status(200).json(category);
};

exports.getActiveCategories = async (req, res) => {
  const activeCategories = await Category.find({ status: 'active' });
  res.status(200).json(activeCategories);
};

exports.getAllActiveStories = async (req, res) => {
  try {
    const stories = await Story.find({ status: "active" }); // Assuming "status" field is present
    res.status(200).json({ status: 1, message: "Active stories fetched successfully", data: stories });
  } catch (error) {
    console.error("Error fetching active stories:", error);
    res.status(500).json({ status: 0, message: "Failed to fetch active stories", error: error.message });
  }
};

exports.getAllStories = async (req, res) => {
  try {
    const stories = await Story.find();
    res.status(200).json({ status: 1, message: "All stories fetched successfully", data: stories });
  } catch (error) {
    console.error("Error fetching all stories:", error);
    res.status(500).json({ status: 0, message: "Failed to fetch all stories", error: error.message });
  }
};

exports.getActiveStories = async (req, res) => {
  const stories = await Story.find({ status: 'active' });
  res.status(200).json(stories);
};

exports.getAllSubStories = async (req, res) => {
  const { storyId } = req.params;
  const story = await Story.findById(storyId);
  if (!story) return res.status(404).json({ message: "Story Not Found" });
  res.status(200).json(story.substories);
};

exports.getSubStoryById = async (req, res) => {
  const { storyId } = req.params;
  try {
    const story = await Story.findById(storyId).select('subStories');
    if (!story) return res.status(404).json({ message: "Story Not Found",status:0 });
    res.status(200).json({message:'Sub Story found',data:story.subStories,status:1});
  } catch (error) {
    console.error("Error fetching subStories:", error);
    res.status(500).json({ message: "Server Error",status:0 });
  }
};



exports.getActiveSubStories = async (req, res) => {
  const { storyId } = req.params;
  try {
    const story = await Story.findById(storyId).select('subStories');
    if (!story) return res.status(404).json({ message: "Story Not Found",status:0 });
    res.status(200).json({message:'Sub Story found',data:story.subStories,status:1});
  } catch (error) {
    console.error("Error fetching subStories:", error);
    res.status(500).json({ message: "Server Error",status:0 });
  }
};


exports.getStoryCategory = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    const category = isMongoId
      ? await StoryCategory.findById(idOrSlug)
      : await StoryCategory.findOne({ slug: idOrSlug });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json({ category, status: 1 });
  } catch (error) {
    console.error("Error in getStoryCategory:", error);
    res.status(500).json({ error: "Error fetching category", details: error.message });
  }
};

exports.getStoryData = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    const story = isMongoId
      ? await Story.findById(idOrSlug).populate("category")
      : await Story.findOne({ slug: idOrSlug }).populate("category");

    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    res.status(200).json({ story, status: 1 });
  } catch (error) {
    console.error("Error in getStory:", error);
    res.status(500).json({ error: "Error fetching story", details: error.message });
  }
};

exports.getSubStoryData = async (req, res) => {
  try {
    const { storyIdOrSlug, subStoryIdOrSlug } = req.params;

    const isStoryId = /^[0-9a-fA-F]{24}$/.test(storyIdOrSlug);
    const isSubStoryId = /^[0-9a-fA-F]{24}$/.test(subStoryIdOrSlug);

    const story = isStoryId
      ? await Story.findById(storyIdOrSlug)
      : await Story.findOne({ slug: storyIdOrSlug });

    if (!story) return res.status(404).json({ error: "Story not found" });

    const subStory = story.subStories.find((ss) =>
      isSubStoryId ? ss._id.toString() === subStoryIdOrSlug : ss.slug === subStoryIdOrSlug
    );

    if (!subStory) return res.status(404).json({ error: "Sub-story not found" });

    res.status(200).json({ subStory, status: 1 });
  } catch (error) {
    console.error("Error in getSubStory:", error);
    res.status(500).json({ error: "Error fetching sub-story", details: error.message });
  }
};
