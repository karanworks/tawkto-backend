const response = require("../utils/response");
const loginService = require("../services/loginService");

const getMenus = require("../utils/getMenus");

class LoginController {
  async login(req, res) {
    try {
      const { user, accessToken, error } = await loginService.login(req.body);

      if (error) {
        return response.error(res, 200, {
          message: error,
          status: "failure",
        });
      }

      if (user) {
        // if (!user.isVerified) {
        //   return response.error(res, 400, {
        //     message: "Please verify your email",
        //     status: "failure",
        //   });
        // } else if (!user.status) {
        //   return response.error(res, 403, {
        //     message: "Your account has been deactivated",
        //     status: "failure",
        //   });
        // } else {
        const menus = await getMenus(req, res, user);

        response.success(res, 200, {
          message: "User logged in successfully",
          status: "success",
          data: { ...user, menus, access_token: accessToken },
        });
      }
      // }
    } catch (error) {
      console.log("Error while login ->", error);
      response.error(res, 400);
    }
  }
  // async refreshToken(req, res) {
  //   try {
  //     const { access_token } = await loginService.refreshToken(req, res);

  //     if (access_token) {
  //       response.success(res, 200, {
  //         message: "Token refreshed successfully",
  //         status: "success",
  //         data: { access_token },
  //       });
  //     }
  //   } catch (error) {
  //     console.log(
  //       "Error in login controller while refreshing access token  ->",
  //       error
  //     );
  //     response.error(res, 400);
  //   }
  // }
}

module.exports = new LoginController();
