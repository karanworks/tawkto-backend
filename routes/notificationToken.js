const express = require("express");
const notificationTokenRouter = express.Router({ mergeParams: true });
const notificationTokenController = require("../controllers/notificationTokenController");

notificationTokenRouter.post(
  "/notification-token/:userId",
  notificationTokenController.registerNotificationController
);

module.exports = notificationTokenRouter;
