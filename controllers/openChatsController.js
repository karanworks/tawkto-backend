const response = require("../utils/response");
const { PrismaClient } = require("@prisma/client");
const OpenChatsService = require("../services/openChatsService");
const prisma = new PrismaClient();

class OpenChatsController {
  async getOpenChats(req, res) {
    try {
      const openChats = await OpenChatsService.getOpenChats(req);

      if (openChats) {
        response.success(res, 200, {
          message: "open chats fetched successfully",
          status: "success",
          data: openChats,
        });
      } else {
        response.success(res, 200, {
          message: "open chats not found",
          status: "success",
        });
      }
    } catch (error) {
      console.log("Error while fetching open chat ->", error);
      response.error(res, 400);
    }
  }
  async getOpenChatMessages(req, res) {
    try {
      const openChatMessages = await OpenChatsService.getOpenChatMessages(req);

      if (openChatMessages) {
        response.success(res, 200, {
          message: "open chat messages fetched successfully",
          status: "success",
          data: openChatMessages,
        });
      } else {
        response.success(res, 200, {
          message: "open chats not found",
          status: "success",
        });
      }
    } catch (error) {
      console.log("Error while fetching open chat ->", error);
      response.error(res, 400);
    }
  }
}

module.exports = new OpenChatsController();
