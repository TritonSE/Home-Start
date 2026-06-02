/**
 * Initializes mongoose and express.
 */

import "module-alias/register";
import mongoose from "mongoose";

import app from "./app";
import { database_url, port } from "./config";
import { startMessageWorker } from "./workers/messageWorker";

async function startServer() {
  try {
    await mongoose.connect(database_url);
    console.info("Database Connected");

    startMessageWorker();

    app.listen(port, () => {
      console.info(`Listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer().catch((err) => {
  console.error("Unhandled startup error:", err);
  process.exit(1);
});
