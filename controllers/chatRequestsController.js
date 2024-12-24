const response = require("../utils/response");
const { PrismaClient } = require("@prisma/client");
const ChatRequestsService = require("../services/chatRequestsService");
const prisma = new PrismaClient();

class ChatRequestsController {
  async createChatRequest(req, res) {
    try {
      const chatRequests = await ChatRequestsService.createChatRequest(req);

      if (chatRequests) {
        response.success(res, 201, {
          message: "Chat requests created successfully",
          status: "success",
          data: chat,
        });
      } else {
        response.error(res, 400, {
          message: "There was some error while creating the chat request",
          status: "failure",
        });
      }
    } catch (error) {
      console.log("Error while creating chat request ->", error);
      response.error(res, 400);
    }
  }
  async getChatRequests(req, res) {
    try {
      const chatRequests = await ChatRequestsService.getChatRequests(req);

      if (chatRequests) {
        response.success(res, 200, {
          message: "Chat requests fetched successfully",
          status: "success",
          data: chatRequests,
        });
      } else {
        response.success(res, 200, {
          message: "Chat request not found",
          status: "success",
        });
      }
    } catch (error) {
      console.log("Error while fetching chat requests ->", error);
      response.error(res, 400);
    }
  }
  async getChatRequestMessages(req, res) {
    try {
      const chatRequest = await ChatRequestsService.getChatRequestMessages(req);

      console.log(
        "CHAT REQUEST MESSAGES IN GET CHAT REQUEST MESSAGES CONTROLLER ->",
        chatRequest
      );

      if (chatRequest) {
        response.success(res, 200, {
          message: "Chat request messages fetched successfully",
          status: "success",
          data: chatRequest,
        });
      } else {
        response.success(res, 200, {
          message: "Chat request messages not found",
          status: "success",
        });
      }
    } catch (error) {
      console.log("Error while fetching chat request messages ->", error);
      response.error(res, 400);
    }
  }
}

module.exports = new ChatRequestsController();
