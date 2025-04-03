const { v4: uuidv4 } = require("uuid");
const PoojaBooking = require("../models/PoojaBooking");
const pandit = require("../models/panditModel");
const User = require("../models/userModel");
const PanditCategory = require('../models/panditCategoryModel');
const MissedPoojaBooking = require('../models/missedPoojaBookingModel');
const BookedUser = require("../models/bookedUserModel");
const {
  sendPanditAssignmentNotification,
  sendUserBookingNotification,
  sendPoojaStartNotification,
  sendPoojaCompleteNotification,
  sendCancelNotification,
} = require("../utils/poojaBookingNotification");
const { sendEmail } = require("../utils/emailUtils");

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
  return Math.floor(100000 + Math.random() * 900000);
}

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

// Create Pooja Booking
const createPoojaBooking = async (req, res) => {
  try {
    const { poojaId, poojaName, poojaType, isSamagriIncluded, date, time, userId,
      username, contactNumber, email, amount, quantity } = req.body;
    
    const newPoojaBooking = new PoojaBooking({
      bookingId: 'POOJA' + generateNumericUUID(),
      bookingDetails: { poojaId, poojaName, Type: "Pooja", isSamagriIncluded },
      userDetails: { userId, username, contactNumber, email },
      schedule: { date, time },
      paymentDetails: { amount, quantity },
    });

    await newPoojaBooking.save();
    res.status(201).json({
      message: "Pooja booking created successfully",
      poojaBooking: newPoojaBooking,
      status: 1,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating Pooja booking",
      error: error.message,
      status: 0,
    });
  }
};

// Assign Pandit 
const assignPandit = async (poojaBooking, userLat, userLong, index) => {
  try {
    // Dynamic configuration
    const MAX_DISTANCE_KM = 2; // Maximum distance in km (can be made configurable)
    const REJECTION_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes in milliseconds (can be configurable)
    const poojaId = poojaBooking.bookingDetails.poojaId;
    let panditCategories = await PanditCategory.find({ pooja_id: poojaId, status: 1 });    
    if (!panditCategories.length) {
      return { status: 404, message: "No Pandit category found for this pooja.", accepted: false };
    }
    let panditIds = panditCategories.map(category => category.pandit_id);
    let matchedPandits = await pandit.find({ 
      _id: { $in: panditIds },
      'profile_status': 'active'
    });
    if (!matchedPandits.length) {
      return { status: 404, message: "No matching Pandits found", accepted: false };
    }
    // Calculate distances and categorize pandits
    matchedPandits = matchedPandits.map(pandit => {
      const distance = getDistance(userLat, userLong, pandit.latitude, pandit.longitude);
      return {
        ...pandit.toObject(),
        distance,
        isNearby: distance <= MAX_DISTANCE_KM
      };
    });
    // Separate nearby and far pandits
    const nearbyPandits = matchedPandits.filter(p => p.isNearby).sort((a, b) => a.distance - b.distance);
    const farPandits = matchedPandits.filter(p => !p.isNearby).sort((a, b) => a.distance - b.distance);
    // Combine with nearby pandits first, then far pandits
    const prioritizedPandits = [...nearbyPandits, ...farPandits];
    if (index >= prioritizedPandits.length) {
      return { status: 200, message: "No Pandit accepted the booking.", accepted: false };
    }
    const selectedPandit = prioritizedPandits[index];
    try {
      if (selectedPandit.email) {
        await sendEmail(
          selectedPandit.email,
          `New Pooja Booking Assignment - ${poojaBooking.bookingId}`,
          'PoojaEmail/panditAssignment',
          {
            bookingId: poojaBooking.bookingId,
            poojaName: poojaBooking.bookingDetails.poojaName,
            date: poojaBooking.schedule.date,
            time: poojaBooking.schedule.time,
            userName: poojaBooking.userDetails.username,
            userPhone: poojaBooking.userDetails.contactNumber
          }
        );
      }
    } catch (emailError) {
      console.error('Failed to send pandit assignment email:', emailError);
    }
    await sendPanditAssignmentNotification(
      selectedPandit.fcm_tokken,
      poojaBooking,
      index
    );
    setTimeout(async () => {
      try {
        // Check if the booking is still unassigned
        const currentBooking = await PoojaBooking.findOne({ bookingId: poojaBooking.bookingId });
        if (currentBooking && currentBooking.bookingStatus === 1) { // Still unassigned
          console.log(`Pandit ${selectedPandit._id} did not respond, moving to next pandit`);
          // Create missed booking record
          const missedBooking = new MissedPoojaBooking({
            pandit_id: selectedPandit._id,
            isAutomatic: true,
            bookingDetails: {
              poojaId: poojaBooking.bookingDetails.poojaId,
              poojaName: poojaBooking.bookingDetails.poojaName,
              Type: poojaBooking.bookingDetails.Type,
              isSamagriIncluded: poojaBooking.bookingDetails.isSamagriIncluded,
            },
            schedule: {
              date: poojaBooking.schedule.date,
              time: poojaBooking.schedule.time
            },
          });
          await missedBooking.save();
          // Assign to next pandit
          assignPandit(poojaBooking, userLat, userLong, index + 1);
        }
      } catch (timeoutError) {
        console.error('Error in rejection timeout handler:', timeoutError);
      }
    }, REJECTION_TIMEOUT_MS);

    return { 
      status: 200, 
      message: "Pandit assignment initiated", 
      accepted: false, // Initially false until explicitly accepted
      data: {
        pandits: prioritizedPandits,
        currentIndex: index,
        currentPandit: selectedPandit
      } 
    };
  } catch (error) {
    console.error("Error in assignPandit:", error);
    return { 
      status: 500, 
      message: "Internal Server Error", 
      accepted: false,
      error: error.message
    };
  }
};

