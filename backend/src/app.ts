import "dotenv/config";
import cors from "cors";
import express from "express";
import { isHttpError } from "http-errors";

import tagRoutes from "./routes/tagRoutes";
import volunteerRoutes from "./routes/volunteerRoutes";

import type { NextFunction, Request, Response } from "express";

const app = express();

// Provide json body-parser middleware
app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
  }),
);

app.use("/api/volunteer", volunteerRoutes);
app.use("/api/tag", tagRoutes);

app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
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
});

export default app;
