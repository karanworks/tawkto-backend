const response = require("../utils/response");
const { PrismaClient } = require("@prisma/client");
const tourService = require("../services/tourService");
const prisma = new PrismaClient();

class tourController {
  async updateTourStatus(req, res) {
    try {
      const tourStatus = await tourService.updateTourStatus(req);

      console.log("TOUR STATUS UPDATE IN CONTROLLER ->", tourStatus);

      if (tourStatus.error) {
        return response.error(res, 200, {
          message: tourStatus.error,
          status: "failure",
        });
      }

      if (tourStatus && !tourStatus.error) {
        response.success(res, 201, {
          message: "Tour Status successfully",
          status: "success",
          // data: tourStatus,
        });
      } else {
        response.error(res, 400, {
          message: "There was some error while updating the tour status",
          status: "failure",
        });
      }
    } catch (error) {
      console.log("Error while updating the tour status ->", error);
      response.error(res, 400);
    }
  }
}

module.exports = new tourController();
