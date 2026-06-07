import { Semaphore } from "async-mutex";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

import MessageModel from "../models/messageModel";
import validationErrorParser from "../util/validationErrorParser";

import type { NextFunction, Request, RequestHandler, Response } from "express";

const FIRST_NAME_TOKEN = "{{First Name}}";
const GRAPH_BATCH_LIMIT = 20;

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
  sendDate?: string;
};

type GraphRecipient = {
  emailAddress: {
    address: string;
    name: string;
  };
};

type GraphEmailMessage = {
  subject: string;
  body: {
    contentType: string;
    content: string;
  };
  toRecipients: GraphRecipient[];
  singleValueExtendedProperties?: Record<string, string>[];
  categories?: string[];
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

// Graph has 4 concurrent request limit. Set to 3 to
// avoid being too aggressiving and maxing out
const graphReqSemaphore = new Semaphore(3);

const createSendMailBody = (
  recipient: Recipient,
  subject: string,
  message: string,
  sendDate?: string,
) => {
  const personalizedBody = message.replaceAll(FIRST_NAME_TOKEN, recipient.firstName);

  const messageBody: GraphEmailMessage = {
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
  };

  const reqBody = {
    message: messageBody,
    saveToSentItems: true,
  };

  if (sendDate) {
    if (!reqBody.message.singleValueExtendedProperties) {
      reqBody.message.singleValueExtendedProperties = [];
    }
    reqBody.message.singleValueExtendedProperties.push({
      id: "SystemTime 0x3FEF",
      value: sendDate,
    });
  }
  return reqBody;
};

const batchList = <T>(list: Array<T>, batchSize: number = 20): Array<Array<T>> => {
  const batches = [];
  for (let i = 0; i < list.length; i += batchSize) {
    batches.push(list.slice(i, i + batchSize));
  }
  return batches;
};

const sendBatchEmails = async (
  graphToken: string,
  recipients: Recipient[],
  subject: string,
  message: string,
  sendDate: string | undefined,
): Promise<{ results: PromiseSettledResult<void>[]; failures: string[] }> => {
  const requests = recipients.map((recipient, i) => ({
    id: i,
    method: "POST",
    url: "/me/sendMail",
    body: createSendMailBody(recipient, subject, message, sendDate),
    headers: {
      Authorization: `Bearer ${graphToken}`,
      "Content-Type": "application/json",
    },
  }));

  const batches = batchList(requests, GRAPH_BATCH_LIMIT);

  const failures: string[] = [];

  const results = await Promise.allSettled(
    batches.map(async (batch) => {
      await graphReqSemaphore.runExclusive(async () => {
        const graphRes = await fetch("https://graph.microsoft.com/v1.0/$batch", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${graphToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requests: batch,
          }),
        });

        const data = (await graphRes.json()) as {
          responses: { id: string; status: number; body: GraphErrorResponse }[];
        };
        const failed = data.responses
          .filter(
            (response) => response.status >= 400 && response.body.error?.message !== undefined,
          )
          .map(
            (response) =>
              `Failed to send email to ${batch[Number(response.id)].body.message.toRecipients[0].emailAddress.address}: ${response.body.error?.message}`,
          );
        failures.push(...failed);

        await new Promise((resolve) => {
          setTimeout(resolve, 1000);
        });
      });
    }),
  );
  return { results, failures };
};

export const sendEmails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { graphToken, recipients, subject, message, sendDate } = req.body as SendEmailBody;

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

    const date = sendDate ? new Date(sendDate) : undefined;
    if (date && Number.isNaN(date.getTime())) {
      res.status(400).json({ error: "sendDate must be a proper date" });
      return;
    }

    const { results, failures } = await sendBatchEmails(
      graphToken,
      recipients,
      subject,
      message,
      sendDate,
    );

    const failedPromises = results
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r) => (r.reason instanceof Error ? r.reason.message : "Unknown error"));

    failures.push(...failedPromises);

    if (failures.length > 0) {
      res.status(207).json({
        sent: recipients.length - failures.length,
        failed: failures.length,
        errors: failures,
      });
      return;
    }

    const newMessage = await MessageModel.create({
      recipients: recipients.map((recipient) => recipient._id),
      type: "email",
      subject,
      body: message,
      status: "sent",
    });

    res.status(200).json({
      sent: recipients.length,
      message: newMessage,
    });
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
      throw createHttpError(404, "Could not find message");
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
      throw createHttpError(400, "Email message requires subject");
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
