const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class WidgetStylesService {
  async createWidgetStyles(req) {
    try {
      const {
        backgroundColor,
        textColor,
        logoColor,
        sendButtonBackgroundColor,
      } = req.body;
      const { workspaceId } = req.params;

      const workspaceExist = await prisma.workspace.findFirst({
        where: {
          id: workspaceId,
        },
      });

      if (workspaceExist) {
        const widgetStyles = await prisma.widgetStyles.create({
          data: {
            workspaceId,
            theme: {
              backgroundColor,
              textColor,
              logoColor,
              sendButtonBackgroundColor,
            },
          },
        });

        return widgetStyles;
      } else {
        return null;
      }
    } catch (error) {
      throw new Error("Error while creating widget styles ->", error);
    }
  }
  async getWidgetStyles(req) {
    try {
      const { workspaceId } = req.params;

      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceId,
        },
      });

      if (workspace) {
        const widgetStyles = await prisma.widgetStyles.findFirst({
          where: {
            workspaceId,
          },
        });

        return widgetStyles;
      } else {
        return null;
      }
    } catch (error) {
      console.log("ERROR ->", error);

      throw new Error("Error while getting widget styles ->", error);
    }
  }
}

module.exports = new WidgetStylesService();
