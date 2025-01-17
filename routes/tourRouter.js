const express = require("express");
const tourController = require("../controllers/tourController");
const tourRouter = express.Router({ mergeParams: true });

tourRouter.patch("/tour-status-update", tourController.updateTourStatus);

module.exports = tourRouter;
