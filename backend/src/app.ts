import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

import "./firebase/admin";
import { type AuthRequest, verifyToken } from "./middleware/auth";

dotenv.config({ quiet: true });

const app = express();
const PORT = 4000;

// Middleware
app.use(express.json());

async function startServer() {
  const mongoString = process.env.DATABASE_URL;

  if (!mongoString) {
    throw new Error("DATABASE_URL is not defined in .env");
  }

  try {
    await mongoose.connect(mongoString);
    console.info("Database Connected");

    // Example routes
    app.get("/api/public", (req, res) => {
      res.json({ message: "This is a public endpoint" });
    });

    // Protected route - requires authentication
    app.get("/api/protected", verifyToken, (req, res) => {
      const authReq = req as AuthRequest;
      res.json({ message: "You are authenticated!", user: authReq.user });
    });

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
