const express = require("express");
const tourController = require("../controllers/tourController");
const tourRouter = express.Router({ mergeParams: true });
const authorizeUser = require("../middlewares/authorizeUser");

tourRouter.patch(
  "/tour-status-update",
  authorizeUser,
  tourController.updateTourStatus
);

module.exports = tourRouter;
