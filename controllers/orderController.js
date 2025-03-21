const { v4: uuidv4 } = require("uuid");
const PoojaBooking = require("../models/PoojaBooking");
const DeliveryAddress = require("../models/DeliveryAddress");
const admin = require("../config/firebase");
const pandit = require("../models/panditModel");
const User = require("../models/userModel");
const MandaliBooking = require("../models/BhajanMandalBooking");
const PanditCategory = require('../models/panditCategoryModel');

const generateNumericUUID = () => {
  const uuid = uuidv4().replace(/-/g, ''); // Remove hyphens
  const numericId = uuid.split('')
      .map(char => char.charCodeAt(0) % 10) 
      .join('')
      .slice(0, 4);
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:.TZ]/g, '').slice(8, 14); // Extract HHMMSS from ISO format
  return `${timestamp}`;
};
    
// Create Pooja Booking

const createPoojaBooking = async (req, res) => {
  console.log(req.body);
  try {
    const { poojaId,poojaName,poojaType,isSamagriIncluded,date,time,userId,
      username,contactNumber,email,amount,quantity,} = req.body;
    const newPoojaBooking = new PoojaBooking({
      bookingId: 'POOJA'+generateNumericUUID(),
      bookingDetails: {poojaId,poojaName,Type:"Pooja",isSamagriIncluded,},
      userDetails: {userId,username,contactNumber,email,},
      schedule: {date,time,},
      paymentDetails: {amount,quantity,},
    });
    await newPoojaBooking.save();
    console.log(newPoojaBooking);
    res.status(201).json({message: "Pooja booking created successfully",poojaBooking: newPoojaBooking,status: 1,});
  } catch (error) {
    console.log(error.message);
    res.status(500).json({message: "Error creating Pooja booking",error: error.message,status: 0,
    });
  }
};

// Bhajan Mandali Booking
const createBhanjanMandaliBooking = async (req,res)=>{
  console.log(req.body);
  try{
    const {mandaliId,mandaliName,mandaliType,userId,username,contactNumber,
      email,date,time,amount,quantity
    }=req.body;
    const newBhajanBooking = new MandaliBooking({
        bookingId:'BHJAN'+generateNumericUUID(),
        bookingDetails: {mandaliId,mandaliName,Type:mandaliType},
        userDetails: {userId,username,contactNumber,email,},
        schedule: {date,time,},
        paymentDetails: {amount,quantity,},
      }); 
    await newBhajanBooking.save();
    console.log(newBhajanBooking);
    res.status(201).json({message : "Bhajan Mandal Booking Created Successfully",bhajanbooking:newBhajanBooking,status:1});
  }catch (error){
    console.log(error.message);
    res.status(500).json({message: "Error creating Pooja booking",error: error.message,status: 0,
    });
  }  
};

const getBhajanOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await MandaliBooking.findOne({ bookingId: orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving order", error: error.message });
  }
};



// Bhajan Mandali Booking End
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
// Assign Pandit 
const assignPandit = async (poojaBooking, userLat, userLong, index) => {
  try {
    const poojaId = poojaBooking.bookingDetails.poojaId;
    let panditCategories = await PanditCategory.find({ pooja_id: poojaId });
    if (!panditCategories.length) {
      return { status: 404, message: "No Pandit category found for this pooja.", accepted: false };
    }
    let panditIds = panditCategories.map(category => category.pandit_id);
    let matchedPandits = await pandit.find({ _id: { $in: panditIds },'profile_status':'active'});
    if (!matchedPandits.length) {
      console.log('Wait for admin approval');
      return { status: 404, message: "No matching Pandits found", accepted: false };
    }
    matchedPandits = matchedPandits.map(pandit => ({...pandit.toObject(),
        distance: getDistance(userLat, userLong, pandit.latitude, pandit.longitude)})).sort((a, b) => a.distance - b.distance);
    console.log('match pandit:'+ matchedPandits.length);
    console.log(matchedPandits);
    console.log('index : '+index);
    if (index >= matchedPandits.length) {
      console.log('Wait for admin approval');
      return { status: 200, message: "No Pandit accepted the booking.", accepted: false };
    }
    console.log(matchedPandits[index]);
    sendNotificationToPandit(matchedPandits[index].fcm_tokken,poojaBooking,index);
    return { status: 200, message: "Pandits assigned", accepted: true, data: matchedPandits };
  } catch (error) {
    console.error("Error in assignPandit:", error);
    return { status: 500, message: "Internal Server Error", accepted: false };
  }
};


