const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class WidgetStatusService {
  async updateWidgetStatus(req) {
    try {
      const { workspaceId } = req.params;

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

      return updatedStatus;
    } catch (error) {
      console.log("ERROR WHILE UPDATING WORKSPACE STATUS ->", error);

      throw new Error(
        "Error while udpating widget status in workspace ->",
        error
      );
    }
  }
}

module.exports = new WidgetStatusService();
