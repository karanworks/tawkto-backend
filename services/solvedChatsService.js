const { PrismaClient } = require("@prisma/client");
const chatStatus = require("../constants/chatStatus");
const prisma = new PrismaClient();

class SolvedChatService {
  async updateSolvedChat(req) {
    try {
      const { chatId } = req.params;
      const { status } = req.body;

      const solvedChat = await prisma.chat.findFirst({
        where: {
          id: chatId,
        },
      });

      if (solvedChat) {
        await prisma.chat.update({
          where: {
            id: solvedChat.id,
          },
          data: {
            status: status,
          },
        });
        return solvedChat;
      } else {
        return null;
      }
    } catch (error) {
      console.log("ERROR WHILE CREATING UPDATED CHAT ->", error);

      throw new Error("Error while creating chat chat ->", error);
    }
  }
  async getSolvedChats(req) {
    try {
      const { agentId, workspaceId } = req.params;

      console.log(
        "SOLVED CHAT API CALLED TO GET CHATS =>",
        agentId,
        workspaceId
      );

      const solvedChats = await prisma.chat.findMany({
        where: {
          ChatAssign: {
            some: {
              userId: agentId,
            },
          },
          workspaceId,
          status: chatStatus.SOLVED,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const solvedChatsWithMessages = await Promise.all(
        solvedChats.map(async (chat) => {
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

      return solvedChatsWithMessages;
    } catch (error) {
      console.log("ERROR ->", error);

      throw new Error("Error while getting open chat ->", error);
    }
  }
  async getSolvedChatMessages(req) {
    try {
      const { chatId } = req.params;

      const solvedChat = await prisma.chat.findFirst({
        where: {
          id: chatId,
        },
      });

      const visitor = await prisma.visitor.findFirst({
        where: {
          id: solvedChat.visitorId,
        },
      });

      const status = await prisma.visitorStatus.findFirst({
        where: {
          visitorId: visitor.id,
          chatId,
          workspaceId: solvedChat.workspaceId,
        },
      });

      const messages = await prisma.message.findMany({
        where: {
          chatId: solvedChat.id,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return {
        ...solvedChat,
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

module.exports = new SolvedChatService();
