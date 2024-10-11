const response = require("../utils/response");
const loginService = require("../services/loginService");
const Token = require("../utils/token");

class LoginController {
  async login(req, res) {
    try {
      const user = await loginService.login(req.body);

      if (user) {
        if (!user.isVerified) {
          response.error(res, 400, {
            message: "Please verify your email",
            status: "success",
          });
        } else {
          const token = Token.generateToken({ id: user.id });

          // cookie expiration date - 15 days
          const expirationDate = new Date(
            Date.now() + 15 * 24 * 60 * 60 * 1000
          );
          res.cookie("token", token, {
            expires: expirationDate,
            httpOnly: true,
            sameSite: "None",
          });

          response.success(res, 200, {
            message: "User logged in successfully",
            status: "success",
            data: user,
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
