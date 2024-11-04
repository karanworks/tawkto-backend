const { PrismaClient } = require("@prisma/client");
const getLoggedInUser = require("../utils/getLoggedInUser");
const prisma = new PrismaClient();

class LogoutService {
  async logout(req) {
    const loggedInUser = await getLoggedInUser(req);

    if (loggedInUser) {
      const user = await prisma.user.findFirst({
        where: {
          id: loggedInUser.id,
        },
      });

      // set the token to null after logging out
      const removedToken = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          token: null,
        },
      });

      console.log("REMOVED TOKEN ->", removedToken);

      return user;
    } else {
      return null;
    }
  }
}

module.exports = new LogoutService();
