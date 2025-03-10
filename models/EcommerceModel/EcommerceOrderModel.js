const mongoose = require("mongoose");

const ecommerceOrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  orderStatus: { type: Number, default: 0 }, // 0: Pending, 1: Confirmed
  combinedPaymentId: { type: String, required: true }, // Shared payment ID for multiple orders

  orderDetails: [
    {
      productId: { type: String, required: true },
      productName: { type: String, required: true },
      amount: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],

  userDetails: {
    userId: { type: String, required: true },
    username: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true },
  },

  paymentDetails: {
    totalAmount: { type: Number, required: true }, // Total amount for the order
    transactionId: { type: String, default: null },
    transactionStatus: { type: String, default: "pending" },
    transactionDate: { type: Date, default: null },
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("eCommerceOrderTable", ecommerceOrderSchema);