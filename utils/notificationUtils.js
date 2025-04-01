// utils/notificationUtils.js
const admin = require("../config/firebase");

// General notification sender
const sendNotification = async (token, notificationData) => {
  if (!token) {
    console.log("❌ No FCM token available.");
    return false;
  }

  const message = {
    token,
    data: notificationData.data || {},
    // notification: notificationData.notification,
    android: {
      priority: "high",
      // notification: {
        // sound: "default",
        // channel_id: notificationData.channelId || "default_channel",
        // click_action: notificationData.clickAction || "OPEN_ACTIVITY",
      // },
    },
  };

  try {
    await admin.messaging().send(message);
    console.log(`📩 Notification sent to token: ${token}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending notification:", error.message);
    return false;
  }
};

// Specific notification functions
const sendBhajanMandaliNotification = async (fcmToken, mandaliBooking) => {
  const notificationData = {
    data: {
      title: "New Bhajan Mandali Booking",
      body: `New booking request (ID: ${mandaliBooking.bookingId}). Accept or reject.`,
      booking_id: mandaliBooking.bookingId,
      booking_type: 'bhajanMandaliBooking',
      booking_time: `Schedule Date: ${mandaliBooking.schedule.date} Time: ${mandaliBooking.schedule.time}`,
    },
    channelId: "booking_requests",
  };

  return await sendNotification(fcmToken, notificationData);
};

const sendBookingStatusNotification = async (userFcmToken, bookingId, status) => {
  const statusText = status === 1 ? "accepted" : status === 2 ? "started" : status === 3 ? "completed" : "rejected";
  
  const notificationData = {
    data: {
       title: `Booking ${statusText}`,
      body: `Your booking (ID: ${bookingId}) has been ${statusText}.`,
      booking_id: bookingId.toString(),
      booking_status: status.toString(),
      booking_type: 'bhajanMandaliBooking',

    },
  };

  return await sendNotification(userFcmToken, notificationData);
};

module.exports = {
  sendNotification,
  sendBhajanMandaliNotification,
  sendBookingStatusNotification,
};