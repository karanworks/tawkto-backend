const response = require("../utils/response");
const { PrismaClient } = require("@prisma/client");
const SolvedChatsService = require("../services/solvedChatsService");

class SolvedChatsController {
  async updateSolvedChat(req, res) {
    try {
      const updatedChat = await SolvedChatsService.updateSolvedChat(req);

      if (updatedChat) {
        response.success(res, 200, {
          message: "Solved chats fetched successfully",
          status: "success",
          data: updatedChat,
        });
      } else {
        response.success(res, 200, {
          message: "solved chats not found",
          status: "failure",
        });
      }
    } catch (error) {
      console.log("Error while fetching solved chat ->", error);
      response.error(res, 400);
    }
  }
  async getSolvedChats(req, res) {
    try {
      const openChats = await SolvedChatsService.getSolvedChats(req);

      if (openChats) {
        response.success(res, 200, {
          message: "Solved chats fetched successfully",
          status: "success",
          data: openChats,
        });
      } else {
        response.success(res, 200, {
          message: "solved chats not found",
          status: "success",
        });
      }
    } catch (error) {
      console.log("Error while fetching solved chat ->", error);
      response.error(res, 400);
    }
  }
  async getSolvedChatMessages(req, res) {
    try {
      const openChatMessages = await SolvedChatsService.getSolvedChatMessages(
        req
      );

      if (openChatMessages) {
        response.success(res, 200, {
          message: "solved chat messages fetched successfully",
          status: "success",
          data: openChatMessages,
        });
      } else {
        response.success(res, 200, {
          message: "solved chats not found",
          status: "success",
        });
      }
    } catch (error) {
      console.log("Error while fetching solved chat messages ->", error);
      response.error(res, 400);
    }
  }
}

module.exports = new SolvedChatsController();