// Send notification to Pandit
const sendNotificationToPandit = async (fcmToken, poojaBooking,index) => {
  const  indexval = index
  const  newindex = indexval.toString();

  if (!fcmToken) {
    console.log("❌ No FCM token available for this Pandit.");
    return false;
  }
  const currentISTTime = new Date(new Date().getTime() + (330 - 1) * 60 * 1000) // Adjust for IST (UTC+5:30) and subtract 2 minutes
  .toISOString()
  .replace("T", " ")
  .split(".")[0];
    const message = {
    token: fcmToken,
    data: {
      title: "New Pooja Booking",
      body: `New booking request (ID: ${poojaBooking.bookingId}). Accept or reject.`,
      booking_id: poojaBooking.bookingId.toString(),
      booking_type: 'panditBooking',
      booking_time:poojaBooking.schedule.date+"&nbsp"+poojaBooking.schedule.time,
      sent_time:currentISTTime,
      extra_data: "Some additional data",
      index:newindex,
    },
    android: {
      priority: "high"
    },
  };
  console.log("Current time "+currentISTTime);

  try {
    await admin.messaging().send(message);
    console.log("Current time "+currentISTTime);
    console.log(`📩 Notification sent to Pandit with token: ${fcmToken}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending notification:", error.message, 0);
    return false;
  }
};

// Accept or Reject Booking
const acceptRejectBooking = async (req, res) => {
  console.log("Full Request Body:", JSON.stringify(req.body, null, 2)); // Pretty print the JSON
  try {
    const { panditId, bookingId, status, userLat, userLong } = req.body;
    if (!panditId || !bookingId || status === undefined) {
      return res.status(400).json({ message: "Missing required fields", status: 0 });
    }
    console.log(`🔹 userLat Type: ${typeof userLat}, Value: ${JSON.stringify(userLat)}`);
    console.log(`🔹 userLong Type: ${typeof userLong}, Value: ${JSON.stringify(userLong)}`);
    const poojaBooking = await PoojaBooking.findOne({ bookingId });
    if (!poojaBooking) {
      return res.status(404).json({ message: "Pooja booking not found", status: 0 });
    }
    if (status === 1) {
      poojaBooking.panditId = panditId;
      poojaBooking.bookingStatus = 2;
      await poojaBooking.save();
      const user = await User.findOne({ _id: poojaBooking.userDetails.userId });
      if (user && user.fcm_tokken) {
        await sendNotificationToUser(user.fcm_tokken, bookingId);
      }
      return res.status(200).json({ message: "Booking accepted.", status: 1 });
    } else {
      assignPandit(poojaBooking, userLat, userLong, req.body.index + 1);
      return res.status(200).json({ message: "Booking sent to a new Pandit.", status: 1 });
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
    if (!bookingId || !transactionId || !transactionStatus  || !userLat || !userLong) {
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
    assignPandit(poojaBooking, userLat, userLong, 0);
    res.status(200).json({message: "Booking Confirm", status: 1})
  } catch (error) {
    console.error("❌ Error updating Pooja booking:", error.message);
    res.status(500).json({ message: "Error updating Pooja booking", error: error.message, status: 0 });
  }
};



const sendNotificationToBhajanMandali = async (fcmToken, mandaliBooking) => {
  if (!fcmToken) {
    console.log("❌ No FCM token available for this Bhajan Mandali member.");
    return false;
  }
  console.log(mandaliBooking);
  const message = {
    token: fcmToken,
    data: {
      title: "New Bhajan Mandali Booking",
      body: 'New booking request (ID: '+ mandaliBooking+ '. Accept or reject.',
      booking_id: mandaliBooking,
      booking_type: 'bhajanMandaliBooking',
      activity_to_open: "com.deificdigital.paramparapartners.activities.BhajanMandaliActivity",
      extra_data: "Some additional data",
    },
    android: {
      priority: "high"
    },
  };

  try {
    await admin.messaging().send(message);
    console.log(`📩 Notification sent to Bhajan Mandali with token: ${fcmToken}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending notification to Bhajan Mandali:", error.message);
    return false;
  }
};

const updateMandaliOrder = async (req, res) => {
  console.log(req.body);
  try {
    const { bookingId, transactionId, transactionStatus, transactionDate, userLat, userLong,fcmtokken } = req.body;
    // Validate required fields
    if (!bookingId || !transactionId || !transactionStatus || !transactionDate || !userLat || !userLong) {
      return res.status(400).json({ message: "Missing required fields", status: 0 });
    }
    // Update booking status and transaction details directly in the database
    const updatedMandaliBooking = await MandaliBooking.findOneAndUpdate(
      { bookingId },
      {
        $set: {
          bookingStatus: 1, // Mark as confirmed
          transactionDetails: { transactionId, transactionStatus, transactionDate },
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedMandaliBooking) {
      return res.status(404).json({ message: "Bhajan Mandali booking not found", status: 0 });
    }
    sendNotificationToBhajanMandali('d9__-FIoSTurmWHti0X1U3:APA91bH6KpwrRRO9DCYnbXIFWH25phsx2gm86d2aGR9iOVJrROnRTXlQYghVGzMtyTNqRc_BW4rdcGooVgh8avLDi53621bCN58WeCSFL0K2CJ3qxpDzLtI', bookingId);
    res.status(200).json({ message: "Bhajan Mandali Booking Confirmed", status: 1 });
  } catch (error) {
    console.error("❌ Error updating Bhajan Mandali booking:", error.message);
    res.status(500).json({ message: "Error updating Bhajan Mandali booking", error: error.message, status: 0 });
  }
};

const acceptOrRejectMandaliBooking = async (req, res) => {
  try {
    const { bookingId, bookingStatus } = req.body;
    // Validate request
    if (!bookingId  || (bookingStatus !== 1 && bookingStatus !== 2)) {
      return res.status(400).json({ message: "Missing or invalid required fields", status: 0 });
    }
    const updatedBooking = await MandaliBooking.findOneAndUpdate(
      { bookingId },
      { $set: { bookingStatus } },
      { new: true }
    );
    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found", status: 0 });
    }
    const mandaliData = await MandaliBooking.findOne({bookingId});
    const _id=mandaliData.userDetails.userId;
    const user = await User.findById({ _id });
    console.log(user.fcm_tokken);
    if (user && user.fcm_tokken) {
      console.log(user.fcm_tokken);
      const statusText = bookingStatus === 1 ? "accepted" : "rejected";
      await sendNotificationToUser(user.fcm_tokken, bookingId, statusText);
    }
    const message =
      bookingStatus === 1 ? "Booking accepted successfully" : "Booking rejected successfully";
    res.status(200).json({ message, status: 1 });
  } catch (error) {
    console.error("❌ Error processing booking:", error.message);
    res.status(500).json({ message: "Error processing booking", error: error.message, status: 0 });
  }
};

// SEND NOTIFICATION TO USER 

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
          channel_id: "notifBookingStatus",
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
    // Attempt to find the order in the PoojaBooking collection
    let order = await PoojaBooking.findOne({ bookingId: orderId });
    // If not found in PoojaBooking, search in the MandaliBooking collection
    if (!order) {
      order = await MandaliBooking.findOne({ bookingId: orderId });
    }
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
      const { OrderId, userId, DeliveryAddress: AddressDetails } = req.body;
      console.log("Delivery Address:", JSON.stringify(req.body, null, 2));
      if (!OrderId  || !AddressDetails || !AddressDetails.AddressLine1 || !AddressDetails.Location || !AddressDetails.City || !AddressDetails.State || !AddressDetails.PostalCode || !AddressDetails.Country) {
        return res.status(400).json({ message: "Missing required fields in the delivery address" });
      }

      const newDelivery = new DeliveryAddress({
        DeliveryId: uuidv4(),
        OrderId,
        userId,
        DeliveryAddress: AddressDetails,
      });
     await newDelivery.save();
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
      return res.status(200).json({ message: "Delivery address not found" });
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
            return res.status(200).json({ message: "No orders found for this user", status: 0 });
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
  
const getDeliveryAddressByUSerID = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User Id is Required", status: 0 });
    }

    const userDelivery = await DeliveryAddress.find({ userId: userId });

    if (!userDelivery || userDelivery.length === 0) {
      return res.status(200).json({ message: "No Delivery Address Found", status: 0 });
    }

    // Rearranging "Landmark" and "Location" to the last in DeliveryAddress
    const formattedDelivery = userDelivery.map((delivery) => {
      const { Landmark, Location, ...rest } = delivery.DeliveryAddress;
      return {
        ...delivery.toObject(),
        DeliveryAddress: {
          ...rest,
          Landmark, // Placing at the end
          Location, // Placing at the end
        },
      };
    });

    res.status(200).json({ message: "Delivery Address Found", data: formattedDelivery, status: 1 });
  } catch (error) {
    res.status(500).json({ message: "Error in Retrieving Delivery Data", error: error.message, status: 0 });
  }
};



