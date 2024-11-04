const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const getLoggedInUser = require("../utils/getLoggedInUser");

class WorkspaceService {
  async createWorkspace(req) {
    const { websiteAddress, workspaceName } = req.body;
    const loggedInUser = await getLoggedInUser(req);

    try {
      const workspace = await prisma.workspace.create({
        data: {
          website: websiteAddress,
          name: workspaceName,
          createdBy: loggedInUser.id,
        },
      });

      // const workspaceAssign = await prisma.workspaceAssign.create({
      //   data: {
      //     workspaceId: workspace.id,
      //     // userId:
      //   },
      // });

      return workspace;
    } catch (error) {
      throw new Error("Error while creating workspace ->", error);
    }
  }
  async getWorkspaces() {
    try {
      const workspaces = await prisma.workspace.findMany({});

      return workspaces;
    } catch (error) {
      console.log("ERROR ->", error);

      throw new Error("Error while getting workspaces ->", error);
    }
  }
}

module.exports = new WorkspaceService();
