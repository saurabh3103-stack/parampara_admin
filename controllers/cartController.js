const Cart = require("../models/cartModel");

exports.addToCart = async (req, res) => {
  console.log(req.body);
  try {
    const {
      user_id,
      username,
      userphone,
      productType,
      product_id,
      product_name,
      product_image,
      product_amount,
      quantity,
      pooja_date,
      pooja_time,
      isSamagri,  // Add isSamagri field to the request body
    } = req.body;

    // Validate required fields
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

    // Validate quantity
    const quantityNumber = parseInt(quantity, 10);  
    if (isNaN(quantityNumber)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid number",
      });
    }

   

    // Check for existing cart item
    const existingCartItem = await Cart.findOne({
      user_id,
      product_id,
      order_status: 0,
    });

    if (existingCartItem) {
      existingCartItem.quantity += quantityNumber;  // Update the quantity
      existingCartItem.pooja_date = pooja_date;
      existingCartItem.pooja_time = pooja_time;
      existingCartItem.isSamagri = isSamagri; // Update isSamagri value
      await existingCartItem.save();
      return res.status(200).json({
        success: true,
        message: "Cart updated successfully",
        cart: existingCartItem,
      });
    }

    // Create a new cart item
    const cartItem = new Cart({
      user_id,
      username,
      userphone,
      productType,
      product_id,
      product_name,
      product_image,
      product_amount,
      quantity: quantityNumber,  // Save quantity as a number
      pooja_date,
      pooja_time,
      isSamagri, // Save isSamagri value
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
    const { id } = req.params; // Extract user_id from URL parameters
    if (!id) {
      return res.status(400).json({
        success: 0,
        message: "user_id is required",
      });
    }
    const cartItems = await Cart.find({ user_id: id, order_status: 0 });
    res.status(200).json({
      success: 1,
      cart: cartItems,
    });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({
      success: 0,
      message: "Internal server error",
    });
  }
};


exports.removeCartItem = async (req, res) => {
  try {
    const { product_id, user_id } = req.params;
    if (!product_id || !user_id) {
      return res.status(400).json({
        success: false,
        message: "product_id and user_id are required",
      });
    }
    const cartItem = await Cart.findOneAndDelete({ 
      product_id, 
      user_id 
    });
    if (!cartItem) {
      return res.status(200).json({
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
