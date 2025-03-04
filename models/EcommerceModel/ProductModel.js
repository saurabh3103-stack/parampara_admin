const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Reference to Category Model
      required: true,
    },
    packSize: {
      type: String, 
    },
    weight: {
      type: Number, // In grams or kg
    },
    manufacturer: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    featuredImage: {
      type: String, // Store the URL of the featured image
      required: true,
    },
    galleryImages: [
      {
        type: String, // Store multiple image URLs
      },
    ],
    unit:{
        type:String,
    },
    gst:{
        type:Number,
    },
    local_delivery:{
        type:String,
    },
    short_discription:{
        type:String,
    },
    discription:{
        type:String,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    stock: {
      type: Number,
    },
    quantity: {
      type: Number,
    },
    size: [
      {
        type: String, // Example: ["100g", "250g", "500g"]
      },
    ],
    isFeatured:{
      type:Boolean,
      default:null,
    },
    offer:{
      type:String,
      default:null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt automatically
  }
);

const product = mongoose.model("ECommerceProduct", productSchema);
module.exports = product;
