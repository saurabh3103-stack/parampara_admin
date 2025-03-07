const mongoose = require("mongoose");

const ecomCartSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
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
      type: String,
      required: true,
      ref: "Product",
    },
    product_name: {
      type: String,
      required: true,
    },
    product_image:{
      type: String,
      required: null,
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

const EcommerceCartModel = mongoose.model("EcommerceCart", ecomCartSchema);

module.exports = EcommerceCartModel;