// Update Pooja Booking and Start Assigning Pandit
const updatePoojaBooking = async (req, res) => {
  try {
    const { bookingId, transactionId, transactionStatus, transactionDate, userLat, userLong } = req.body;
    
    if (!bookingId || !transactionId || !transactionStatus || !userLat || !userLong) {
      return res.status(400).json({ 
        message: "Missing required fields", 
        status: 0 
      });
    }
    const poojaBooking = await PoojaBooking.findOne({ bookingId });
    if (!poojaBooking) {
      return res.status(404).json({ 
        message: "Pooja booking not found", 
        status: 0 
      });
    }
    poojaBooking.bookingStatus = 1; // Mark as confirmed
    poojaBooking.transactionDetails = { 
      transactionId, 
      transactionStatus, 
      transactionDate 
    };
    await poojaBooking.save();
    try {
      const user = await User.findById(poojaBooking.userDetails.userId);
      if (user && user.email) {
        await sendEmail(
          user.email,
          `Your Pooja Booking Confirmation - ${poojaBooking.bookingId}`,
          'PoojaEmail/orderConfirmation',
          {
            bookingId: poojaBooking.bookingId,
            poojaName: poojaBooking.bookingDetails.poojaName,
            date: poojaBooking.schedule.date,
            time: poojaBooking.schedule.time,
            amount: poojaBooking.paymentDetails.amount,
            userName: user.name || poojaBooking.userDetails.username
          }
        );
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }
    assignPandit(poojaBooking, userLat, userLong, 0);
    res.status(200).json({
      message: "Booking Confirm", 
      status: 1
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error updating Pooja booking", 
      error: error.message, 
      status: 0 
    });
  }
};

// Accept or Reject Booking
const acceptRejectBooking = async (req, res) => {
  try {
    const { panditId, bookingId, status, userLat, userLong, isAutomatic, user_type } = req.body;
    
    if (!panditId || !bookingId || status === undefined) {
      return res.status(400).json({ 
        message: "Missing required fields", 
        status: 0 
      });
    }

    const poojaBooking = await PoojaBooking.findOne({ "bookingId": bookingId });
    console.log(poojaBooking);
    if (!poojaBooking) {
      return res.status(404).json({ 
        message: "Pooja booking not found", 
        status: 0 
      });
    }
    if (status === 1) { 
      // Get pandit details for email
      const panditDetails = await pandit.findById(panditId);
      poojaBooking.panditId = panditId;
      poojaBooking.bookingStatus = 2; 
      poojaBooking.otp = generateOTP();
      await poojaBooking.save();
      const bookedUser = new BookedUser({
        userId: poojaBooking.userDetails.userId,
        partnerId: panditId,
        user_type: "pandit", 
        product_type: {
          product_id: poojaBooking.bookingDetails.poojaId,
          product_name: poojaBooking.bookingDetails.poojaName,
        },
        booking_date: poojaBooking.schedule.date,
        booking_time: poojaBooking.schedule.time,
        status: 1
      });
      await bookedUser.save();
      const user = await User.findOne({ _id: poojaBooking.userDetails.userId });
      
      // Send notification to user
      if (user && user.fcm_tokken) {
        await sendUserBookingNotification(
          user.fcm_tokken, 
          bookingId, 
          1
        );
      }
      if (user && user.email) {
        await sendEmail(
          user.email,
          `Pandit Assigned for Your Pooja - ${poojaBooking.bookingId}`,
          'PoojaEmail/panditAssigned',
          {
            bookingId: poojaBooking.bookingId,
            poojaName: poojaBooking.bookingDetails.poojaName,
            date: poojaBooking.schedule.date,
            time: poojaBooking.schedule.time,
            panditName: panditDetails?.name || "Your Pandit",
            panditContact: panditDetails?.contactNumber || "Contact via App",
            otp: poojaBooking.otp
          }
        );
      }

      // Send email to pandit about acceptance
      if (panditDetails && panditDetails.email) {
        await sendEmail(
          panditDetails.email,
          `Booking Confirmed - ${poojaBooking.bookingId}`,
          'PoojaEmail/panditBookingConfirmed',
          {
            bookingId: poojaBooking.bookingId,
            poojaName: poojaBooking.bookingDetails.poojaName,
            date: poojaBooking.schedule.date,
            time: poojaBooking.schedule.time,
            userName: poojaBooking.userDetails.username,
            userPhone: poojaBooking.userDetails.contactNumber,
            userAddress: poojaBooking.userDetails.address || "Address in app",
            otp: poojaBooking.otp
          }
        );
      }

      return res.status(200).json({ 
        message: "Booking accepted and saved.", 
        status: 1 
      });
    } else { 
      // Get pandit details for email
      const panditDetails = await pandit.findById(panditId);
      
      const missedBooking = new MissedPoojaBooking({
        pandit_id: panditId,
        isAutomatic: isAutomatic,
        bookingDetails: {
          poojaId: poojaBooking.bookingDetails.poojaId,
          poojaName: poojaBooking.bookingDetails.poojaName,
          Type: poojaBooking.bookingDetails.Type,
          isSamagriIncluded: poojaBooking.bookingDetails.isSamagriIncluded,
        },
        schedule: {
          date: poojaBooking.schedule.date,
          time: poojaBooking.schedule.time
        },
      });

      await missedBooking.save();
      
      // Send email to pandit about rejection (optional)
      // if (panditDetails && panditDetails.email && !isAutomatic) {
      //   await sendEmail(
      //     panditDetails.email,
      //     `Booking Declined - ${poojaBooking.bookingId}`,
      //     'panditBookingDeclined',
      //     {
      //       bookingId: poojaBooking.bookingId,
      //       poojaName: poojaBooking.bookingDetails.poojaName,
      //       date: poojaBooking.schedule.date,
      //       time: poojaBooking.schedule.time,
      //       userName: poojaBooking.userDetails.username
      //     }
      //   );
      // }

      assignPandit(poojaBooking, userLat, userLong, req.body.index + 1);
      
      return res.status(200).json({ 
        message: "Booking sent to a new Pandit.", 
        status: 1 
      });
    }
  } catch (error) {
    console.error("Error in acceptRejectBooking:", error);
    res.status(500).json({ 
      message: "Error processing booking", 
      error: error.message, 
      status: 0 
    });
  }
};

// Get Order Details
const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await PoojaBooking.findOne({ bookingId: orderId });
    
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

// Get All Orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await PoojaBooking.find();
    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving orders", 
      error: error.message 
    });
  }
};

