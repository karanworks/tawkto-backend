const express = require("express");
const visitorChatRouter = express.Router({ mergeParams: true });
const visitorChatController = require("../controllers/visitorChatController");

visitorChatRouter.get(
  "/visitor-chat/:visitorId",
  visitorChatController.getVisitorChats
);
// visitorChatRouter.post("/chat", visitorChatController.createVisitorChat);

module.exports = visitorChatRouter;
