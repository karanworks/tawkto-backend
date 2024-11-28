const express = require("express");
const openChatsRouter = express.Router({ mergeParams: true });
const openChatsController = require("../controllers/openChatsController");

openChatsRouter.get("/my-open/:agentId", openChatsController.getOpenChats);

module.exports = openChatsRouter;
