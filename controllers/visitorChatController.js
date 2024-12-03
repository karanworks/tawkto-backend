const response = require("../utils/response");
const VisitorChatService = require("../services/visitorChatService");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class visitorDetailsController {
  async getVisitorChats(req, res) {
    try {
      const chat = await VisitorChatService.getVisitorChats(req);

      if (chat) {
        response.success(res, 200, {
          message: "visitor chats fetched successfully",
          status: "success",
          data: chat,
        });
      } else {
        response.success(res, 200, {
          message: "visitor chat not found",
          status: "success",
        });
      }
    } catch (error) {
      console.log("Error while fetching visitor chats ->", error);
      response.error(res, 400);
    }
  }
}

module.exports = new visitorDetailsController();
