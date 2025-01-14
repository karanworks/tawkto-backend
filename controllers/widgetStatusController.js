const response = require("../utils/response");
const WidgetStatusService = require("../services/widgetStatusService");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class WidgetStatusController {
  async updateWidgetStatus(req, res) {
    try {
      const workspace = await WidgetStatusService.updateWidgetStatus(req);

      console.log("ERROR WHILE UPDATING WORKSPACE STATUS -> ->", workspace);

      if (workspace.error) {
        return response.error(res, 200, {
          message: workspace.error,
          status: "failure",
        });
      }

      if (workspace && !workspace.error) {
        response.success(res, 201, {
          message: "Widget status updated successfully",
          status: "success",
          data: workspace,
        });
      } else {
        response.error(res, 400, {
          message: "There was some error while updating the widget status",
          status: "failure",
        });
      }
    } catch (error) {
      console.log("Error while updating updating widget status ->", error);
      response.error(res, 400);
    }
  }
}

module.exports = new WidgetStatusController();
