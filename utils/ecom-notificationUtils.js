const Notification = require('../models/NotificationModel');

exports.createNotification = async ({ userId, title, message, type, relatedId }) => {
  try {
    // Validate inputs
    if (!userId || !title || !message || !type) {
      throw new Error('Missing required notification parameters');
    }

    const newNotification = new Notification({
      userId,
      title,
      message,
      type,
      relatedId: relatedId || null,
      isRead: false,
      createdAt: new Date()
    });

    await newNotification.save();
    
    // Here you could add real-time notification delivery (e.g., via Socket.io)
    // socketServer.to(userId).emit('new-notification', newNotification);

    return {
      success: true,
      notification: newNotification
    };
  } catch (error) {
    console.error('Failed to create notification:', {
      error: error.message,
      userId,
      type
    });
    
    throw new Error(`Failed to create notification: ${error.message}`);
  }
};

exports.getUserNotifications = async (userId, limit = 10) => {
  try {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return {
      success: true,
      notifications
    };
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    throw new Error('Failed to fetch notifications');
  }
};

exports.markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      throw new Error('Notification not found');
    }

    return {
      success: true,
      notification
    };
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw new Error('Failed to mark notification as read');
  }
};