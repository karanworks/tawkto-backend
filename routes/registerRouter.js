const express = require("express");
const registerRouter = express.Router({ mergeParams: true });
const registerValidator = require("../validators/registerValidator");
const registerController = require("../controllers/registerController");

registerRouter.post(
  "/register",
  registerValidator.validateRegister,
  registerController.register
);
registerRouter.get("/verify-email", registerController.verifyEmail);

module.exports = registerRouter;
