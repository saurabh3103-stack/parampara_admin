const eCommerceOrder = require("../../models/EcommerceModel/EcommerceOrderModel");

const generateNumericUUID = () => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:.TZ]/g, '').slice(8, 14); // Extract HHMMSS
  return `${timestamp}`;
};

exports.createOrder = async (req, res) => {
  console.log(req.body);
  try {
    const orderId = "ORDER" + generateNumericUUID();
    const { userId, username, contactNumber, email, products, combinedPaymentId } = req.body;

    // Validate products array
    if (!Array.isArray(products)) {
      return res.status(400).json({ message: "Products must be an array", status: 0 });
    }

    // Calculate total amount
    const totalAmount = products.reduce((sum, item) => sum + (item.amount * item.quantity), 0);

    // Create new order
    const newOrder = new eCommerceOrder({
      orderId: orderId,
      orderStatus: 0, // Pending
      combinedPaymentId: combinedPaymentId, // Shared payment ID
      orderDetails: products.map(({ productId, productName, amount, quantity }) => ({
        productId,
        productName,
        amount,
        quantity,
      })),
      userDetails: { userId, username, contactNumber, email },
      paymentDetails: { totalAmount },
    });

    await newOrder.save();
    console.log(newOrder);
    res.status(200).json({ message: "Order created successfully", order: newOrder, status: 1 });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Error creating order", error: error.message, status: 0 });
  }
};

exports.updateOrderPayment = async (req, res) => {
  console.log(req.body);
  try {
    const { combinedPaymentId } = req.params;
    const { transactionId, transactionStatus, transactionDate } = req.body;

    // Validate transaction status
    if (!["pending", "completed", "failed"].includes(transactionStatus)) {
      return res.status(400).json({ message: "Invalid transaction status", status: 0 });
    }

    // Update payment details for all orders with the same combinedPaymentId
    const updatedOrders = await eCommerceOrder.updateMany(
      { combinedPaymentId },
      {
        orderStatus: "pending", 
        "paymentDetails.transactionId": transactionId,
        "paymentDetails.transactionStatus": transactionStatus,
        "paymentDetails.transactionDate": transactionDate || new Date(),
      },
      { new: true }
    );

    if (updatedOrders.modifiedCount === 0) {
      return res.status(404).json({ message: "No orders found with the provided payment ID", status: 0 });
    }

    console.log(updatedOrders);
    res.status(200).json({ message: "Payment updated successfully for all orders", status: 1 });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Error updating payment", error: error.message, status: 0 });
  }
};

exports.geteStoreOrder = async (req,res)=>{
  try {
    const {orderId} = req.params
    let order = await eCommerceOrder.findOne({orderId:orderId});
    if(!order){
      return res.status(404).json({message:"Order Not Found"});
    }
      return res.status(200).json({order:order,status:1});
  } catch (error){
    res.status(500).json({message:"Error in fetching Data",error:error.message});
  }
}

exports.geteStoreAllOrder = async (req,res) =>{
  try {
    let order = await eCommerceOrder.find();
    if(!order){
      return res.status(200).json({message:"Order Not Found"});
    }
    return res.status(200).json({orderData:order,message:"Data found"});
  }
  catch (error){
    res.status(500).json({message:"Error in fetching data",error:error.message});
  }
}

exports.getAllOrderUserId = async (req,res)=>{
  try{
    const {userId} = req.params;
    let order = await eCommerceOrder.find({'userDetails.userId':userId});
    if(!order){
      return res.status(200).json({message:"No Order Found",status:1});
    }
    return res.status(200).json({orderData:order,message:"Order Found",status:1});
  }catch(error){
    res.status(500).json({message:"Error in fetching data",error:error.message});
  }
}

exports.updateOrderStatus = async (req, res) => {
  try {
    console.log(req.body);
    const { orderId } = req.params; // Extract orderId from request parameters
    const { orderStatus } = req.body; // Extract the new order status
    const validStatuses = ["pending", "shipped", "delivered", "cancelled"];
    if (!orderStatus || !validStatuses.includes(orderStatus.toLowerCase())) {
      return res.status(400).json({ message: "Invalid order status", status: 0 });
    }
    let order = await eCommerceOrder.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found", status: 0 });
    }
    order.orderStatus = orderStatus.toLowerCase();
    await order.save();
    res.status(200).json({ message: "Order status updated successfully", orderStatus: order.orderStatus, status: 1 });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Error updating order status", error: error.message, status: 0 });
  }
};

exports.updateMultipleOrderStatuses = async (req, res) => {
  try {
    console.log(req.body);
    const { orders } = req.body; // Expecting an array of order updates

    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ message: "Invalid orders array", status: 0 });
    }

    const validStatuses = ["pending", "shipped", "delivered", "cancelled"];
    const bulkUpdateOps = [];

    for (const order of orders) {
      const { orderId, orderStatus } = order;

      if (!orderId || !orderStatus || !validStatuses.includes(orderStatus.toLowerCase())) {
        return res.status(400).json({ message: `Invalid data for order: ${orderId}`, status: 0 });
      }

      bulkUpdateOps.push({
        updateOne: {
          filter: { orderId },
          update: { $set: { orderStatus: orderStatus.toLowerCase() } },
        },
      });
    }

    if (bulkUpdateOps.length > 0) {
      const result = await eCommerceOrder.bulkWrite(bulkUpdateOps);
      return res.status(200).json({ message: "Order statuses updated successfully", result, status: 1 });
    }

    return res.status(400).json({ message: "No valid updates found", status: 0 });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Error updating orders", error: error.message, status: 0 });
  }
};
