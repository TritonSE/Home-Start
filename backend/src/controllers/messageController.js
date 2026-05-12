"use strict";
const __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessage = exports.getMessage = exports.getMessages = exports.sendEmails = void 0;
const express_validator_1 = require("express-validator");
const http_errors_1 = __importDefault(require("http-errors"));
const messageModel_1 = __importDefault(require("../models/messageModel"));
const validationErrorParser_1 = __importDefault(require("../util/validationErrorParser"));
const FIRST_NAME_TOKEN = "{{First Name}}";
const sendEmails = async (req, res, next) => {
  try {
    const { graphToken, recipients, subject, message } = req.body;
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
          const errBody = await graphRes.json();
          throw new Error(errBody?.error?.message ?? `Failed to send email to ${recipient.email}`);
        }
      }),
    );
    const failures = results
      .filter((r) => r.status === "rejected")
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
exports.sendEmails = sendEmails;
const defaultPopulateConfig = [{ path: "recipients", select: "firstName lastName" }];
const getMessages = async (req, res, next) => {
  const errors = (0, express_validator_1.validationResult)(req);
  const { page = "1", limit = "20", type, status, recipient } = req.query;
  try {
    (0, validationErrorParser_1.default)(errors);
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (recipient) filter.recipients = recipient;
    const [messages, total] = await Promise.all([
      messageModel_1.default
        .find(filter)
        .populate(defaultPopulateConfig)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNumber),
      messageModel_1.default.countDocuments(filter),
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
exports.getMessages = getMessages;
const getMessage = async (req, res, next) => {
  const errors = (0, express_validator_1.validationResult)(req);
  const messageId = req.params.id;
  try {
    (0, validationErrorParser_1.default)(errors);
    const message = await messageModel_1.default
      .findById(messageId)
      .populate(defaultPopulateConfig);
    if (!message) {
      throw (0, http_errors_1.default)(404, "Could not find message");
    }
    res.status(200).json(message);
  } catch (err) {
    next(err);
  }
};
exports.getMessage = getMessage;
const createMessage = async (req, res, next) => {
  const errors = (0, express_validator_1.validationResult)(req);
  const { recipients, type, subject = null, body, status = "sent" } = req.body;
  try {
    (0, validationErrorParser_1.default)(errors);
    if (type === "email" && !subject) {
      throw (0, http_errors_1.default)(400, "Email message requires subject");
    }
    const newMessage = await messageModel_1.default.create({
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
exports.createMessage = createMessage;
