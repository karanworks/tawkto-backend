const express = require("express");
const chatRequestRouter = express.Router({ mergeParams: true });
const chatRequestController = require("../controllers/chatRequestsController");

chatRequestRouter.get(
  "/chat-requests/:agentId",
  chatRequestController.getChatRequests
);
chatRequestRouter.post(
  "/chat-request",
  chatRequestController.createChatRequest
);

module.exports = chatRequestRouter;
