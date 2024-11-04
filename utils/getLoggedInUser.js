const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getLoggedInUser(req) {
  const token = req?.cookies.token;

  if (token) {
    const loggedInUser = await prisma.user.findFirst({
      where: {
        token: token,
      },
    });
    return loggedInUser;
  } else {
    return null;
  }
}

module.exports = getLoggedInUser;
