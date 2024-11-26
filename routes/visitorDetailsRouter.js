const express = require("express");
const visitorDetailsRouter = express.Router({ mergeParams: true });
const VisitorDetailsController = require("../controllers/visitorDetailsController");

visitorDetailsRouter.get(
  "/visitor-details/:workspaceId/:visitorId",
  VisitorDetailsController.getVisitorDetails
);

module.exports = visitorDetailsRouter;