// Cancel pooja booking Api by User 

const cancelPoojaBooking = async (req, res) => {
  try {
    const { bookingId,type,id } = req.body;
    if (!bookingId && !id) {
      return res.status(400).json({ message: "Enter Required Field", status: 0 });
    }
    const poojaBooking = await PoojaBooking.findOne({ "bookingId":bookingId,"userDetails.userId":id });
    if (!poojaBooking) {
      return res.status(404).json({ message: "Pooja booking not found", status: 0 });
    }
    if (!poojaBooking.panditId) {
      console.log("⚠️ No Pandit assigned for this booking.");
    }
    let fcmToken = null;
    if (poojaBooking.panditId) {
      const panditDetails = await pandit.findOne({ _id: poojaBooking.panditId });      
      if (panditDetails) {
        fcmToken = panditDetails.fcm_tokken;
        console.log(`Pandit's FCM Token: ${fcmToken}`);
      } else {
        console.log("⚠️ Pandit details not found.");
      }
    }
    poojaBooking.bookingStatus = 4;
    await poojaBooking.save();
    if (fcmToken) {
      await sendCancelNotificationToPandit(fcmToken, poojaBooking, "cancel");
    } else {
      console.log("⚠️ No FCM token available, skipping notification.");
    }
    res.status(200).json({ message: "Booking Canceled", status: 1});
  } catch (error) {
    console.error("❌ Error canceling Pooja booking:", error.message);
    res.status(500).json({ message: "Error canceling Pooja booking", error: error.message, status: 0 });
  }
};


