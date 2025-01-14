const response = require("../utils/response");
const RegisterService = require("../services/registerService");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

        console.log("CHECK USER ->", user);

        if (user) {
          const userUpdated = await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              isVerified: true,
              verificationToken: null,
            },
          });

          console.log("VERIFY EMAIL WORKING ->", userUpdated);

          res.redirect("/login");

          // res.send("<h3>Email verified successfully! Now you can login</h3>");
          // res.redirect("https://ascent-bpo.com/login");
        }
      }
    } catch (error) {
      console.log("Error while verifying email ->", error);
      response.error(res, 500);
    }
  }
}

module.exports = new RegisterController();
