const Token = require("../utils/token");
const sendEmail = require("../utils/sendEmail");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const response = require("../utils/response");
const generateAccessToken = require("../utils/generateAccessToken");
const getMenus = require("../utils/getMenus");

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
        `<span> Click this link to verify your email -> </span> <a href=https://ascent-bpo.com/verify-email/${token} target="_blank">Verify Email</a>`
      );

      return userWithoutpassword;
    } catch (error) {
      console.log("Error inside register service ->", error);
    }
  }
  async verifyEmail(req, res) {
    try {
      const { token } = req.query;

      console.log("EMAIL VERIFICATION TOKEN ->", token);

      if (token) {
        const result = jwt.verify(token, process.env.JWT_SECRET);

        console.log("EMAIL VERIFICATION TOKEN RESULT ->", result);

        if (result.id) {
          const user = await prisma.user.findFirst({
            where: {
              id: result.id,
            },
          });

          const { accessToken } = generateAccessToken(user.id);

          console.log(
            "EMAIL VERIFICATION LOGIN TOKEN AFTER VERIFYING EMAIL ->",
            accessToken
          );

          const userUpdated = await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              isVerified: true,
              verificationToken: null,
            },
          });

          const { password, ...userWithoutPassword } = user;
          const menus = await getMenus(req, res, user);

          return {
            ...userWithoutPassword,
            menus,
            accessToken,
          };
        }
      } else {
        return { error: "Invalid Token" };
      }
    } catch (error) {
      console.log("Error inside register service ->", error);
    }
  }
}

module.exports = new RegisterService();
