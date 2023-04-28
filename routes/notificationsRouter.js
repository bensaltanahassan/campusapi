const {
  getNotificationsController,
  readNotificationController,
} = require("../controllers/notificationsController");
const verifyToken = require("../middleware/verifyToken");

const notificationRouter = require("express").Router();

notificationRouter.route("/").get(verifyToken, getNotificationsController);

notificationRouter
  .route("/:notificationId")
  .put(verifyToken, readNotificationController);

module.exports = notificationRouter;
