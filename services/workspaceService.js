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
}

module.exports = new WorkspaceService();
