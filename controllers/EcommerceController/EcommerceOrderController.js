const eCommerceOrder = require('../../models/EcommerceModel/EcommerceOrderModel');
const { sendOrderNotification,sendOrderStatusUpdateNotification,
  sendPaymentStatusUpdateNotification,
} = require('../../utils/notificationUtils');
const mongoose = require('mongoose');
const { sendEmail } = require('../../utils/emailUtils'); // Add this at the top
const User = require('../../models/userModel')


const generateNumericUUID = () => {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:.TZ]/g, '')
    .slice(8, 14); // Extract HHMMSS
  return `${timestamp}`;
};

exports.createOrder = async (req, res) => {
  console.log(req.body);
  try {
    const orderId = 'ORDER' + generateNumericUUID();
    const {
      userId,
      username,
      contactNumber,
      email,
      products,
      combinedPaymentId,
      fcm_tokken,
    } = req.body;
    console.log(req.body);
    // Validate products array
    if (!Array.isArray(products)) {
      return res
        .status(400)
        .json({ message: 'Products must be an array', status: 0 });
    }

    // Calculate total amount
    const totalAmount = products.reduce(
      (sum, item) => sum + item.amount * item.quantity,
      0,
    );

    // Create new order
    const newOrder = new eCommerceOrder({
      orderId: orderId,
      orderStatus: 0, // Pending
      combinedPaymentId: combinedPaymentId, // Shared payment ID
      orderDetails: products.map(
        ({ productId, productName, amount, quantity }) => ({
          productId,
          productName,
          amount,
          quantity,
        }),
      ),
      userDetails: { userId, username, contactNumber, email },
      paymentDetails: { totalAmount },
    });

    await newOrder.save();
    console.log(newOrder);
    await sendOrderNotification(fcm_tokken, newOrder);
    try {
      await sendEmail(
        email,
        `Your Order #${orderId} has been placed`,
        'Ecom/order_placed',
        {
          orderId,
          orderDetails: products,
          totalAmount,
          username,
          contactNumber
        }
      );
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
    }
    res
      .status(200)
      .json({
        message: 'Order created successfully',
        order: newOrder,
        status: 1,
      });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({
        message: 'Error creating order',
        error: error.message,
        status: 0,
      });
  }
};

exports.updateOrderPayment = async (req, res) => {
  console.log(req.body);
  try {
    const { combinedPaymentId } = req.params;
    const { transactionId, transactionStatus, transactionDate, fcm_tokken } =
      req.body;

    // Validate transaction status
    if (!['pending', 'completed', 'failed'].includes(transactionStatus)) {
      return res
        .status(400)
        .json({ message: 'Invalid transaction status', status: 0 });
    }

    // Update payment details for all orders with the same combinedPaymentId
    const updatedOrders = await eCommerceOrder.updateMany(
      { combinedPaymentId },
      {
        orderStatus: 'pending',
        'paymentDetails.transactionId': transactionId,
        'paymentDetails.transactionStatus': transactionStatus,
        'paymentDetails.transactionDate': transactionDate || new Date(),
      },
      { new: true },
    );

    if (updatedOrders.modifiedCount === 0) {
      return res
        .status(404)
        .json({
          message: 'No orders found with the provided payment ID',
          status: 0,
        });
    }

    const notificationSent = await sendPaymentStatusUpdateNotification(
      fcm_tokken,
      combinedPaymentId,
      transactionStatus,
    );
    if (!notificationSent) {
      console.log('Failed to send notification for payment update.');
    }

    res
      .status(200)
      .json({
        message: 'Payment updated successfully for all orders',
        status: 1,
      });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({
        message: 'Error updating payment',
        error: error.message,
        status: 0,
      });
  }
};

exports.geteStoreOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    let order = await eCommerceOrder.findOne({ orderId: orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order Not Found' });
    }
    return res.status(200).json({ order: order, status: 1 });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error in fetching Data', error: error.message });
  }
};

