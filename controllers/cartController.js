const Cart = require("../models/cartModel");

exports.addToCart = async (req, res) => {
    try {
      const {
        user_id,
        username,
        userphone,
        productType,
        product_id,
        product_name,
        product_amount,
        quantity, 
        pooja_date,
        pooja_time,
      } = req.body;
      if (
        !user_id ||
        !username ||
        !userphone ||
        !productType ||
        !product_id ||
        !product_name ||
        !product_amount ||
        !quantity ||
        !pooja_date ||
        !pooja_time
      ) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }
      const quantityNumber = parseInt(quantity, 10);  
      if (isNaN(quantityNumber)) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be a valid number",
        });
      }
      const existingCartItem = await Cart.findOne({
        user_id,
        product_id,
        order_status: 0,
      });
      if (existingCartItem) {
        existingCartItem.quantity += quantityNumber; 
        existingCartItem.pooja_date = pooja_date;
        existingCartItem.pooja_time = pooja_time;
        await existingCartItem.save();
        return res.status(200).json({
          success: true,
          message: "Cart updated successfully",
          cart: existingCartItem,
        });
      }

      const cartItem = new Cart({
        user_id,
        username,
        userphone,
        productType,
        product_id,
        product_name,
        product_amount,
        quantity: quantityNumber,  // Save quantity as a number
        pooja_date,
        pooja_time,
      });

      await cartItem.save();
      res.status(201).json({
        success: true,
        message: "Product added to cart successfully",
        cart: cartItem,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
};

exports.getCartItems = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }
    const cartItems = await Cart.find({ user_id, order_status: 0 });
    res.status(200).json({
      success: true,
      cart: cartItems,
    });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.removeCartItem = async (req, res) => {
    try {
      const { cart_id } = req.params;
      if (!cart_id) {
        return res.status(400).json({
          success: false,
          message: "cart_id is required",
        });
      }
      const cartItem = await Cart.findByIdAndDelete(cart_id);
      if (!cartItem) {
        return res.status(404).json({
          success: false,
          message: "Cart item not found",
        });
      }
      res.status(200).json({
        success: true,
        message: "Cart item removed successfully",
      });
    } catch (error) {
      console.error("Error removing cart item:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
};
  
exports.removeAllCartItems = async (req, res) => {
    try {
      const { user_id } = req.params;
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: "user_id is required",
        });
      }
      const result = await Cart.deleteMany({ user_id, order_status: 0 });
      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "No cart items found for the user",
        });
      }
      res.status(200).json({
        success: true,
        message: `${result.deletedCount} cart item(s) removed successfully`,
      });
    } catch (error) {
      console.error("Error removing all cart items:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
};
  