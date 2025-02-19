const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class NotificationTokenService {
  async registerNotificationToken(req) {
    try {
      const { userId } = req.params;
      const { expoPushToken } = req.body;

      const existingToken = await prisma.notificationToken.findFirst({
        where: {
          userId,
        },
      });

      if (existingToken) {
        await prisma.notificationToken.update({
          where: {
            id: existingToken.id,
          },
          data: {
            expoPushToken,
          },
        });

        return { pushToken };
      } else {
        const pushToken = await prisma.notificationToken.create({
          data: {
            userId,
            expoPushToken,
          },
        });
        return { pushToken };
      }
    } catch (error) {
      console.log("Error in login service ->", error);
    }
  }
}

module.exports = new NotificationTokenService();
