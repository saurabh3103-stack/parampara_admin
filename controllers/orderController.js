const { v4: uuidv4 } = require("uuid");
const PoojaBooking = require("../models/PoojaBooking");
const DeliveryAddress = require("../models/DeliveryAddress");
const admin = require("../config/firebase");
const pandit = require("../models/panditModel");
const User = require("../models/userModel");
const generateNumericUUID = () => {
    const uuid = uuidv4().replace(/-/g, ''); // Remove hyphens
    const numericId = uuid.split('').map(char => char.charCodeAt(0) % 10).join(''); // Convert each character to a number
    return numericId;
  };
    
// Create Pooja Booking

const createPoojaBooking = async (req, res) => {
  console.log(req.body);
  try {
    const {
      poojaId,
      poojaName,
      poojaType,
      isSamagriIncluded,
      date,
      time,
      userId,
      username,
      contactNumber,
      email,
      amount,
      quantity,
    } = req.body;
    const newPoojaBooking = new PoojaBooking({
      bookingId: generateNumericUUID(),
      poojaDetails: {
        poojaId,
        poojaName,
        poojaType,
        isSamagriIncluded,
      },
      userDetails: {
        userId,
        username,
        contactNumber,
        email,
      },
      schedule: {
        date,
        time,
      },
      paymentDetails: {
        amount,
        quantity,
      },
    });
    await newPoojaBooking.save();
    console.log(newPoojaBooking);
    res.status(201).json({
      message: "Pooja booking created successfully",
      poojaBooking: newPoojaBooking,
      status: 1,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Error creating Pooja booking",
      error: error.message,
      status: 0,
    });
  }
};
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Assign a Pandit and keep trying until one accepts the booking
const assignPandit = async (poojaBooking, userLat, userLong, res, index = 0) => {
  try {
    let pandits = await pandit.find();
    if (!pandits.length) {
      return res.status(404).json({ message: "No available Pandits", status: 0 });
    }

    // Sort Pandits by distance (nearest first)
    pandits = pandits
      .map((pandit) => ({
        ...pandit._doc,
        distance: getDistance(userLat, userLong, pandit.latitude, pandit.longitude),
      }))
      .sort((a, b) => a.distance - b.distance); // Nearest first

    if (index >= pandits.length) {
      return res.status(200).json({ message: "No Pandit accepted the booking.", status: 0 });
    }

    const currentPandit = pandits[index];

    console.log(`📩 Sending request to Pandit ${currentPandit.name} (Distance: ${currentPandit.distance} km)`);

    // Send Notification to Pandit
    const notificationSent = await sendNotificationToPandit(currentPandit.fcm_tokken, poojaBooking);

    if (notificationSent) {
      // Wait for Pandit's response via `acceptRejectBooking`
      console.log(`⏳ Waiting for response from Pandit ${currentPandit.name}...`);
    } else {
      console.log(`❌ Failed to send notification to Pandit ${currentPandit.name}, trying next one.`);
      assignPandit(poojaBooking, userLat, userLong, res, index + 1);
    }
  } catch (error) {
    console.error("❌ Error assigning Pandit:", error.message);
    res.status(500).json({ message: "Error assigning Pandit", error: error.message, status: 0 });
  }
};

