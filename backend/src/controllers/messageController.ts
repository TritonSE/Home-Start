import { validationResult } from "express-validator";
import createError from "http-errors";

import MessageModel from "../models/messageModel";
import validationErrorParser from "../util/validationErrorParser";

import type { NextFunction, Request, RequestHandler, Response } from "express";

const FIRST_NAME_TOKEN = "{{First Name}}";

type Recipient = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  tags: string[];
};

type SendEmailBody = {
  graphToken: string;
  recipients: Recipient[];
  subject: string;
  message: string;
};

type MessageCreationBody = {
  recipients: string[];
  type: "text" | "email";
  subject?: string | null;
  body: string;
  status?: "sent" | "pending";
};

type GetMessagesQuery = {
  page?: string;
  limit?: string;
  type?: "text" | "email";
  status?: "sent" | "pending";
  recipient?: string;
};

type GraphErrorResponse = {
  error?: { message?: string };
};

export const sendEmails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { graphToken, recipients, subject, message } = req.body as SendEmailBody;

    if (
      !graphToken ||
      !Array.isArray(recipients) ||
      recipients.length === 0 ||
      !subject ||
      !message
    ) {
      res.status(400).json({ error: "graphToken, recipients, subject, and message are required" });
      return;
    }

    const results = await Promise.allSettled(
      recipients.map(async (recipient) => {
        const personalizedBody = message.replaceAll(FIRST_NAME_TOKEN, recipient.firstName);

        const graphRes = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${graphToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: {
              subject,
              body: {
                contentType: "Text",
                content: personalizedBody,
              },
              toRecipients: [
                {
                  emailAddress: {
                    address: recipient.email,
                    name: `${recipient.firstName} ${recipient.lastName}`,
                  },
                },
              ],
            },
            saveToSentItems: true,
          }),
        });

        if (!graphRes.ok) {
          const errBody = (await graphRes.json()) as GraphErrorResponse;
          throw new Error(errBody?.error?.message ?? `Failed to send email to ${recipient.email}`);
        }
      }),
    );

    const failures = results
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r) => (r.reason instanceof Error ? r.reason.message : "Unknown error"));

    if (failures.length > 0) {
      res.status(207).json({
        sent: recipients.length - failures.length,
        failed: failures.length,
        errors: failures,
      });
      return;
    }

    res.status(200).json({ sent: recipients.length });
  } catch (error) {
    next(error);
  }
};

const defaultPopulateConfig = [
  { path: "recipients", select: "firstName lastName email phoneNumber" },
];

export const getMessages: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const { page = "1", limit = "20", type, status, recipient } = req.query as GetMessagesQuery;

  try {
    validationErrorParser(errors);

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const filter: {
      type?: "text" | "email";
      status?: "sent" | "pending";
      recipients?: string;
    } = {};

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (recipient) filter.recipients = recipient;

    const [messages, total] = await Promise.all([
      MessageModel.find(filter)
        .populate(defaultPopulateConfig)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNumber),
      MessageModel.countDocuments(filter),
    ]);

    res.status(200).json({
      messages,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    });
  } catch (err) {
    next(err);
  }
};

export const getMessage: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const messageId = req.params.id;

  try {
    validationErrorParser(errors);

    const message = await MessageModel.findById(messageId).populate(defaultPopulateConfig);

    if (!message) {
      throw createError(404, "Could not find message");
    }

    res.status(200).json(message);
  } catch (err) {
    next(err);
  }
};

export const createMessage: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const {
    recipients,
    type,
    subject = null,
    body,
    status = "sent",
  } = req.body as MessageCreationBody;

  try {
    validationErrorParser(errors);

    if (type === "email" && !subject) {
      throw createError(400, "Email message requires subject");
    }

    const newMessage = await MessageModel.create({
      recipients,
      type,
      subject: type === "text" ? null : subject,
      body,
      status,
    });

    res.status(201).json(newMessage);
  } catch (err) {
    next(err);
  }
};
