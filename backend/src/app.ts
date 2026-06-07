import cors from "cors";
import express from "express";
import { isHttpError } from "http-errors";

import "./firebase/admin";
import { frontend_origin } from "./config";
import { verifyToken } from "./middleware/auth";
import messageRoutes from "./routes/messageRoutes";
import tagRoutes from "./routes/tagRoutes";
import templateRoutes from "./routes/templateRoutes";
import textJobRoutes from "./routes/textJobRoutes";
import volunteerAssignmentRoutes from "./routes/volunteerAssignmentRoutes";
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

const app = express();

// CSV imports can send large volunteer batches with assignment/tag metadata.
app.use(express.json({ limit: "5mb" }));

app.use(
  cors({
    origin: frontend_origin,
  }),
);

app.use(verifyToken);

app.use("/api/volunteer", volunteerRoutes);
app.use("/api/volunteerAssignment", volunteerAssignmentRoutes);
app.use("/api/tag", tagRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/template", templateRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/text-jobs", textJobRoutes);

app.use(handleError);

export default app;
