// utils/notificationUtils.js
const admin = require("../config/firebase");

const sendNotification = async (token, notificationData) => {
  if (!token) {
    console.log("❌ No FCM token available.");
    return false;
  }

  const message = {
    token,
    data: notificationData.data,
    // notification: notificationData.notification,
    android: {
      priority: "high",
    //   notification: {
    //     sound: "default",
    //     channel_id: notificationData.channelId || "default_channel",
    //     click_action: notificationData.clickAction || "OPEN_ACTIVITY",
    //   },
    },
    // apns: {
    //   payload: {
    //     aps: {
    //       sound: "default",
    //     },
    //   },
    // },
  };

  try {
    const array = Object.entries(notificationData.data);
    console.log(array);
    await admin.messaging().send(message);
    console.log(`📩 Notification sent to token: ${token}`+`${notificationData.data}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending notification:", error.message);
    return false;
  }
};

// Pooja Booking Notifications
const sendPanditAssignmentNotification = async (fcmToken, poojaBooking, index) => {
  const currentISTTime = new Date(new Date().getTime() + (330 - 1) * 60 * 1000)
    .toISOString()
    .replace("T", " ")
    .split(".")[0];

  return await sendNotification(fcmToken, {
    data: {
      title: "New Pooja Booking",
      body: `New booking request (ID: ${poojaBooking.bookingId}). Accept or reject.`,
      booking_id: poojaBooking.bookingId.toString(),
      notification_type: 'panditBooking', 
      booking_type:'panditBooking',
      booking_time: poojaBooking.schedule.date + " " + poojaBooking.schedule.time,
      sent_time: currentISTTime,
      index: index.toString(),
    },
    // channelId: "booking_requests",
  });
};

const sendUserBookingNotification = async (fcmToken, bookingId, status) => {
  const statusMessages = {
    1: "accepted",
    2: "started",
    3: "completed",
    4: "canceled"
  };

  return await sendNotification(fcmToken, {
    notification: {
      title: `Booking ${statusMessages[status]}`,
      body: `Your booking (ID: ${bookingId}) has been ${statusMessages[status]}.`,
    },
    data: {
      booking_id: bookingId.toString(),
      booking_status: status.toString(),
    },
    // channelId: "booking_status",
  });
};

const sendPoojaStartNotification = async (fcmToken, bookingId) => {
  return await sendNotification(fcmToken, {
    notification: {
      title: "Pooja Started",
      body: `The pandit has started your pooja (Booking ID: ${bookingId})`,
    },
    data: {
      booking_id: bookingId.toString(),
      notification_type: "panditBooking",
    },
    // channelId: "pooja_status",
  });
};

const sendPoojaCompleteNotification = async (fcmToken, bookingId) => {
  return await sendNotification(fcmToken, {
    notification: {
      title: "Pooja Completed",
      body: `Your pooja (Booking ID: ${bookingId}) has been successfully completed`,
    },
    data: {
      booking_id: bookingId.toString(),
      notification_type: "panditBooking",
    },
    // channelId: "pooja_status",
  });
};

const sendCancelNotification = async (fcmToken, bookingId) => {
  return await sendNotification(fcmToken, {
    notification: {
      title: "Pooja Booking Canceled",
      body: `Booking (ID: ${bookingId}) has been canceled.`,
    },
    data: {
      booking_id: bookingId.toString(),
      notification_type: "panditBooking",
    },
    // channelId: "booking_status",
  });
};

// Bhajan Mandali Notifications
const sendBhajanMandaliNotification = async (fcmToken, bookingId) => {
  return await sendNotification(fcmToken, {
    notification: {
      title: "New Bhajan Mandali Booking",
      body: `New booking request (ID: ${bookingId}). Accept or reject.`,
    },
    data: {
      booking_id: bookingId,
      notification_type: 'bhajanMandaliBooking',
      activity_to_open: "com.deificdigital.paramparapartners.activities.BhajanMandaliActivity",
    },
    // channelId: "booking_requests",
  });
};

module.exports = {
  sendPanditAssignmentNotification,
  sendUserBookingNotification,
  sendPoojaStartNotification,
  sendPoojaCompleteNotification,
  sendCancelNotification,
  sendBhajanMandaliNotification,
};