const express = require("express");
const widgetStatusRouter = express.Router({ mergeParams: true });
const WidgetStatusController = require("../controllers/widgetStatusController");

widgetStatusRouter.patch(
  "/widget-status/update/:workspaceId",
  WidgetStatusController.updateWidgetStatus
);

module.exports = widgetStatusRouter;
