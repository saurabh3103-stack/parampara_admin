const mongoose = require("mongoose");

const ecommerceOrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  orderStatus: {
    type: Number,
    default: 0, // 0: Pending, 1: Confirmed, 2: Completed, etc.
  },
  orderDetails: {
    productId: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
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
  paymentDetails: {
    amount: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  transactionDetails: {
    transactionId: {
      type: String,
      default: null,
    },
    transactionStatus: {
      type: String,
      default: null,
    },
    transactionDate: {
      type: Date,
      default: null, 
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the model
module.exports = mongoose.model("eCommerceOrder", ecommerceOrderSchema);
