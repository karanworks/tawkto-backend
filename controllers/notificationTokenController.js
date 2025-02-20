const response = require("../utils/response");
const NotificationTokenService = require("../services/notificationTokenService");

class NotificationTokenController {
  async registerNotificationController(req, res) {
    try {
      const { pushToken, error } =
        await NotificationTokenService.registerNotificationToken(req);
      // const result = await NotificationTokenService.registerNotificationToken(
      //   req
      // );

      if (error) {
        return response.error(res, 200, {
          message: error,
          status: "failure",
        });
      }

      if (pushToken) {
        response.success(res, 200, {
          message: "Expo push token set successfully",
          status: "success",
          data: {
            someData: "Some String",
          },
        });
      }
    } catch (error) {
      console.log("Error while registering notification token ->", error);
      response.error(res, 400);
    }
  }
}

module.exports = new NotificationTokenController();
