const response = require("../utils/response");
const loginService = require("../services/loginService");

const getMenus = require("../utils/getMenus");
const { Prisma } = require("@prisma/client");

class LoginController {
  async login(req, res) {
    try {
      const user = await loginService.login(req.body);

      if (user) {
        if (!user.isVerified) {
          response.error(res, 400, {
            message: "Please verify your email",
            status: "failure",
          });
        } else {
          // cookie expiration date - 15 days
          const expirationDate = new Date(
            Date.now() + 15 * 24 * 60 * 60 * 1000
          );
          res.cookie("token", user.token, {
            expires: expirationDate,
            httpOnly: true,
            secure: true,
            sameSite: "none",
            domain: "ascentconnect.in",
          });

          const menus = await getMenus(req, res, user);

          response.success(res, 200, {
            message: "User logged in successfully",
            status: "success",
            data: { ...user, menus },
          });
        }
      } else {
        response.error(res, 400, {
          message: "Invalid Email Or Password",
          status: "failure",
        });
      }
    } catch (error) {
      console.log("Error while login ->", error);
      response.error(res, 400);
    }
  }
}

module.exports = new LoginController();
