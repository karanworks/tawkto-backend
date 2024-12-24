const express = require("express");
const openChatsRouter = express.Router({ mergeParams: true });
const openChatsController = require("../controllers/openChatsController");

openChatsRouter.get(
  "/my-open/:workspaceId/:agentId",
  openChatsController.getOpenChats
);
openChatsRouter.get(
  "/my-open/:chatId",
  openChatsController.getOpenChatMessages
);

module.exports = openChatsRouter;
