const express = require("express");
const workspaceMembersRouter = express.Router({ mergeParams: true });
const workspaceMembersValidator = require("../validators/workspaceMembersValidator");
const workspaceMembersController = require("../controllers/workspaceMembersController");

workspaceMembersRouter.post(
  "/invite-member",
  workspaceMembersValidator.validateWorkspaceMembers,
  workspaceMembersController.inviteWorkspaceMembers
);
workspaceMembersRouter.post(
  "/set-password/user/:userId",
  workspaceMembersController.setPassword
);

module.exports = workspaceMembersRouter;
