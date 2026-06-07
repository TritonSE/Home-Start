/**
 * Initializes mongoose and express.
 */

import "module-alias/register";
import mongoose from "mongoose";

import app from "./app";
import { database_url, port } from "./config";
import { startMessageWorker } from "./workers/messageWorker";

async function dropLegacyVolunteerAssignmentIndex() {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection is not initialized");
    }

    await db.collection("volunteerassignments").dropIndex("volunteerId_1_assignmentTagId_1");
    console.info("Dropped legacy volunteer assignment uniqueness index");
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!message.includes("index not found")) {
      throw error;
    }
  }
}

async function startServer() {
  try {
    await mongoose.connect(database_url);
    console.info("Database Connected");

    await dropLegacyVolunteerAssignmentIndex();

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
