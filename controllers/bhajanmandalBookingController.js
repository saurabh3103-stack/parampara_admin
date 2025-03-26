const { v4: uuidv4 } = require("uuid");
const DeliveryAddress = require("../models/DeliveryAddress");
const admin = require("../config/firebase");
const User = require("../models/userModel");
const MandaliBooking = require("../models/BhajanMandalBooking");
const BookedUser = require("../models/bookedUserModel");


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

function generateOTP() {
  return Math.floor(100000 + Math.random() * 999999);
}

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
    const { bookingId, bookingStatus, mandaliId } = req.body;
    if (!bookingId || !mandaliId || !bookingStatus) {
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
    const mandaliData = await MandaliBooking.findOne({ bookingId });
    if (!mandaliData || !mandaliData.userDetails) {
      return res.status(404).json({ message: "Booking details not found", status: 0 });
    }
    const userId = mandaliData.userDetails.userId;
    const user = await User.findById(userId);
    if (bookingStatus === 1) {
      mandaliData.bookingStatus=2;
      mandaliData.otp=generateOTP();
      await mandaliData.save();
      const bookedUser = new BookedUser({
        userId: userId,
        partnerId: mandaliData.bookingDetails.mandaliId,
        user_type: "mandali",
        product_type: {
          product_id: mandaliData.bookingDetails.mandaliId,
          product_name: mandaliData.bookingDetails.mandaliName,
        },
        booking_date: mandaliData.schedule.date,
        booking_time: mandaliData.schedule.time,
        status: "booked",
      });
      await bookedUser.save();
    }
    if (user && user.fcm_tokken) {
      const statusText = bookingStatus === 1 ? "accepted" : "rejected";
      await sendNotificationToUser(user.fcm_tokken, bookingId, statusText);
    }
    const message =
      bookingStatus === 1 ? "Booking accepted and saved successfully" : "Booking rejected successfully";
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

const startBhajanMandal = async (req, res) => {
  try {
    const { mandalId,bookingId } = req.body;
    const mandal = await MandaliBooking.findOne({"bookingId":bookingId});
    if (!mandal || !bookingId) {
      return res.status(200).json({ message: "Booking ID and Bhajan Mandal not found", status: 0 });
    }
    const now = new Date();
    const timeString = now.toTimeString().split(" ")[0]; 
    const updatedBooking = await MandaliBooking.findOneAndUpdate(
      { 
        "bookingId": bookingId,
      },
      { 
        $set: { 
          "schedule.bhajanStartTime": timeString,
          "schedule.ongoingStatus": 1
        } 
      },
      { new: true } 
    );
    if(!updatedBooking){
      return res.status(200).json({
        message: "Booking not found",
        status: 0 
      })
    }
    const user = await User.findOne({ _id: updatedBooking.userDetails.userId });
    if (user && user.fcm_tokken) {
      await sendBhajnaNotificationToUser(user.fcm_tokken,updatedBooking.bookingId,'started');
    }
    res.status(200).json({ message: "Bhajan Mandal started successfully", status: 1 });
  } catch (error) {
    console.error("❌ Error starting pooja:", error.message);
    res.status(500).json({ message: "Error starting Bhajan Mandal", error: error.message, status: 0 });
  }
};

const sendBhajnaNotificationToUser = async (userFcmToken, bookingId, notificationType) => {
  let notificationdata = {};
  if (notificationType === "started") {
    notificationdata = { 
      title: "Pooja Started",
      body: `The pandit has started your pooja (Booking ID: ${bookingId})`,
      booking_id: bookingId.toString(),
      booking_type: "poojaStarted",
    };
  } else {
    notificationdata = {
      title: "Pooja Completed",
      body: `The pandit has completed your pooja (Booking ID: ${bookingId})`,
      booking_id: bookingId.toString(),
      booking_type: "poojaCompleted",
    };
  }
  const message = {
    token: userFcmToken,
    data: notificationdata,
    android: {
      priority: "high",
      notification: {
        sound: "default",
        channel_id: "poojaStatusUpdates",
      },
    },
  };
  try {
    await admin.messaging().send(message);
    console.log(`📩 Pooja ${notificationType} notification sent to user for booking ${bookingId}`);
  } catch (error) {
    console.error("❌ Error sending pooja notification:", error.message);
  }
};

const completeBhajanMandal = async (req, res) => {
  try {
    const { mandalId,bookingId,otp } = req.body;
    if (!mandalId || !bookingId || !otp) {
      return res.status(200).json({ message: "Booking ID, Bhajna ID and OTP are required", status: 0 });
    }
    const mandal = await MandaliBooking.findOne({
          bookingId: bookingId,
    });
    if (!mandal) {
      return res.status(200).json({ message: "Booking not found", status: 0 });
    }
    if (mandal.otp !== otp) {
      return res.status(200).json({
        message: "Invalid OTP",
        status: 0
      });
    }
    const now = new Date();
    const timeString = now.toTimeString().split(" ")[0];
    const updatedBooking = await MandaliBooking.findOneAndUpdate(
      { 
        bookingId: bookingId,
      },
          { 
            $set: { 
              "schedule.bhajanEndTime": timeString,
              "schedule.ongoingStatus": 0,
              bookingStatus: 3, // Mark as completed
              otp: null // Clear the OTP after successful verification
            } 
          },
          { new: true } // Return the updated document
        );
        const user = await User.findOne({ _id: updatedBooking.userDetails.userId });
        if (user && user.fcm_tokken) {
          await sendBhajnaNotificationToUser(user.fcm_tokken,updatedBooking.bookingId,'completed');
        }
        res.status(200).json({ message: "Bhajan Mandal completed successfully", status: 1 });
      } catch (error) {
    res.status(500).json({ message: "Error completing Bhajan Mandal", error: error.message, status: 0 });
  }
};

module.exports = {
  addDeliveryAddress,
  getDeliveryAddress,
  createBhanjanMandaliBooking,
  getBhajanOrder,
  updateMandaliOrder,
  getDeliveryAddressByUSerID,
  acceptOrRejectMandaliBooking,
  startBhajanMandal,
  completeBhajanMandal
};