exports.geteStoreAllOrder = async (req, res) => {
  try {
    let order = await eCommerceOrder.find();
    if (!order) {
      return res.status(200).json({ message: 'Order Not Found' });
    }
    return res.status(200).json({ orderData: order, message: 'Data found' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error in fetching data', error: error.message });
  }
};

exports.getAllOrderUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    let order = await eCommerceOrder.find({ 'userDetails.userId': userId });
    if (!order) {
      return res.status(200).json({ message: 'No Order Found', status: 1 });
    }
    return res
      .status(200)
      .json({ orderData: order, message: 'Order Found', status: 1 });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error in fetching data', error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  console.log("update api called up")
  try {
    const { orderId } = req.params; // Extract orderId from request parameters
    const { orderStatus, fcm_tokken } = req.body; // Extract the new order status
    const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    if (!orderStatus || !validStatuses.includes(orderStatus.toLowerCase())) {
      return res
        .status(400)
        .json({ message: 'Invalid order status', status: 0 });
    }
    let order = await eCommerceOrder.findOne({ orderId });
    console.log(order.userDetails);
    if (!order) {
      return res.status(404).json({ message: 'Order not found', status: 0 });
    }
    order.orderStatus = orderStatus.toLowerCase();
    await order.save();

    await sendOrderStatusUpdateNotification(
      fcm_tokken,
      orderId,
      order.orderStatus,
    );
    try {
      await sendEmail(
        order.userDetails.email,
        `Update for your Order #${orderId}`,
        'Ecom/order_status_update',
        {
          orderId,
          orderStatus: order.orderStatus,
          username: order.userDetails.username
        }
      );
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
    }
    res
      .status(200)
      .json({
        message: 'Order status updated successfully',
        orderStatus: order.orderStatus,
        status: 1,
      });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({
        message: 'Error updating order status',
        error: error.message,
        status: 0,
      });
  }
};

exports.updateMultipleOrderStatuses = async (req, res) => {
  try {
    const { orders } = req.body;
    
    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ message: 'Invalid orders array', status: 0 });
    }

    const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    const bulkUpdateOps = [];
    const userIDs = [];
    const orderMap = {}; // To store orderId & corresponding userId

    // Extract order IDs and user IDs
    for (const order of orders) {
      if (!order.orderId || !order.orderStatus || !validStatuses.includes(order.orderStatus.toLowerCase())) {
        return res.status(400).json({ message: `Invalid data for order: ${order.orderId}`, status: 0 });
      }
      bulkUpdateOps.push({
        updateOne: {
          filter: { orderId: order.orderId },
          update: { $set: { orderStatus: order.orderStatus.toLowerCase() } },
        },
      });

      userIDs.push(order.userDetails?.userId);
      orderMap[order.userDetails?.userId] = order.orderId; // Map user ID to order ID
    }

    // Fetch users whose `_id` matches any ID in `userIDs`
    const userObjectIds = userIDs.map(id => new mongoose.Types.ObjectId(id));
    const users = await User.find({ _id: { $in: userObjectIds } });

    // Create a map of userId -> FCM Token
    const userFcmTokens = users.reduce((acc, user) => {
      if (user.fcm_tokken) acc[user._id.toString()] = user.fcm_tokken;
      return acc;
    }, {});

    // Perform bulk order status update
    if (bulkUpdateOps.length > 0) {
      const result = await eCommerceOrder.bulkWrite(bulkUpdateOps);

      // Send notifications concurrently
      const notificationPromises = Object.entries(userFcmTokens).map(([userId, fcmToken]) => {
        const orderId = orderMap[userId]; // Get order ID for this user
        return sendOrderStatusUpdateNotification(fcmToken, orderId, orders.find(o => o.orderId === orderId)?.orderStatus);
      });
      const emailPromises = Object.entries(userEmails).map(([userId, email]) => {
        const orderId = orderMap[userId];
        const status = orders.find(o => o.orderId === orderId)?.orderStatus;
        if (email && status) {
          return sendEmail(
            email,
            `Update for your Order #${orderId}`,
            'Ecom/order_status_update',
            {
              orderId,
              orderStatus: status,
              username: users.find(u => u._id.toString() === userId)?.username
            }
          ).catch(emailError => {
            console.error(`Failed to send email for order ${orderId}:`, emailError);
          });
        }
      });
      await Promise.all([...notificationPromises, ...emailPromises]);

      return res.status(200).json({
        message: 'Order statuses updated successfully',
        result,
        status: 1,
      });
    }

    return res.status(400).json({ message: 'No valid updates found', status: 0 });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: 'Error updating orders',
      error: error.message,
      status: 0,
    });
  }
};