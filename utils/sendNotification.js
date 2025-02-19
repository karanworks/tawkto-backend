import { Expo } from "expo-server-sdk";

// Create a new Expo SDK client
let expo = new Expo();

export function sendNotification(pushToken) {
  // Check if the push token is valid
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
  } else {
    // Construct a message
    let message = {
      to: pushToken,
      sound: "default",
      title: "Backend Notification",
      body: "This is a test notification",
      data: { withSome: "data" },
    };

    // Send the notification
    (async () => {
      try {
        let response = await expo.sendPushNotificationsAsync([message]);
        console.log(response); // This will contain the ticket ID
      } catch (error) {
        console.error(error);
      }
    })();
  }
}
