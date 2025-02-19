const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const chatStatus = require("../constants/chatStatus");

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
          status: chatStatus.ACCEPTED,
        },
        orderBy: {
          createdAt: "desc",
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

          const visitor = await prisma.visitor.findFirst({
            where: {
              id: chat.visitorId,
            },
          });

          const status = await prisma.visitorStatus.findFirst({
            where: {
              visitorId: visitor.id,
              chatId: chat.id,
              workspaceId: chat.workspaceId,
            },
          });

          return {
            ...chat,
            messages,
            visitor,
            status: { visitor, status: status.status },
          };
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

      const visitor = await prisma.visitor.findFirst({
        where: {
          id: chatRequest.visitorId,
        },
      });

      const status = await prisma.visitorStatus.findFirst({
        where: {
          visitorId: visitor.id,
          chatId,
          workspaceId: chatRequest.workspaceId,
        },
      });

      const messages = await prisma.message.findMany({
        where: {
          chatId: chatRequest.id,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return {
        ...chatRequest,
        messages,
        visitor,
        status: { visitor, status: status.status },
      };
    } catch (error) {
      console.log("ERROR ->", error);

      throw new Error("Error while getting open chat ->", error);
    }
  }
}

module.exports = new ChatRequestsService();
