const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class TourService {
  async updateTourStatus(req) {
    try {
      const loggedInUser = req.user;

      if (loggedInUser) {
        const updatedTourStatus = await prisma.user.update({
          where: {
            id: loggedInUser?.id,
          },
          data: {
            isTourCompleted: true,
          },
        });

        if (updatedTourStatus) {
          return true;
        } else {
          console.log("ELSE CONDITION WAS TRIGGERED ");

          return false;
        }
      } else {
        console.log("LOGGED IN USER ELSE CONDITION WAS TRIGGERED");

        return false;
      }
    } catch (error) {
      console.log("Error while updating tour status ->", error);

      throw new Error("Error while updating tour status ->", error);
    }
  }
}

module.exports = new TourService();
