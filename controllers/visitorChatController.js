const response = require("../utils/response");
const VisitorChatService = require("../services/visitorChatService");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class visitorChatController {
  async createVisitorChat(req, res) {
    try {
      const chat = await VisitorChatService.createVisitorChat(req);

      if (chat) {
        response.success(res, 201, {
          message: "Chat created successfully",
          status: "success",
          data: chat,
        });
      } else {
        response.error(res, 400, {
          message: "There was some error while creating the chat",
          status: "failure",
        });
      }
    } catch (error) {
      console.log("Error while creating chat ->", error);
      response.error(res, 400);
    }
  }
  async getVisitorChats(req, res) {
    try {
      const chats = await VisitorChatService.getVisitorChats(req);

      if (chats) {
        response.success(res, 200, {
          message: "Chats fetched successfully",
          status: "success",
          data: chats,
        });
      } else {
        response.success(res, 200, {
          message: "Chat not found",
          status: "success",
        });
      }
    } catch (error) {
      console.log("Error while fetching chats ->", error);
      response.error(res, 400);
    }
  }
}

module.exports = new visitorChatController();
