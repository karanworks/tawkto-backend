const response = require("../utils/response");
const RegisterService = require("../services/registerService");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Token = require("../utils/token");
const getMenus = require("../utils/getMenus");

class RegisterController {
  async register(req, res) {
    try {
      const result = await RegisterService.register(req.body);

      if (result?.error) {
        return response.error(res, 200, {
          message: result.error,
          status: "failure",
        });
      }

      if (result) {
        return response.success(res, 201, {
          message: "User registered successfully, Please verify your email",
          status: "success",
        });
      } else {
        return response.error(res, 400, {
          message: "There was some error while registering the user",
          status: "failure",
        });
      }
    } catch (error) {
      console.log("Error while registering ->", error);
      response.error(res, 500);
    }
  }

  async verifyEmail(req, res) {
    try {
      const { token } = req.query;

      if (token) {
        const user = await prisma.user.findFirst({
          where: {
            verificationToken: token,
          },
        });

        if (user) {
          const generatedToken = Token.generateToken({ id: user.id });
          const userUpdated = await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              isVerified: true,
              verificationToken: null,
              token: generatedToken,
            },
          });
          const expirationDate = new Date(
            Date.now() + 15 * 24 * 60 * 60 * 1000
          );

          res.cookie("token", generatedToken, {
            expires: expirationDate,
            httpOnly: true,
            secure: true,
            sameSite: true,
            domain: "ascent-bpo.com",
          });

          const { password, ...userWithoutPassword } = user;
          const menus = await getMenus(req, res, user);

          response.success(res, 200, {
            message: "User logged in successfully",
            status: "success",
            data: { ...userWithoutPassword, menus },
          });

          // cookie expiration date - 15 days

          // res.redirect("/connect-website");
          // console.log("/////////////////VERFIYING EMAIL/////////////////////");

          // res.json({
          //   message: "Data fetched successfully ->",
          //   data: { name: "Karan", age: "26" },
          // });

          // res.send("<h3>Email verified successfully! Now you can login</h3>");
          // res.redirect("https://ascent-bpo.com/login");
        } else {
          response.error(res, 200, {
            message: "Email already verified",
            status: "failure",
          });
          // res.send("<h3>Your email has already been verified!</h3>");
        }
      }
    } catch (error) {
      console.log("Error while verifying email ->", error);
      response.error(res, 500);
    }
  }
}

module.exports = new RegisterController();
