const response = require("../utils/response");
const WidgetStylesService = require("../services/widgetStylesService");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class WidgetStylesController {
  async createWidgetStyles(req, res) {
    try {
      const widgetStyles = await WidgetStylesService.createWidgetStyles(req);

      if (widgetStyles) {
        response.success(res, 201, {
          message: "Widget styles created successfully",
          status: "success",
          data: widgetStyles,
        });
      } else {
        response.error(res, 400, {
          message: "There was some error while creating the widget styles",
          status: "failure",
        });
      }
    } catch (error) {
      console.log("Error while creating widget styles ->", error);
      response.error(res, 400);
    }
  }
  async getWidgetStyles(req, res) {
    try {
      const widgetStyles = await WidgetStylesService.getWidgetStyles(req);

      if (widgetStyles) {
        response.success(res, 200, {
          message: "Widget styles fetched successfully",
          status: "success",
          data: widgetStyles,
        });
      } else {
        response.success(res, 200, {
          message: "Widget styles not found",
          status: "success",
        });
      }
    } catch (error) {
      console.log("Error while fetching widgetStyless ->", error);
      response.error(res, 400);
    }
  }
}

module.exports = new WidgetStylesController();
