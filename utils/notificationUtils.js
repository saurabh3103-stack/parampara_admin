// utils/notificationUtils.js
const admin = require('../config/firebase');

// General notification sender
const sendNotification = async (token, notificationData) => {
  console.log(token, notificationData);
  if (!token) {
    console.log('❌ No FCM token available.');
    return false;
  }

  const message = {
    token,
    data: notificationData.data || {},
    // notification: notificationData.notification,
    android: {
      priority: 'high',
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
    console.error('❌ Error sending notification:', error.message);
    return false;
  }
};

// Specific notification functions
const sendBhajanMandaliNotification = async (fcmToken, mandaliBooking) => {
  const notificationData = {
    data: {
      title: 'New Bhajan Mandali Booking',
      body: `New booking request (ID: ${mandaliBooking.bookingId}). Accept or reject.`,
      booking_id: mandaliBooking.bookingId,
      booking_type: 'bhajanMandaliBooking',
      booking_time: `Schedule Date: ${mandaliBooking.schedule.date} Time: ${mandaliBooking.schedule.time}`,
    },
    channelId: 'booking_requests',
  };

  return await sendNotification(fcmToken, notificationData);
};

const sendBookingStatusNotification = async (
  userFcmToken,
  bookingId,
  status,
) => {


  console.log(userFcmToken, bookingId,status,"OF SEND BHAJAN BOOKING STATUS NOTIFICATION")
  const statusText =
    status === 1
      ? 'accepted'
      : status === 2
      ? 'started'
      : status === 3
      ? 'completed'
      : 'rejected';

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

const sendOrderNotification = async (fcmToken, orderDetails) => {
  console.log("from send order notification function,",fcmToken,orderDetails)
  const notificationData = {
    data: {
      title: 'New Order Created',
      body: `Your order (ID: ${orderDetails.orderId}) has been placed successfully.`,
      order_id: orderDetails.orderId,
      order_status: orderDetails.orderStatus.toString(),
      booking_type: 'ecommerce',
    },
  };

  return await sendNotification(fcmToken, notificationData);
};

const sendOrderStatusUpdateNotification = async (
  fcmToken,
  orderId,
  orderStatus,
) => {
  const statusText =
    orderStatus === 'pending'
      ? 'Pending'
      : orderStatus === 'shipped'
      ? 'Shipped'
      : 'Delivered';

  const notificationData = {
    data: {
      title: `Order Status Updated`,
      body: `Your order (ID: ${orderId}) is now ${statusText}.`,
      booking_type: 'ecommerce',
      order_id: orderId,
      order_status: orderStatus,
    },
  };

  return await sendNotification(fcmToken, notificationData);
};

const sendPaymentStatusUpdateNotification = async (
  fcmToken,
  combinedPaymentId,
  transactionStatus,
) => {
  console.log(fcmToken, combinedPaymentId, transactionStatus);
  const statusText =
    transactionStatus === 'pending'
      ? 'Pending'
      : transactionStatus === 'completed'
      ? 'Completed'
      : 'Failed';

  const notificationData = {
    data: {
      title: `Payment Status Updated`,
      body: `Your payment for orders with ID: ${combinedPaymentId} is now ${statusText}.`,
      combined_payment_id: combinedPaymentId,
      transaction_status: transactionStatus,
      booking_type: 'ecommerce',
    },
  };

  return await sendNotification(fcmToken, notificationData);
};


const sendCancelNotification = async (fcmToken, bookingId) => {
  const notificationData = {
    data: {
      title: 'Bhajan Mandali Booking Cancelled',
      body: `Booking (ID: ${bookingId}) has been cancelled by the user.`,
      booking_id: bookingId,
      booking_type: 'bhajanMandaliBooking',
      status: 'cancelled',
    },
    channelId: 'booking_updates',
  };

  return await sendNotification(fcmToken, notificationData);
};

module.exports = {
  sendNotification,
  sendBhajanMandaliNotification,
  sendBookingStatusNotification,
  sendPaymentStatusUpdateNotification,
  sendOrderNotification,
  sendOrderStatusUpdateNotification,
  sendCancelNotification
};