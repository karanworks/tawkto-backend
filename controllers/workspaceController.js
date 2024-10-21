const response = require("../utils/response");
const WorkspaceService = require("../services/workspaceService");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class workspaceController {
  async createWorkspace(req, res) {
    try {
      const workspace = await WorkspaceService.createWorkspace(req.body);

      console.log("WORKSPACE CREATED ->", workspace);

      if (workspace) {
        response.success(res, 201, {
          message: "Workspace created successfully",
          status: "success",
        });
      } else {
        response.error(res, 400, {
          message: "There was some error while creating the workspace",
          status: "failure",
        });
      }
    } catch (error) {
      console.log("Error while creating workspace ->", error);
      response.error(res, 400);
    }
  }
}

module.exports = new workspaceController();
