const mongoose = require("mongoose");

const commissionSchema = new mongoose.Schema({
  target: {
    type: String,
    required: true,
    enum: ["mandali", "pandit"],  // Only these two allowed
    unique: true                  // Prevent duplicates
  },
  commision: {
    type: Number,
    required: true
  },
  commision_type: {
    type: String,
    enum: ["percentage", "fixed"],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Automatically update the updatedAt field on save
commissionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Commission = mongoose.model("Commission", commissionSchema);

module.exports = Commission;