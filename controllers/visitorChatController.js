const response = require("../utils/response");
const VisitorChatService = require("../services/visitorChatService");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class visitorDetailsController {
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

module.exports = new visitorDetailsController();
