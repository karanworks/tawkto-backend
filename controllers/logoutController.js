const response = require("../utils/response");
const logoutService = require("../services/logoutService");

class LogoutController {
  async logout(req, res) {
    try {
      const user = logoutService.logout(req);
      if (user) {
        response.success(res, 200, {
          message: "User logged out successfully!",
          status: "success",
        });
      } else {
        response.success(res, 400, {
          message: "There was some error while logging out user!",
          status: "failure",
        });
      }
    } catch (error) {
      console.log("Error while logout ->", error);
      response.error(res, 400);
    }
  }
}

module.exports = new LogoutController();
