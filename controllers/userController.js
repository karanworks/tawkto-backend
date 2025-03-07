const response = require("../utils/response");
const userService = require("../services/userService");

class UserController {
  async updateUser(req, res) {
    try {
      const { user, error } = await userService.updateUser(req);

      if (error) {
        return response.error(res, 200, {
          message: error,
          status: "failure",
        });
      }

      console.log("CHECKING USER RESPONSE ->", user);

      if (user) {
        console.log("SENDING USER RESPONSE ->", user);

        response.success(res, 200, {
          message: "User updated successfully",
          status: "success",
          data: user,
        });
      }
    } catch (error) {
      console.log("Error while updating user details ->", error);
      response.error(res, 400);
    }
  }
  async deleteUser(req, res) {
    try {
      const { user, error } = await userService.deleteUser(req);

      if (error) {
        return response.error(res, 200, {
          message: error,
          status: "failure",
        });
      }

      if (user) {
        response.success(res, 200, {
          message: "User delete successfully",
          status: "success",
          data: user,
        });
      }
    } catch (error) {
      console.log("Error while delete user details ->", error);
      response.error(res, 400);
    }
  }
}

module.exports = new UserController();
