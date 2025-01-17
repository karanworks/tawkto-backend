const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const getLoggedInUser = require("../utils/getLoggedInUser");

class TourService {
  async updateTourStatus(req) {
    try {
      const loggedInUser = await getLoggedInUser(req);

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
          console.log(
            "RETURN TRUE CONDITION WAS TRIGGERED ->",
            updatedTourStatus
          );

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