// Get Pooja Orders by User ID
const getPoojaOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ 
        message: "User ID is required", 
        status: 0 
      });
    }

    const userOrders = await PoojaBooking.find({ "userDetails.userId": userId });
    if (!userOrders || userOrders.length === 0) {
      return res.status(200).json({ 
        message: "No orders found for this user", 
        status: 0 
      });
    }

    res.status(200).json({
      message: "User orders retrieved successfully",
      orders: userOrders,
      status: 1,
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving user orders", 
      error: error.message, 
      status: 0 
    });
  }
};

// Cancel Pooja Booking
const cancelPoojaBooking = async (req, res) => {
  try {
    const { bookingId, id } = req.body;
    
    if (!bookingId && !id) {
      return res.status(400).json({ 
        message: "Enter Required Field", 
        status: 0 
      });
    }

    const poojaBooking = await PoojaBooking.findOne({ 
      "bookingId": bookingId,
      "userDetails.userId": id 
    });
    
    if (!poojaBooking) {
      return res.status(404).json({ 
        message: "Pooja booking not found", 
        status: 0 
      });
    }

    let fcmToken = null;
    let panditDetails = null;
    if (poojaBooking.panditId) {
      panditDetails = await pandit.findOne({ _id: poojaBooking.panditId });
      if (panditDetails) {
        fcmToken = panditDetails.fcm_tokken;
      }
    }

    poojaBooking.bookingStatus = 4;
    await poojaBooking.save();

    if (fcmToken) {
      await sendCancelNotification(fcmToken, poojaBooking.bookingId);
    }

    // Send cancellation emails
    try {
      const user = await User.findById(poojaBooking.userDetails.userId);
      
      // Email to user
      if (user && user.email) {
        await sendEmail(
          user.email,
          `Pooja Booking Cancelled - ${poojaBooking.bookingId}`,
          'PoojaEmail/bookingCancelled',
          {
            bookingId: poojaBooking.bookingId,
            poojaName: poojaBooking.bookingDetails.poojaName,
            cancellationTime: new Date().toLocaleString()
          }
        );
      }

      // Email to pandit if assigned
      if (panditDetails && panditDetails.email) {
        await sendEmail(
          panditDetails.email,
          `Pooja Booking Cancelled - ${poojaBooking.bookingId}`,
          'PoojaEmail/panditBookingCancelled',
          {
            bookingId: poojaBooking.bookingId,
            poojaName: poojaBooking.bookingDetails.poojaName,
            userName: poojaBooking.userDetails.username,
            userPhone: poojaBooking.userDetails.contactNumber,
            cancellationTime: new Date().toLocaleString()
          }
        );
      }
    } catch (emailError) {
      console.error('Failed to send cancellation emails:', emailError);
    }

    res.status(200).json({ 
      message: "Booking Canceled", 
      status: 1
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error canceling Pooja booking", 
      error: error.message, 
      status: 0 
    });
  }
};

