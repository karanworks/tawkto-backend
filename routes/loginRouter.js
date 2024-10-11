const express = require("express");
const loginRouter = express.Router({ mergeParams: true });
const loginValidator = require("../validators/loginValidator");
const loginController = require("../controllers/loginController");

loginRouter.post("/login", loginValidator.validateLogin, loginController.login);

module.exports = loginRouter;
