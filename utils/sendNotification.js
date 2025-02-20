const { Expo } = require("expo-server-sdk");

let expo = new Expo();

async function sendNotification(pushTokens, title, body, data = {}) {
  if (!Array.isArray(pushTokens) || pushTokens.length === 0) {
    console.error("Invalid push tokens array");
    return;
  }

  let messages = [];

  for (let pushToken of pushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: pushToken,
      sound: "default",
      title,
      body,
      data,
    });
  }

  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  try {
    for (let chunk of chunks) {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log("Tickets:", ticketChunk);
      tickets.push(...ticketChunk);
    }
  } catch (error) {
    console.error("Error sending notifications:", error);
  }

  // Process receipts
  let receiptIds = tickets
    .filter((ticket) => ticket.status === "ok" && ticket.id)
    .map((ticket) => ticket.id);

  if (receiptIds.length > 0) {
    let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

    for (let chunk of receiptIdChunks) {
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        console.log("Receipts:", receipts);

        for (let receiptId in receipts) {
          let { status, message, details } = receipts[receiptId];
          if (status === "error") {
            console.error(`Error sending notification: ${message}`);
            if (details && details.error) {
              console.error(`Error code: ${details.error}`);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching receipts:", error);
      }
    }
  }
}

module.exports = sendNotification;
