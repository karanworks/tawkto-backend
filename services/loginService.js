const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class LoginService {
  async login(body) {
    const { email, password } = body;

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (user.password === password) {
      const { password: userPassword, ...userWithoutpassword } = user;
      return userWithoutpassword;
    } else {
      return null;
    }
  }
}

module.exports = new LoginService();
