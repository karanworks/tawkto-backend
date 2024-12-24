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
      const { agentId, workspaceId } = req.params;

      console.log("AGENT ID ->", agentId);
      console.log("WORKSPACE ID ->", workspaceId);

      // fetching user to check his role
      const user = await prisma.user.findFirst({
        where: {
          id: agentId,
        },
      });

      const chatRequests = await prisma.chat.findMany({
        where: {
          ChatAssign: {
            none: {
              userId: agentId,
            },
          },
          workspaceId,
        },
      });

      const filteredRequests = chatRequests
        .map((request) => {
          if (request.accepted === false) {
            return request;
          } else if (request.accepted === true) {
            if (user.roleId === 1) {
              return request;
            } else {
              return null;
            }
          }
        })
        .filter(Boolean);

      const chatWithMessages = await Promise.all(
        filteredRequests.map(async (chat) => {
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
  async getChatRequestMessages(req) {
    try {
      const { chatId } = req.params;
      console.log("CHAT REQUEST ->", chatId);

      const chatRequest = await prisma.chat.findFirst({
        where: {
          id: chatId,
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

      return { ...chatRequest, messages };
    } catch (error) {
      console.log("ERROR ->", error);

      throw new Error("Error while getting chat requests ->", error);
    }
  }
}

module.exports = new ChatRequestsService();
