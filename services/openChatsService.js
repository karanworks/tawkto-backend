const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const getLoggedInUser = require("../utils/getLoggedInUser");

class ChatRequestsService {
  async getOpenChats(req) {
    try {
      const { agentId, workspaceId } = req.params;

      const chatRequests = await prisma.chat.findMany({
        where: {
          ChatAssign: {
            some: {
              userId: agentId,
            },
          },
          workspaceId,
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
  async getOpenChatMessages(req) {
    try {
      const { chatId } = req.params;

      const chatRequest = await prisma.chat.findFirst({
        where: {
          id: chatId,
        },
      });

      console.log("FOUND CHAT ID ->", chatId);

      console.log("FOUND OPEN CHAT ->", chatRequest);

      const messages = await prisma.message.findMany({
        where: {
          chatId: chatRequest.id,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return { ...chatRequest, messages };
    } catch (error) {
      console.log("ERROR ->", error);

      throw new Error("Error while getting open chat ->", error);
    }
  }
}

module.exports = new ChatRequestsService();
