import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

dotenv.config({ quiet: true });

const app = express();
const PORT = 4000;

async function startServer() {
  const mongoString = process.env.DATABASE_URL;

  if (!mongoString) {
    throw new Error("DATABASE_URL is not defined in .env");
  }

  try {
    // eslint-disable-next-line ts/no-unsafe-call, ts/no-unsafe-member-access
    await mongoose.connect(mongoString);
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
