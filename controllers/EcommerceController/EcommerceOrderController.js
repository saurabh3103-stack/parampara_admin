const eCommerceOrder = require('../../models/EcommerceModel/EcommerceOrderModel');

const generateNumericUUID = () => {    
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:.TZ]/g, '').slice(8, 14); // Extract HHMMSS from ISO format
    return `${timestamp}`;
};
  
exports.createOrder = async (req, res) => {
    console.log(req.body);
    try {
      const orderId="ORDER" + generateNumericUUID();
      const { productId, productName, userId, username, contactNumber, email, amount, quantity } = req.body;
      const newOrder = new eCommerceOrder({
        orderId: orderId, 
        orderStatus: 0, 
        orderDetails: { productId, productName },
        userDetails: { userId, username, contactNumber, email },
        paymentDetails: { amount, quantity },
      });
      await newOrder.save();
      console.log(newOrder);
      res.status(200).json({ message: "Order created successfully", order: newOrder, status: 1 });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "Error creating order", error: error.message, status: 0 });
    }
};

exports.updateOrder = async (req, res) => {
    console.log(req.body);
    try {
      const { orderId } = req.params;
      const { transactionId, transactionStatus, transactionDate } = req.body;
      const updatedOrder = await eCommerceOrder.findOneAndUpdate(
        { orderId },
        {
          orderStatus: 1, // Changing status to Confirmed
          transactionDetails: {
            transactionId,
            transactionStatus,
            transactionDate: transactionDate || new Date(),
          },
        },
        { new: true }
      );
  
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found", status: 0 });
      }
  
      console.log(updatedOrder);
      res.status(200).json({ message: "Order updated successfully", order: updatedOrder, status: 1 });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "Error updating order", error: error.message, status: 0 });
    }
};