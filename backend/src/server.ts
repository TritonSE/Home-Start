/**
 * Initializes mongoose and express.
 */

import "dotenv/config";
import "module-alias/register";
import mongoose from "mongoose";

import app from "./app";
import env from "./util/validateEnv";

async function startServer() {
  const PORT = env.PORT || 4000;
  const DATABASE_URL = env.DATABASE_URL;

  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in .env");
  }

  try {
    await mongoose.connect(DATABASE_URL);
    console.info("Database Connected");

    app.listen(PORT, () => {
      console.info(`Listening on port ${PORT}`);
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
