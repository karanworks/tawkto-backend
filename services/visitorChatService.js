const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class VisitorChatService {
  async getVisitorChats(req) {
    try {
      const { visitorId } = req.params;

      const chat = await prisma.chat.findFirst({
        where: {
          visitorId,
        },
      });

      let messages;
      if (chat) {
        messages = await prisma.message.findMany({
          where: {
            chatId: chat?.id,
          },
          orderBy: {
            createdAt: "asc",
          },
        });

        return { ...chat, messages };
      } else {
        return null;
      }
    } catch (error) {
      console.log("ERROR ->", error);

      throw new Error("Error while getting workspaces ->", error);
    }
  }
}

module.exports = new VisitorChatService();
