import { validationResult } from "express-validator";
import createError from "http-errors";

import MessageModel from "../models/messageModel";
import validationErrorParser from "../util/validationErrorParser";

import type { RequestHandler } from "express";

const defaultPopulateConfig = [{ path: "recipients" }];

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
