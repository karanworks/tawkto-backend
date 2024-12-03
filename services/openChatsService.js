const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const getLoggedInUser = require("../utils/getLoggedInUser");

class ChatRequestsService {
  async getOpenChats(req) {
    try {
      const { agentId } = req.params;

      const chatRequests = await prisma.chat.findMany({
        where: {
          ChatAssign: {
            some: {
              userId: agentId,
            },
          },
        },
      });

      const chatWithMessages = await Promise.all(
        chatRequests.map(async (chat) => {
          const messages = await prisma.message.findMany({
            where: {
              chatId: chat.id,
            },
            orderBy: {
              createdAt: "asc",
            },
          });

          return { ...chat, messages };
        })
      );

      return chatWithMessages;
    } catch (error) {
      console.log("ERROR ->", error);

      throw new Error("Error while getting open chat ->", error);
    }
  }
}

module.exports = new ChatRequestsService();
