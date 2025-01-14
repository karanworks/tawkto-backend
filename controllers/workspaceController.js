const response = require("../utils/response");
const WorkspaceService = require("../services/workspaceService");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class workspaceController {
  async createWorkspace(req, res) {
    try {
      const workspace = await WorkspaceService.createWorkspace(req);

      if (workspace.error) {
        return response.error(res, 200, {
          message: workspace.error,
          status: "failure",
        });
      }

      if (workspace && !workspace.error) {
        response.success(res, 201, {
          message: "Workspace created successfully",
          status: "success",
          data: workspace,
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
  async getWorkspaces(req, res) {
    try {
      const workspaces = await WorkspaceService.getWorkspaces(req);

      if (workspaces) {
        response.success(res, 200, {
          message: "Workspace fetched successfully",
          status: "success",
          data: workspaces,
        });
      } else {
        response.success(res, 200, {
          message: "Workspace not found",
          status: "success",
        });
      }
    } catch (error) {
      console.log("Error while fetching workspace ->", error);
      response.error(res, 400);
    }
  }
}

module.exports = new workspaceController();
