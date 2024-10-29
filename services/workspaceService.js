const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class WorkspaceService {
  async createWorkspace(body) {
    const { websiteAddress, workspaceName } = body;

    try {
      const workspace = await prisma.workspace.create({
        data: {
          website: websiteAddress,
          name: workspaceName,
        },
      });

      console.log("WORKSPACE ->", workspace);

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
