const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

async function getLoggedInUser(req) {
  try {
    const authorizationToken = req.headers?.authorization; // Bearer <token>
    const authorizationTokenCookie = req.cookies?.token;

    const rawToken = authorizationToken || authorizationTokenCookie;

    if (!rawToken) {
      console.warn("No token provided.");
      return null;
    }

    const tokenParts = rawToken.split(" ");
    const token = tokenParts.length > 1 ? tokenParts[1] : rawToken;

    if (!token) {
      console.warn("Invalid token format.");
      return null;
    }

    const result = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const loggedInUser = await prisma.user.findFirst({
      where: {
        id: result.userId,
      },
    });

    if (!loggedInUser) {
      console.warn("User not found for the provided token.");
    }

    return loggedInUser;
  } catch (error) {
    console.error("Error retrieving logged-in user:", error.message);
    return null;
  }
}

module.exports = getLoggedInUser;
