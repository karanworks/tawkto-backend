const express = require("express");
const loginRouter = express.Router({ mergeParams: true });
const loginValidator = require("../validators/loginValidator");
const loginController = require("../controllers/loginController");

loginRouter.post("/login", loginValidator.validateLogin, loginController.login);
loginRouter.get("/refresh-token", loginController.refreshToken);

module.exports = loginRouter;
