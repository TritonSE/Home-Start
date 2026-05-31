import { randomUUID } from "crypto";
import createError from "http-errors";

const FIRST_NAME_TOKEN = "{{First Name}}";

import TextJobModel from "../models/textJobModel";

import type { NextFunction, Request, RequestHandler, Response } from "express";

type Recipient = {
  firstName: string;
  phoneNumber: string;
};

type CreateTextJobBody = {
  message: string;
  recipients: Recipient[];
};

export const createTextJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, recipients } = req.body as CreateTextJobBody;

    if (!message || !Array.isArray(recipients) || recipients.length === 0) {
      res.status(400).json({ error: "message and recipients are required" });
      return;
    }

    const jobId = randomUUID();
    await TextJobModel.create({ jobId, message, recipients });

    res.status(201).json({ jobId });
  } catch (error) {
    next(error);
  }
};

export const getTextJob: RequestHandler = async (req, res, next) => {
  try {
    const job = await TextJobModel.findOne({ jobId: req.params.id });

    if (!job) {
      throw createError(404, "Job not found or expired");
    }

    res.status(200).json({
      messages: job.recipients.map((r) => ({
        to: r.phoneNumber,
        body: job.message.replaceAll(FIRST_NAME_TOKEN, r.firstName),
      })),
    });
  } catch (error) {
    next(error);
  }
};
