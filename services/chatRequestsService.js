const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const getLoggedInUser = require("../utils/getLoggedInUser");

class ChatRequestsService {
  async createChatRequest(req) {
    try {
      // const { message, userId, workspaceId } = req.body;
      // const loggedInUser = await getLoggedInUser(req);
      // console.log("VISITOR CHAT SERVICE CALLED ");
      // const chatExist = await prisma.chat.findFirst({
      //   where: {
      //     createdBy: userId,
      //     workspaceId,
      //   },
      // });
      // if (chatExist) {
      //   await prisma.message.create({
      //     chatId: chat.id,
      //     content: message,
      //     sender: userId,
      //   });
      // } else {
      //   const chat = await prisma.chat.create({
      //     data: {
      //       createdBy: userId,
      //       workspaceId,
      //     },
      //   });
      //   await prisma.chatAssign.create({
      //     data: {
      //       chatId: chat.id,
      //       userId: userId,
      //     },
      //   });
      //   await prisma.message.create({
      //     chatId: chat.id,
      //     content: message,
      //     sender: userId,
      //   });
      //   return chat;
      // }
    } catch (error) {
      throw new Error("Error while creating chat request ->", error);
    }
  }
  async getChatRequests(req) {
    try {
      const { agentId } = req.params;

      const chatRequests = await prisma.chat.findMany({
        where: {
          ChatAssign: {
            none: {
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

      throw new Error("Error while getting chat requests ->", error);
    }
  }
}

module.exports = new ChatRequestsService();
