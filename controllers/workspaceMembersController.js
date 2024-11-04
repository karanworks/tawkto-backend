const response = require("../utils/response");
const workspaceMembersService = require("../services/workspaceMembersService");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class workspaceMembersController {
  async inviteWorkspaceMembers(req, res) {
    try {
      const workspaceMember = await workspaceMembersService.inviteMember(req);

      if (workspaceMember) {
        response.success(res, 201, {
          message: "Workspace member invited successfully",
          status: "success",
        });
      } else {
        response.error(res, 400, {
          message: "There was some error while inviting the workspace member",
          status: "failure",
        });
      }
    } catch (error) {
      console.log("Error while inviting workspace member ->", error);
      response.error(res, 400);
    }
  }
  async setPassword(req, res) {
    try {
      const user = await workspaceMembersService.setPassword(req);

      console.log("INVITED USER ->", user);

      // if (user) {
      //   response.success(res, 201, {
      //     message: "Workspace member invited successfully",
      //     status: "success",
      //   });
      // } else {
      //   response.error(res, 400, {
      //     message: "There was some error while inviting the workspace member",
      //     status: "failure",
      //   });
      // }
    } catch (error) {
      console.log("Error while inviting workspace member ->", error);
      response.error(res, 400);
    }
  }
}

module.exports = new workspaceMembersController();
