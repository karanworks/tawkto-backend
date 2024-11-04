const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Token = require("../utils/token");
class LoginService {
  async login(body) {
    const { email, password } = body;

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    const token = Token.generateToken({ id: user.id });

    // update user token
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        token,
      },
    });

    if (user.password === password) {
      const { password: userPassword, ...userWithoutpassword } = user;
      return { ...userWithoutpassword, token };
    } else {
      return null;
    }
  }
}

module.exports = new LoginService();
