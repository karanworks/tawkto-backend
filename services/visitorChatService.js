const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const getLoggedInUser = require("../utils/getLoggedInUser");

class VisitorChatService {
  async createVisitorChat(req) {
    try {
      const { message, userId, workspaceId } = req.body;
      const loggedInUser = await getLoggedInUser(req);

      console.log("VISITOR CHAT SERVICE CALLED ");

      const chatExist = await prisma.chat.findFirst({
        where: {
          createdBy: userId,
          workspaceId,
        },
      });

      if (chatExist) {
        await prisma.message.create({
          chatId: chat.id,
          content: message,
          sender: userId,
        });
      } else {
        const chat = await prisma.chat.create({
          data: {
            createdBy: userId,
            workspaceId,
          },
        });

        await prisma.chatAssign.create({
          data: {
            chatId: chat.id,
            userId: userId,
          },
        });

        await prisma.message.create({
          chatId: chat.id,
          content: message,
          sender: userId,
        });
        return chat;
      }
    } catch (error) {
      throw new Error("Error while creating chat ->", error);
    }
  }
  async getVisitorChats(req) {
    try {
      const { userId } = req.params;

      // const workspaces = await prisma.workspace.findFirst({
      //   where: {
      //     createdBy: userId,
      //   },
      // });
      const workspaceMember = await prisma.workspaceMembers.findFirst({
        where: {
          memberId: userId,
        },
      });

      const workspaces = await prisma.workspace.findFirst({
        where: {
          id: workspaceMember.workspaceId,
        },
      });

      return workspaces;
    } catch (error) {
      console.log("ERROR ->", error);

      throw new Error("Error while getting workspaces ->", error);
    }
  }
}

module.exports = new VisitorChatService();
