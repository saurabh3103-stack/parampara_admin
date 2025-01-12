const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  OrderId: {
    type: String,
    required: true,
    unique: true,
  },
  ProductId: {
    type: String,
    required: true,
  },
  ProductName: {
    type: String,
    required: true,
  },
  Amount: {
    type: Number,
    required: true,
  },
  Quantity: {
    type: Number,
    required: true,
  },
  ProductType: {
    type: String,
    required: true,
  },
  Date: {
    type: String, // Stored as a string (e.g., "2025-01-10")
    default: null,
  },
  Time: {
    type: String, // Stored as a string (e.g., "10:30 AM")
    default: null,
  },
  User: {
    UserId: {
      type: String,
      required: true,
    },
    Username: {
      type: String,
      required: true,
    },
    ContactNumber: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
    },
  },
  CreatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the model
module.exports = mongoose.model("Order", orderSchema);