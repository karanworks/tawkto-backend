const express = require("express");
const workspaceMembersRouter = express.Router({ mergeParams: true });
const workspaceMembersValidator = require("../validators/workspaceMembersValidator");
const workspaceMembersController = require("../controllers/workspaceMembersController");
const authorizeUser = require("../middlewares/authorizeUser");

workspaceMembersRouter.get(
  "/workspace-members/:workspaceId",
  authorizeUser,
  workspaceMembersController.workspaceMembers
);
workspaceMembersRouter.post(
  "/invite-member",
  workspaceMembersValidator.validateWorkspaceMembers,
  workspaceMembersController.inviteWorkspaceMembers
);
workspaceMembersRouter.post(
  "/set-password",
  workspaceMembersController.setPassword
);
workspaceMembersRouter.get(
  "/join/:userId/workspace/:workspaceId",
  workspaceMembersController.joinWorkspace
);

module.exports = workspaceMembersRouter;
