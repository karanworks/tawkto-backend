const express = require("express");
const workspaceRouter = express.Router({ mergeParams: true });
const workspaceValidator = require("../validators/workspaceValidator");
const workspaceController = require("../controllers/workspaceController");

workspaceRouter.get("/workspace", workspaceController.getWorkspaces);
workspaceRouter.post(
  "/workspace",
  workspaceValidator.validateWorkspace,
  workspaceController.createWorkspace
);

module.exports = workspaceRouter;
