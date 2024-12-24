const express = require("express");
const chatRequestRouter = express.Router({ mergeParams: true });
const chatRequestController = require("../controllers/chatRequestsController");

chatRequestRouter.get(
  "/chat-requests/:workspaceId/:agentId",
  chatRequestController.getChatRequests
);
chatRequestRouter.get(
  "/chat-request/:chatId",
  chatRequestController.getChatRequestMessages
);
chatRequestRouter.post(
  "/chat-request",
  chatRequestController.createChatRequest
);

module.exports = chatRequestRouter;