// Send notification to Pandit
const sendNotificationToPandit = async (fcmToken, poojaBooking) => {
  if (!fcmToken) {
    console.log("❌ No FCM token available for this Pandit.");
    return false;
  }

  const message = {
    token: fcmToken,
    notification: {
      title: "New Pooja Booking",
      body: `New booking request (ID: ${poojaBooking.bookingId}). Accept or reject.`,
    },
    data: {
      booking_id: poojaBooking.bookingId.toString(),
      click_action: "OPEN_ACTIVITY",
    },
    android: {
      priority: "high",
      notification: {
        sound: "default",
        click_action: "OPEN_ACTIVITY",
        channel_id: "FCM_CHANNEL_ID",
      },
    },
  };

  try {
    await admin.messaging().send(message);
    console.log(`📩 Notification sent to Pandit with token: ${fcmToken}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending notification:", error.message);
    return false;
  }
};

// Accept or Reject Booking
const acceptRejectBooking = async (req, res) => {
  try {
    const { panditId, bookingId, status, userLat, userLong } = req.body;

    if (!panditId || !bookingId || status === undefined) {
      return res.status(400).json({ message: "Missing required fields", status: 0 });
    }

    const poojaBooking = await PoojaBooking.findOne({ bookingId });
    if (!poojaBooking) {
      return res.status(404).json({ message: "Pooja booking not found", status: 0 });
    }

    if (status === 1) {
      // Pandit accepted
      poojaBooking.panditId = panditId;
      poojaBooking.bookingStatus = 2; // Confirmed
      await poojaBooking.save();
      const user = await User.findOne({_id: poojaBooking.userId});
      if (user && user.fcm_tokken) {
        await sendNotificationToUser(user.fcm_tokken, bookingId);
      }

      return res.status(200).json({ message: "Booking accepted.", status: 1 });
    } else {
      // Pandit rejected, assign next Pandit
      assignPandit(poojaBooking, userLat, userLong, res, req.body.index + 1);
      return res.status(200).json({ message: "Booking Send New Pandit.", status: 1 });
    }
  } catch (error) {
    console.error("❌ Error processing accept/reject booking:", error.message);
    res.status(500).json({ message: "Error processing booking", error: error.message, status: 0 });
  }
};

// Update Pooja Booking and Start Assigning Pandit
const updatePoojaBooking = async (req, res) => {
  console.log(req.body);
  try {
    const { bookingId, transactionId, transactionStatus, transactionDate, userLat, userLong } = req.body;

    if (!bookingId || !transactionId || !transactionStatus || !transactionDate || !userLat || !userLong) {
      return res.status(400).json({ message: "Missing required fields", status: 0 });
    }

    const poojaBooking = await PoojaBooking.findOne({ bookingId });
    if (!poojaBooking) {
      return res.status(404).json({ message: "Pooja booking not found", status: 0 });
    }

    poojaBooking.bookingStatus = 1; // Mark as confirmed
    poojaBooking.transactionDetails = { transactionId, transactionStatus, transactionDate };
    await poojaBooking.save();

    // Start finding an available Pandit
    assignPandit(poojaBooking, userLat, userLong, res);
    res.status(200).json({message: "Booking Confirm", status: 1})
  } catch (error) {
    console.error("❌ Error updating Pooja booking:", error.message);
    res.status(500).json({ message: "Error updating Pooja booking", error: error.message, status: 0 });
  }
};

// sEND NOTIFICATION TO USER 

const sendNotificationToUser = async (userFcmToken, bookingId) => {
  const message = {
    message: {
      token: userFcmToken,
      notification: {
        title: "Booking Confirmed",
        body: `Your booking (ID: ${bookingId}) has been accepted by the Pandit.`,
      },
      data: {
        booking_id: bookingId.toString(),
        click_action: "OPEN_ACTIVITY",
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
          click_action: "OPEN_ACTIVITY",
          channel_id: "FCM_CHANNEL_ID",
        },
      },
    },
  };

  try {
    await admin.messaging().send(message.message);
    console.log(`📩 Notification sent to User with token: ${userFcmToken}`);
  } catch (error) {
    console.error("❌ Error sending notification to User:", error.message);
  }
};


// Get Product Order Details
const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await PoojaBooking.findOne({ bookingId: orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving order", error: error.message });
  }
};

// Add Delivery Address
const addDeliveryAddress = async (req, res) => {
    try {
      // Destructuring the input from request body
      const { OrderId, DeliveryAddress: AddressDetails } = req.body;
  
      // Validation for required fields
      if (!OrderId || !AddressDetails || !AddressDetails.AddressLine1 || !AddressDetails.Location || !AddressDetails.Latitude || !AddressDetails.Longitude || !AddressDetails.City || !AddressDetails.State || !AddressDetails.PostalCode || !AddressDetails.Country) {
        return res.status(400).json({ message: "Missing required fields in the delivery address" });
      }
  
      // Create a new DeliveryAddress entry
      const newDelivery = new DeliveryAddress({
        DeliveryId: uuidv4(),
        OrderId,
        DeliveryAddress: AddressDetails,
      });
  
      // Save the new delivery address to the database
      await newDelivery.save();
  
      // Respond with success message and the newly created delivery address
      res.status(200).json({
        message: "Delivery address added successfully",
        delivery: newDelivery,
        status:1
      });
    } catch (error) {
      // Handle errors and send back error message
      res.status(500).json({
        message: "Error adding delivery address",
        error: error.message,
        status:0
      });
    }
};
  

// Get Delivery Address
const getDeliveryAddress = async (req, res) => {
  try {
    const { orderId } = req.params;
    const delivery = await DeliveryAddress.findOne({ OrderId: orderId });

    if (!delivery) {
      return res.status(404).json({ message: "Delivery address not found" });
    }

    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving delivery address", error: error.message });
  }
};

const getAllOrders = async (req, res) => {
    try {
      const orders = await PoojaBooking.find(); // Fetch all orders from the database
  
      if (orders.length === 0) {
        return res.status(404).json({ message: "No orders found" });
      }
  
      res.json(orders); // Send all orders in the response
    } catch (error) {
      res.status(500).json({ message: "Error retrieving orders", error: error.message });
    }
};

const getAllOrdersWithAddress = async (req, res) => {
    try {
      const orders = await PoojaBooking.find(); // Fetch all orders
  
      // For each order, find the corresponding delivery address
      const ordersWithAddresses = await Promise.all(orders.map(async (order) => {
        const delivery = await DeliveryAddress.findOne({ OrderId: order.OrderId });
        return {
          ...order.toObject(),
          DeliveryAddress: delivery ? delivery.DeliveryAddress : null,
        };
      }));
  
      if (ordersWithAddresses.length === 0) {
        return res.status(404).json({ message: "No orders found" });
      }
  
      res.json(ordersWithAddresses); // Send orders along with delivery address
    } catch (error) {
      res.status(500).json({ message: "Error retrieving orders with addresses", error: error.message });
    }
  };
 
const getPoojaOrdersByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required", status: 0 });
        }

        // Fetch orders by userId
        const userOrders = await PoojaBooking.find({ "userDetails.userId": userId });

        if (!userOrders || userOrders.length === 0) {
            return res.status(404).json({ message: "No orders found for this user", status: 0 });
        }

        res.status(200).json({
            message: "User orders retrieved successfully",
            orders: userOrders,
            status: 1,
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving user orders", error: error.message, status: 0 });
    }
};
  
module.exports = {
  createPoojaBooking,
  getOrder,
  addDeliveryAddress,
  getDeliveryAddress,
  getAllOrders,
  getAllOrdersWithAddress,
  updatePoojaBooking,
  getPoojaOrdersByUserId,
  acceptRejectBooking,
};