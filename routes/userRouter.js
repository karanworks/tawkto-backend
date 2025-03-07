const express = require("express");
const userRouter = express.Router({ mergeParams: true });
const userUpdateValidator = require("../validators/userUpdateValidator");
const UserController = require("../controllers/userController");
const authorizeUser = require("../middlewares/authorizeUser");

userRouter.patch(
  "/user/:userId/delete",
  // authorizeUser,
  UserController.deleteUser
);
userRouter.patch(
  "/user/:userId",
  authorizeUser,
  userUpdateValidator.validateDetails,
  UserController.updateUser
);

module.exports = userRouter;
