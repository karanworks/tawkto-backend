const express = require("express");
const logoutRouter = express.Router({ mergeParams: true });
const logoutController = require("../controllers/logoutController");

logoutRouter.get("/logout", logoutController.logout);

module.exports = logoutRouter;
