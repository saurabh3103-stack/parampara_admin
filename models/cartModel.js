const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    username: {
      type: String,
      required: true,
    },
    userphone: {
      type: String,
      required: true,
    },
    productType:{
        type:String,
        required:true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    product_name: {
      type: String,
      required: true,
    },
    product_amount: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    order_status: {
      type: Number,
      default: 0,
    },
    pooja_date: {
      type: Date,
      required: true,
    },
    pooja_time: {
      type: String,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
      expires: 7 * 24 * 60 * 60, // 7 days expiry
    },
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