const sendCancelNotificationToPandit = async (fcmToken, poojaBooking, actionType) => {
  if (!fcmToken) {
    console.log("❌ No FCM token available for this Pandit.");
    return false;
  }
  const currentISTTime = new Date(new Date().getTime() + (330 - 1) * 60 * 1000) // Adjust for IST (UTC+5:30) and subtract 2 minutes
    .toISOString()
    .replace("T", " ")
    .split(".")[0];

  const title = actionType === "cancel" ? "Pooja Booking Canceled" : "New Pooja Booking";
  const body = actionType === "cancel" 
    ? `Booking (ID: ${poojaBooking.bookingId}) has been canceled.` 
    : `New booking request (ID: ${poojaBooking.bookingId}). Accept or reject.`;
  const message = {
    token: fcmToken,
    data: {
      title,
      body,
      booking_id: poojaBooking.bookingId.toString(),
      booking_type: "panditBooking",
      sent_time: currentISTTime,
    },
    android: { priority: "high" },
  };

  try {
    await admin.messaging().send(message);
    console.log(`📩 Notification sent to Pandit for ${actionType} with token: ${fcmToken}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending notification:", error.message);
    return false;
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
  createBhanjanMandaliBooking,
  getBhajanOrder,
  updateMandaliOrder,
  getDeliveryAddressByUSerID,
  acceptOrRejectMandaliBooking,
  cancelPoojaBooking,
};