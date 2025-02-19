const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const chatStatus = require("../constants/chatStatus");

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
        orderBy: {
          createdAt: "desc",
        },
      });

      console.log(
        "CHECKING THE CHAT REQUESTS IF THEY ARE SORTED",
        chatRequests
      );

      const filteredRequests = chatRequests
        .map((request) => {
          if (request.status === chatStatus.PENDING) {
            return request;
          } else if (request.status === chatStatus.ACCEPTED) {
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

      throw new Error("Error while getting chat requests ->", error);
    }
  }
  async getChatRequestMessages(req) {
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

      throw new Error("Error while getting chat requests ->", error);
    }
  }
}

module.exports = new ChatRequestsService();
