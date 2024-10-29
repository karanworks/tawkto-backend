const express = require("express");
const workspaceMembersRouter = express.Router({ mergeParams: true });
const workspaceMembersValidator = require("../validators/workspaceMembersValidator");
const workspaceMembersController = require("../controllers/workspaceMembersController");

workspaceMembersRouter.post(
  "/invite",
  workspaceMembersValidator.validateWorkspaceMembers,
  workspaceMembersController.inviteWorkspaceMembers
);

module.exports = workspaceMembersRouter;
