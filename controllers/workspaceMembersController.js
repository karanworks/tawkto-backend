const response = require("../utils/response");
const workspaceMembersService = require("../services/workspaceMembersService");
const { PrismaClient } = require("@prisma/client");
const getMenus = require("../utils/getMenus");
const prisma = new PrismaClient();

class workspaceMembersController {
  async workspaceMembers(req, res) {
    try {
      const workspaceMembers = await workspaceMembersService.workspaceMembers(
        req
      );

      if (workspaceMembers) {
        response.success(res, 201, {
          message: "Workspace member invited successfully",
          status: "success",
          workspaceMembers: workspaceMembers,
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
  async inviteWorkspaceMembers(req, res) {
    try {
      const workspaceMember = await workspaceMembersService.inviteMember(req);

      if (workspaceMember) {
        response.success(res, 201, {
          message: "Workspace member invited successfully",
          status: "success",
          data: {
            name: workspaceMember.name,
            email: workspaceMember.email,
            invitationAccepted: false,
          },
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

      if (user) {
        const menus = await getMenus(req, res, user);

        // cookie expiration date - 15 days

        response.success(res, 201, {
          message: "Workspace member joined successfully",
          status: "success",
          data: {
            user: {
              ...user,
              menus,
            },
            workspace: user.workspace,
          },
        });
      } else {
        response.error(res, 400, {
          message:
            "There was some error while setting password for workspace member",
          status: "failure",
        });
      }
    } catch (error) {
      console.log("Error while inviting workspace member ->", error);
      response.error(res, 400);
    }
  }
  async joinWorkspace(req, res) {
    try {
      const user = await workspaceMembersService.joinWorkspace(req);

      if (user) {
        // res.redirect("http://localhost:3000/login");
        const URL =
          process.env.NODE_ENV === "production"
            ? process.env.CLIENT_PROD_URL
            : process.env.CLIENT_DEV_URL;

        res.redirect(URL);
        // response.success(res, 201, {
        //   message: "Member joined workspace successfully",
        //   status: "success",
        // });
      } else {
        response.error(res, 400, {
          message: "There was some error while joining workspace",
          status: "failure",
        });
      }
    } catch (error) {
      console.log("Error while joining workspace ->", error);
      response.error(res, 400);
    }
  }
}

module.exports = new workspaceMembersController();
