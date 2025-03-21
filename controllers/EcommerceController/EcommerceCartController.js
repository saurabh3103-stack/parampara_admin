const Cart = require("../../models/EcommerceModel/EcommerceCartModel"); // Adjust path as needed

exports.ecomaddToCart = async (req, res) => {
  try {
    console.log(req.body);
    
    let { user_id, product_id, product_name, product_image, product_amount, quantity, productType, username, userphone } = req.body;

    if (!user_id || !product_id || !quantity) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    quantity = Number(quantity); // Ensure quantity is a number

    let cartItem = await Cart.findOne({ user_id, product_id });

    if (cartItem) {
      // Increase the quantity instead of replacing it
      cartItem.quantity += quantity;
      await cartItem.save();
      return res.status(200).json({ success: true, message: "Cart updated", cartItem });
    } else {
      cartItem = new Cart({
        user_id,
        username,
        userphone,
        product_id,
        product_name,
        product_image,
        product_amount,
        quantity,
        productType
      });
      await cartItem.save();
      return res.status(200).json({ success: true, message: "Product added to cart", cartItem });
    }
  } catch (error) {
    console.error("Error adding to cart:", error.message);
    res.status(500).json({ success: false, message: "Error adding to cart", error: error.message });
  }
};


exports.ecomgetCart = async (req, res) => {
  try {
      const { user_id } = req.params;
      console.log("User ID:", user_id); // Debugging log
      if (!user_id) {
          return res.status(400).json({ success: false, message: "User ID is required" });
      }
      const cartItems = await Cart.find({ 'user_id': user_id });
      console.log("Cart Items:", cartItems); // Debugging log
      if (!cartItems || cartItems.length === 0) {
          return res.status(404).json({ success: false, message: "No items found in cart" });
      }
      // Calculate total quantity and total price
      let totalProducts = 0;
      let totalPrice = 0;
      cartItems.forEach(item => {
          const quantity = item.quantity || 1; 
          const price = item.product_amount || 0; 
          totalProducts += quantity;
          totalPrice += quantity * price;
      });

      res.status(200).json({ success: true, cartItems, totalProducts, totalPrice });
  } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching cart data", error: error.message });
  }
};



exports.ecomremoveCartItem = async(req,res)=>{
    try {
        const { user_id, product_id } = req.params;
        await Cart.findOneAndDelete({ user_id, product_id });
    
        res.status(200).json({ success: true, message: "Product removed from cart" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error removing product", error: error.message });
    }
}

exports.ecomclearCart = async (req, res) => {
    try {
      const { user_id } = req.params;
      await Cart.deleteMany({ user_id });
  
      res.status(200).json({ success: true, message: "Cart cleared" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error clearing cart", error: error.message });
    }
  };