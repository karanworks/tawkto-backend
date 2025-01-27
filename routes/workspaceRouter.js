const express = require("express");
const workspaceRouter = express.Router({ mergeParams: true });
const workspaceValidator = require("../validators/workspaceValidator");
const workspaceController = require("../controllers/workspaceController");
const authorizeUser = require("../middlewares/authorizeUser");

workspaceRouter.get(
  "/get-user-details",
  authorizeUser,
  workspaceController.getUserDetails
);
workspaceRouter.post(
  "/workspace",
  authorizeUser,
  workspaceValidator.validateWorkspace,
  workspaceController.createWorkspace
);

module.exports = workspaceRouter;
