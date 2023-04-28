const asyncHandler = require("express-async-handler");
const { Notification } = require("../models/notificationModel");

module.exports.sendNotificationController = asyncHandler(
  async (userId, message) => {
    await Notification.create({
      message,
      user: userId,
    });
  }
);

/**
 * @description     Get all notifications
 * @router          /notifications
 * @method          GET
 * @access          private(only logged in)
 */

module.exports.getNotificationsController = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    user: req.user.id,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    status: true,
    notifications,
  });
});

/**
 * @description     Read notification
 * @router          /notifications/:notificationId
 * @method          PUT
 * @access          public
 */

module.exports.readNotificationController = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  console.log(notificationId);
  await Notification.findByIdAndUpdate(notificationId, {
    isRead: true,
  });
  res.status(200).json({ status: true });
});
