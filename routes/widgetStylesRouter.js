const express = require("express");
const widgetStylesRouter = express.Router({ mergeParams: true });
const WidgetStylesController = require("../controllers/widgetStylesController");

widgetStylesRouter.get(
  "/widget-settings/:workspaceId",
  WidgetStylesController.getWidgetStyles
);
widgetStylesRouter.post(
  "/widget-settings/:workspaceId",
  WidgetStylesController.createWidgetStyles
);

module.exports = widgetStylesRouter;
