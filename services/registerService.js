const Token = require("../utils/token");
const sendEmail = require("../utils/sendEmail");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class RegisterService {
  async register(body) {
    const { name, email, password } = body;

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

    await sendEmail(
      email,
      "Verification mail from tawkto",
      `<span> Click this link to verify your email -> </span> <a href=http://localhost:3010/api/verify-email?token=${token} target="_blank">Verify Email</a>`
    );

    return userWithoutpassword;
  }
}

module.exports = new RegisterService();
