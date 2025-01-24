const response = require("../utils/response");
const loginService = require("../services/loginService");

const getMenus = require("../utils/getMenus");

class LoginController {
  async login(req, res) {
    try {
      const { user, tokens } = await loginService.login(req.body);

      if (user?.error) {
        return response.error(res, 200, {
          message: user.error,
          status: "failure",
        });
      }

      if (user) {
        if (!user.isVerified) {
          return response.error(res, 400, {
            message: "Please verify your email",
            status: "failure",
          });
        } else {
          // cookie expiration date - 15 days
          const expirationDate15d = new Date(
            Date.now() + 15 * 24 * 60 * 60 * 1000
          );

          // cookie expiration date - 30 days
          const expirationDate30d = new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          );

          res.cookie("token", user.token, {
            expires: expirationDate15d,
            httpOnly: true,
            secure: true,
            sameSite: true,
            domain: "ascent-bpo.com",
          });
          res.cookie("refresh_token", tokens.refreshToken, {
            expires: expirationDate30d,
            httpOnly: true,
            secure: true,
            sameSite: true,
            domain: "ascent-bpo.com",
          });

          const menus = await getMenus(req, res, user);

          response.success(res, 200, {
            message: "User logged in successfully",
            status: "success",
            data: { ...user, menus, access_token: tokens.accessToken },
          });
        }
      }
    } catch (error) {
      console.log("Error while login ->", error);
      response.error(res, 400);
    }
  }
  async refreshToken(req, res) {
    try {
      const { access_token } = await loginService.refreshToken(req, res);

      if (access_token) {
        response.success(res, 200, {
          message: "Token refreshed successfully",
          status: "success",
          data: { access_token },
        });
      }
    } catch (error) {
      console.log(
        "Error in login controller while refreshing access token  ->",
        error
      );
      response.error(res, 400);
    }
  }
}

module.exports = new LoginController();
