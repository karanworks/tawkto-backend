const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const getLoggedInUser = require("../utils/getLoggedInUser");

class WorkspaceService {
  async createWorkspace(req) {
    try {
      const { websiteAddress, workspaceName } = req.body;
      const loggedInUser = await getLoggedInUser(req);

      console.log("LOGGED IN USER ->", loggedInUser);

      const alreadyExists = await prisma.workspace.findFirst({
        where: {
          website: websiteAddress,
        },
      });

      if (alreadyExists) {
        return { error: "Website is already registered" };
      }

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
      console.log("Error while creating workspace ->", error);

      throw new Error("Error while creating workspace ->", error);
    }
  }
  async getUserDetails(req) {
    try {
      return true;
    } catch (error) {
      console.log("ERROR ->", error);

      throw new Error("Error while getting workspaces ->", error);
    }
  }
  async getWorkspaces(req) {
    try {
      const { userId } = req.params;

      const workspaceMember = await prisma.workspaceMembers.findFirst({
        where: {
          memberId: userId,
        },
      });

      if (workspaceMember) {
        const workspaces = await prisma.workspace.findFirst({
          where: {
            id: workspaceMember.workspaceId,
          },
        });

        return workspaces;
      } else {
        return null;
      }
    } catch (error) {
      console.log("ERROR ->", error);

      throw new Error("Error while getting workspaces ->", error);
    }
  }
}

module.exports = new WorkspaceService();
