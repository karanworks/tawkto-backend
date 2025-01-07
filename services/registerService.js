const Token = require("../utils/token");
const sendEmail = require("../utils/sendEmail");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class RegisterService {
  async register(body) {
    try {
      const { name, email, password } = body;

      const alreadyExists = await prisma.user.findFirst({
        where: {
          email,
        },
      });

      if (alreadyExists) {
        return { error: "User already exist with the given email" };
      }

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password,
        },
      });

      const token = Token.generateToken({ id: user.id });

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          verificationToken: token,
        },
      });

      const { password: userPassword, ...userWithoutpassword } = user;
      const CLIENT_URL =
        process.env.NODE_ENV === "production"
          ? process.env.CLIENT_PROD_URL
          : process.env.CLIENT_DEV_URL;

      await sendEmail(
        email,
        "Verification mail from WebWers Team",
        `<span> Click this link to verify your email -> </span> <a href=${CLIENT_URL}/api/verify-email?token=${token} target="_blank">Verify Email</a>`
      );

      return userWithoutpassword;
    } catch (error) {
      console.log("Error inside register service ->", error);
    }
  }
}

module.exports = new RegisterService();
