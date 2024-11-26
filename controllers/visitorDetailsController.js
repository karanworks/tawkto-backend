const response = require("../utils/response");
const VisitorDetailsService = require("../services/visitorDetailsService");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class VisitorDetailsController {
  async getVisitorDetails(req, res) {
    try {
      const chats = await VisitorDetailsService.getVisitorDetails(req);

      if (chats) {
        response.success(res, 200, {
          message: "Visitor details fetched successfully",
          status: "success",
          data: chats,
        });
      } else {
        response.success(res, 200, {
          message: "Visitor details not found",
          status: "success",
        });
      }
    } catch (error) {
      console.log("Error while fetching chats ->", error);
      response.error(res, 400);
    }
  }
}

module.exports = new VisitorDetailsController();
