const { PrismaClient } = require("@prisma/client");
// const getLoggedInUser = require("../utils/getLoggedInUser");
const prisma = new PrismaClient();

class LogoutService {
  async logout(req) {
    // const loggedInUser = await getLoggedInUser(req);
    const loggedInUser = req.user;

    if (loggedInUser) {
      const user = await prisma.user.findFirst({
        where: {
          id: loggedInUser.id,
        },
      });

      return user;
    } else {
      return null;
    }
  }
}

module.exports = new LogoutService();
