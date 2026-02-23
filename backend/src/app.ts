import dotenv from "dotenv";
import express from "express";
import { isHttpError } from "http-errors";
import mongoose from "mongoose";

import "./firebase/admin";
import { type AuthRequest, verifyToken } from "./middleware/auth";
import tagRoutes from "./routes/tagRoutes";
import volunteerRoutes from "./routes/volunteerRoutes";

import type { NextFunction, Request, Response } from "express";

const handleError = (error: unknown, req: Request, res: Response, _next: NextFunction) => {
  // 500 is the "internal server error" error code, this will be our fallback
  let statusCode = 500;
  let errorMessage = "An error has occurred.";

  // check is necessary because anything can be thrown, type is not guaranteed
  if (isHttpError(error)) {
    // error.status is unique to the http error class, it allows us to pass status codes with errors
    statusCode = error.status;
    errorMessage = error.message;
  }
  // prefer custom http errors but if they don't exist, fallback to default
  else if (error instanceof Error) {
    errorMessage = error.message;
  }

  res.status(statusCode).json({ error: errorMessage });
};

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

    app.use("/api/volunteer", verifyToken, volunteerRoutes);
    app.use("/api/tag", verifyToken, tagRoutes);

    app.use(handleError);

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
