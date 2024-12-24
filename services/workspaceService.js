const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const getLoggedInUser = require("../utils/getLoggedInUser");

class WorkspaceService {
  async createWorkspace(req) {
    try {
      const { websiteAddress, workspaceName } = req.body;
      const loggedInUser = await getLoggedInUser(req);

      const workspace = await prisma.workspace.create({
        data: {
          website: websiteAddress,
          name: workspaceName,
          createdBy: loggedInUser.id,
        },
      });

      await prisma.workspaceMembers.create({
        data: {
          workspaceId: workspace.id,
          memberId: loggedInUser.id,
          invitationAccepted: true,
        },
      });

      // Default widget styles
      await prisma.widgetStyles.create({
        data: {
          workspaceId: workspace.id,
          theme: {
            backgroundColor: "#3BA9E5",
            textColor: "#ffffff",
            logoColor: "#3BA9E5",
            sendButtonBackgroundColor: "#3BA9E5",
          },
        },
      });

      return workspace;
    } catch (error) {
      throw new Error("Error while creating workspace ->", error);
    }
  }
  async getWorkspaces(req) {
    try {
      const { userId } = req.params;

      // const workspaces = await prisma.workspace.findFirst({
      //   where: {
      //     createdBy: userId,
      //   },
      // });
      const workspaceMember = await prisma.workspaceMembers.findFirst({
        where: {
          memberId: userId,
        },
      });

      const workspaces = await prisma.workspace.findFirst({
        where: {
          id: workspaceMember.workspaceId,
        },
      });

      return workspaces;
    } catch (error) {
      console.log("ERROR ->", error);

      throw new Error("Error while getting workspaces ->", error);
    }
  }
}

module.exports = new WorkspaceService();
