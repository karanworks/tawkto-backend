const { PrismaClient } = require("@prisma/client");
const { error } = require("../utils/response");
const prisma = new PrismaClient();

class UserService {
  async updateUser(req) {
    try {
      const { name, email } = req.body;
      const { userId } = req.params;

      console.log(
        "GETTING THE USER ID AND USER NAME WHILE UPDATING->",
        userId,
        name,
        email
      );

      const user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          name,
          email,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      if (!user) {
        return { user: null, error: "User not found" };
      }

      return { user, error: null };
    } catch (error) {
      console.log("Error in update user service ->", error);
    }
  }
  async deleteUser(req) {
    try {
      console.log("DELETE USER API CALLED ->", req.params);

      const { userId } = req.params;

      const user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          status: 0,
        },
      });

      if (!user) {
        return { user: null, error: "User not found" };
      }

      return { user, error: null };
    } catch (error) {
      console.log("Error in delete user service ->", error);
    }
  }
}

module.exports = new UserService();
