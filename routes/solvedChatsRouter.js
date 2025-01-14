const express = require("express");
const solvedChatsRouter = express.Router({ mergeParams: true });
const solvedChatsController = require("../controllers/solvedChatsController");

solvedChatsRouter.patch(
  "/solved/:chatId",
  solvedChatsController.updateSolvedChat
);
solvedChatsRouter.get(
  "/solved/:workspaceId/:agentId",
  solvedChatsController.getSolvedChats
);
solvedChatsRouter.get(
  "/solved/:chatId",
  solvedChatsController.getSolvedChatMessages
);

module.exports = solvedChatsRouter;
