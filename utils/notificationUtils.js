const admin = require("../config/firebase");

const sendNotificationToBhajanMandali = async (fcmToken, mandaliBooking) => {
  if (!fcmToken) {
    console.log("❌ No FCM token available for this Bhajan Mandali member.");
    return false;
  }
  
  const message = {
    token: fcmToken,
    data: {
      title: "New Bhajan Mandali Booking",
      body: `New booking request (ID: ${mandaliBooking}). Accept or reject.`,
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

const sendNotificationToUser = async (userFcmToken, bookingId, statusText = "confirmed") => {
  const message = {
    token: userFcmToken,
    data: {
      title: `Booking ${statusText}`,
      body: `Your booking (ID: ${bookingId}) has been ${statusText}.`,
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
  };

  try {
    await admin.messaging().send(message);
    console.log(`📩 Notification sent to User with token: ${userFcmToken}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending notification to User:", error.message);
    return false;
  }
};

module.exports = {
  sendNotificationToBhajanMandali,
  sendNotificationToUser
};