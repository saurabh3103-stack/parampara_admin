// controllers/bhajanMandaliController.js
const { v4: uuidv4 } = require("uuid");
const MandaliBooking = require("../models/BhajanMandalBooking");
const BookedUser = require("../models/bookedUserModel");
const User = require("../models/userModel");
const { sendBhajanMandaliNotification, sendBookingStatusNotification } = require("../utils/notificationUtils");
const { sendEmail } = require('../utils/emailUtils');

const generateNumericUUID = () => {
  const uuid = uuidv4().replace(/-/g, '');
  const numericId = uuid.split('')
      .map(char => char.charCodeAt(0) % 10) 
      .join('')
      .slice(0, 4);
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:.TZ]/g, '').slice(8, 14);
  return `${timestamp}`;
};


function generateOTP() {
  return Math.ceil(100000 + Math.random() * 999999);
}

const createBhanjanMandaliBooking = async (req, res) => {
  console.log(req.body);
  try {
    const { mandaliId, mandaliName, mandaliType, userId, username, 
            contactNumber, email, date, time, amount, quantity } = req.body;
    
    const newBhajanBooking = new MandaliBooking({
      bookingId: 'BHJAN' + generateNumericUUID(),
      bookingDetails: { mandaliId, mandaliName, Type: mandaliType },
      userDetails: { userId, username, contactNumber, email },
      schedule: { date, time },
      paymentDetails: { amount, quantity },
    }); 
    
    await newBhajanBooking.save();
    console.log(newBhajanBooking);
    res.status(201).json({
      message: "Bhajan Mandal Booking Created Successfully",
      bhajanbooking: newBhajanBooking,
      status: 1
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

const getBhajanOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await MandaliBooking.findOne({ bookingId: orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving order", 
      error: error.message 
    });
  }
};

const updateMandaliOrder = async (req, res) => {
  // console.log(req.body);
  try {
    console.log(req.body);
    const { bookingId, transactionId, transactionStatus, 
           transactionDate, userLat, userLong, fcm_tokken } = req.body;
    
    if (!bookingId || !transactionId || !transactionStatus || 
        !transactionDate || !userLat || !userLong || !fcm_tokken) {
      return res.status(400).json({ 
        message: "Missing required fields", 
        status: 0 
      });
    }

    const BookingDetails = await MandaliBooking.findOne({ bookingId });
    const updatedMandaliBooking = await MandaliBooking.findOneAndUpdate(
      { bookingId },
      {
        $set: {
          bookingStatus: 1, // Mark as confirmed
          transactionDetails: { transactionId, transactionStatus, transactionDate },
        },
      },
      { new: true }
    );

    if (!updatedMandaliBooking) {
      return res.status(404).json({ 
        message: "Bhajan Mandali booking not found", 
        status: 0 
      });
    }

    await sendBhajanMandaliNotification(fcm_tokken, BookingDetails);
    await sendEmail(
      BookingDetails.userDetails.email,
      'Bhajan Mandali Booking Confirmed',
      'bookingConfirmation',
      {
        user: BookingDetails.userDetails,
        booking: BookingDetails
      }
    );
    res.status(200).json({ 
      message: "Bhajan Mandali Booking Confirmed", 
      status: 1 
    });
  } catch (error) {
    console.error("❌ Error updating Bhajan Mandali booking:", error.message);
    res.status(500).json({ 
      message: "Error updating Bhajan Mandali booking", 
      error: error.message, 
      status: 0 
    });
  }
};

const acceptOrRejectMandaliBooking = async (req, res) => {
  try {
    console.log(req.body);
    const { bookingId, bookingStatus, mandaliId } = req.body;
    if (!bookingId || !mandaliId || !bookingStatus) {
      return res.status(400).json({ 
        message: "Missing or invalid required fields", 
        status: 0 
      });
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
      return res.status(404).json({ 
        message: "Booking details not found", 
        status: 0 
      });
    }

    const userId = mandaliData.userDetails.userId;
    const user = await User.findById(userId);

    if (bookingStatus === 1) {
      mandaliData.bookingStatus = 2;
      mandaliData.otp = generateOTP();
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
      await sendEmail(
        user.email,
        'Bhajan Mandali Booking Accepted',
        'bookingAccepted',
        {
          user: user,
          booking: mandaliData
        }
      );
    }

    if (user && user.fcm_tokken) {
      await sendBookingStatusNotification(user.fcm_tokken, bookingId, bookingStatus);
      
    }

    const message = bookingStatus === 1 
      ? "Booking accepted and saved successfully" 
      : "Booking rejected successfully";
    
    res.status(200).json({ message, status: 1 });
  } catch (error) {
    console.error("❌ Error processing booking:", error.message);
    res.status(500).json({ 
      message: "Error processing booking", 
      error: error.message, 
      status: 0 
    });
  }
};

const startBhajanMandal = async (req, res) => {
  try {
    const { mandalId, bookingId } = req.body;
    const mandal = await MandaliBooking.findOne({ bookingId });
    
    if (!mandal || !bookingId) {
      return res.status(200).json({ 
        message: "Booking ID and Bhajan Mandal not found", 
        status: 0 
      });
    }

    const now = new Date();
    const timeString = now.toTimeString().split(" ")[0]; 
    
    const updatedBooking = await MandaliBooking.findOneAndUpdate(
      { bookingId },
      { 
        $set: { 
          "schedule.bhajanStartTime": timeString,
          "schedule.ongoingStatus": 1
        } 
      },
      { new: true } 
    );

    if (!updatedBooking) {
      return res.status(200).json({
        message: "Booking not found",
        status: 0 
      });
    }

    const user = await User.findOne({ _id: updatedBooking.userDetails.userId });
    if (user && user.fcm_tokken) {
      await sendBookingStatusNotification(user.fcm_tokken, updatedBooking.bookingId, 2); // 2 for started
    }
    await sendEmail(
      user.email,
      'Bhajan Mandali Session Started',
      'bookingStarted',
      {
        user: user,
        booking: updatedBooking
      }
    );
    res.status(200).json({ 
      message: "Bhajan Mandal started successfully", 
      status: 1 
    });
  } catch (error) {
    console.error("❌ Error starting pooja:", error.message);
    res.status(500).json({ 
      message: "Error starting Bhajan Mandal", 
      error: error.message, 
      status: 0 
    });
  }
};

const completeBhajanMandal = async (req, res) => {
  try {;
    const { mandalId, bookingId, otp } = req.body;
    console.log(req.body)
    if (!mandalId || !bookingId || !otp) {
      return res.status(200).json({ 
        message: "Booking ID, Bhajna ID and OTP are required", 
        status: 0 
      });
    }
    const mandal = await MandaliBooking.findOne({ bookingId });
    if (!mandal) {
      return res.status(200).json({ 
        message: "Booking not found", 
        status: 0 
      });
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
      { bookingId },
      { 
        $set: { 
          "schedule.bhajanEndTime": timeString,
          "schedule.ongoingStatus": 0,
          bookingStatus: 3, // Mark as completed
          otp: null // Clear the OTP after successful verification
        } 
      },
      { new: true }
    );

    const user = await User.findOne({ _id: updatedBooking.userDetails.userId });
    if (user && user.fcm_tokken) {
      await sendBookingStatusNotification(user.fcm_tokken, updatedBooking.bookingId, 3); // 3 for completed
    }
    await sendEmail(
      user.email,
      'Bhajan Mandali Session Completed',
      'bookingCompleted',
      {
        user: user,
        booking: updatedBooking,
        feedbackLink: `${process.env.FRONTEND_URL}/feedback/${updatedBooking.bookingId}`
      }
    );
    res.status(200).json({ 
      message: "Bhajan Mandal completed successfully", 
      status: 1 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error completing Bhajan Mandal", 
      error: error.message, 
      status: 0 
    });
  }
};

module.exports = {
  createBhanjanMandaliBooking,
  getBhajanOrder,
  updateMandaliOrder,
  acceptOrRejectMandaliBooking,
  startBhajanMandal,
  completeBhajanMandal
};