// Pooja Start
const poojaStart = async (req, res) => {
  try {
    const { bookingId, panditId } = req.body;
    
    if (!bookingId || !panditId) {
      return res.status(400).json({ 
        message: "Booking ID and Pandit ID are required",
        status: 0 
      });
    }

    const now = new Date();
    const timeString = now.toTimeString().split(" ")[0];
    
    const updatedBooking = await PoojaBooking.findOneAndUpdate(
      { 
        bookingId: bookingId,
        panditId: panditId 
      },
      { 
        $set: { 
          "schedule.poojaStartTime": timeString,
          "schedule.ongoingStatus": 1
        } 
      },
      { new: true } 
    );

    if (!updatedBooking) {
      return res.status(200).json({ 
        message: "Booking not found or pandit not assigned to this booking",
        status: 0 
      });
    }

    const user = await User.findOne({ _id: updatedBooking.userDetails.userId });
    if (user && user.fcm_tokken) {
      await sendPoojaStartNotification(
        user.fcm_tokken, 
        updatedBooking.bookingId
      );
    }

    // Send pooja start email to user
    try {
      if (user && user.email) {
        await sendEmail(
          user.email,
          `Your Pooja Has Started - ${updatedBooking.bookingId}`,
          'PoojaEmail/poojaStarted',
          {
            bookingId: updatedBooking.bookingId,
            poojaName: updatedBooking.bookingDetails.poojaName,
            startTime: timeString,
            panditName: updatedBooking.panditId.name || "Your Pandit"
          }
        );
      }
    } catch (emailError) {
      console.error('Failed to send pooja start email:', emailError);
    }

    res.status(200).json({ 
      message: "Pooja started successfully",
      booking: updatedBooking,
      status: 1
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error starting pooja",
      error: error.message,
      status: 0 
    });
  }
};

// Pooja Complete
const poojaComplete = async (req, res) => {
  try {
    const { bookingId, panditId, otp } = req.body;

    if (!bookingId || !panditId || !otp) {
      return res.status(400).json({
        message: "Booking ID, Pandit ID and OTP are required",
        status: 0
      });
    }

    const booking = await PoojaBooking.findOne({ 
      bookingId: bookingId,
      panditId: panditId 
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found or pandit not assigned to this booking",
        status: 0
      });
    }

    if (booking.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
        status: 0
      });
    }

    const now = new Date();
    const timeString = now.toTimeString().split(" ")[0];

    const updatedBooking = await PoojaBooking.findOneAndUpdate(
      { 
        bookingId: bookingId,
        panditId: panditId 
      },
      { 
        $set: { 
          "schedule.poojaEndTime": timeString,
          "schedule.ongoingStatus": 0,
          bookingStatus: 3,
          otp: null
        } 
      },
      { new: true }
    );

    const user = await User.findOne({ _id: updatedBooking.userDetails.userId });
    if (user && user.fcm_tokken) {
      await sendPoojaCompleteNotification(
        user.fcm_tokken,
        updatedBooking.bookingId
      );
    }

    // Send completion email to user
    try {
      if (user && user.email) {
        await sendEmail(
          user.email,
          `Pooja Completed Successfully - ${updatedBooking.bookingId}`,
          'PoojaEmail/poojaCompleted',
          {
            bookingId: updatedBooking.bookingId,
            poojaName: updatedBooking.bookingDetails.poojaName,
            completionTime: timeString,
            panditName: updatedBooking.panditId.name || "Your Pandit"
          }
        );
      }
    } catch (emailError) {
      console.error('Failed to send completion email:', emailError);
    }

    res.status(200).json({
      message: "Pooja completed successfully",
      status: 1
    });
  } catch (error) {
    res.status(500).json({
      message: "Error completing pooja",
      error: error.message,
      status: 0
    });
  }
};

module.exports = {
  createPoojaBooking,
  getOrder,
  getAllOrders,
  getPoojaOrdersByUserId,
  updatePoojaBooking,
  acceptRejectBooking,
  cancelPoojaBooking,
  poojaStart,
  poojaComplete,
};