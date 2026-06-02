import MessageModel from "../models/messageModel";

async function updateStatus(first: boolean) {
  try {
    if (first) {
      console.info("Message worker started");
    }
    const now = new Date();

    // We cannot send messages ourselves at scheduled time since we only have
    // temporary token. We will trust that the scheduled message will be handled
    // correctly by the service (i.e. Outlook) and simply update status.
    const output = await MessageModel.updateMany(
      {
        status: "pending",
        scheduled: { $lte: now },
      },
      { $set: { status: "sent" } },
    );
    if (output.modifiedCount > 0) {
      console.info(`${output.modifiedCount} messages sent`);
    }
  } catch (err) {
    console.error(`Error running message worker: ${String(err)}`);
  } finally {
    // rerun after 5 minutes
    setTimeout(() => void updateStatus(false), 300000);
  }
}

export function startMessageWorker() {
  void updateStatus(true);
}
