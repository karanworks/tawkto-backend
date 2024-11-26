const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const getLoggedInUser = require("../utils/getLoggedInUser");

class VisitorDetailsService {
  async getVisitorDetails(req) {
    try {
      const { visitorId, workspaceId } = req.params;

      const alreadyExistingVisitor = await prisma.chat.findFirst({
        where: {
          visitorId,
          workspaceId,
        },
      });

      return alreadyExistingVisitor;
    } catch (error) {
      console.log("ERROR ->", error);

      throw new Error("Error while getting visitor details ->", error);
    }
  }
}

module.exports = new VisitorDetailsService();
