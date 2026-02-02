import "dotenv/config";
import cors from "cors";
import express from "express";
import { isHttpError } from "http-errors";

import "./firebase/admin";
import { type AuthRequest, verifyToken } from "./middleware/auth";
import volunteerRoutes from "./routes/volunteerRoutes";

import type { NextFunction, Request, Response } from "express";

const app = express();
dotenv.config({ quiet: true });

// Middleware
app.use(express.json());

async function startServer() {
  const mongoString = process.env.DATABASE_URL;

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
  }),
);

app.use("/api/volunteer", volunteerRoutes);

app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
  // 500 is the "internal server error" error code, this will be our fallback
  let statusCode = 500;
  let errorMessage = "An error has occurred.";

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
});

export default app;
