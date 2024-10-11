const response = require("../utils/response");
const RegisterService = require("../services/registerService");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class RegisterController {
  async register(req, res) {
    try {
      const user = RegisterService.register(req.body);

      if (user) {
        response.success(res, 201, {
          message: "User registered successfully, Please verify your email",
          status: "success",
        });
      } else {
        response.error(res, 400, {
          message: "There was some error while registering the user",
          status: "failure",
        });
      }
    } catch (error) {
      console.log("Error while registering ->", error);
      response.error(res, 400);
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
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              isVerified: true,
              verificationToken: null,
            },
          });

          res.send("<h3>Email verified successfully!</h3>");
        }
      }
    } catch (error) {
      console.log("Error while verifying email ->", error);
      response.error(res, 400);
    }
  }
}

module.exports = new RegisterController();
