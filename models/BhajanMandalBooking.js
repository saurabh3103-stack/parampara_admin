const mongoose = require("mongoose");

const bhajanBookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        required: true,
        unique: true,
      },
      bookingStatus: {
        type: Number,
        default: 0, // 0: Pending, 1: Confirmed, 2: Completed, etc.
      },
      bookingDetails: {
        mandaliId: {
          type: String,
          required: true,
        },
        mandaliName: {
          type: String,
          required: true,
        },
        Type: {
          type: String,
          default: true, // Example: "Havan", "Jaap", etc.
        },
      },
      userDetails: {
        userId: {
          type: String,
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        contactNumber: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          required: true,
        },
      },
      schedule: {
        date: {
          type: String, // Stored as a string (e.g., "2025-01-10")
          default: null,
        },
        time: {
          type: String, // Stored as a string (e.g., "10:30 AM")
          default: null,
        },
      },
      paymentDetails: {
        amount: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true, // Example: number of priests or offerings
        },
      },
      transactionDetails: {
        transactionId: {
          type: String,
          default: null, // Default to null if no transaction has occurred
        },
        transactionStatus: {
          type: String,
          default: null, // Example: "Pending", "Successful", "Failed"
        },
        transactionDate: {
          type: Date,
          default: null, // Default to null if no transaction date is recorded
        },
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
});

module.exports = mongoose.model("BhajanMndalBooking",bhajanBookingSchema);