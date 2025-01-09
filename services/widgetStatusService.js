const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const getLoggedInUser = require("../utils/getLoggedInUser");

class WidgetStatusService {
  async updateWidgetStatus(req) {
    try {
      const { workspaceId } = req.params;
      const loggedInUser = await getLoggedInUser(req);

      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceId,
        },
      });

      const updatedStatus = await prisma.workspace.update({
        where: {
          id: workspace.id,
        },
        data: {
          isWidgetConnected: true,
        },
      });

      console.log("WORKSPACE FOR UPDATING WIDGET STATUS ->", workspace);

      return updatedStatus;
    } catch (error) {
      throw new Error(
        "Error while udpating widget status in workspace ->",
        error
      );
    }
  }
}

module.exports = new WidgetStatusService();
