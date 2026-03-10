import { validationResult } from "express-validator";

import ChatLogModel from "../models/chatLogModel";
import volunteerModel from "../models/volunteerModel";
import { createVolunteerConversationTwilio } from "../services/twilioService";
import validationErrorParser from "../util/validationErrorParser";

import type { RequestHandler } from "express";

type VolunteerChatInfo = {
  volunteerId: string;
  conversationName: string;
  initialMessage: string;
};

export const createVolunteerConversation: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const { volunteerId, conversationName, initialMessage } = req.body as VolunteerChatInfo;

  try {
    validationErrorParser(errors);

    const volunteerPhoneNumber = await volunteerModel.findById(volunteerId).select("phoneNumber");
    if (!volunteerPhoneNumber) {
      return res.status(404).json({ error: "Could not find volunteer's phone number" });
    }

    const conversationSID = await createVolunteerConversationTwilio(
      [volunteerPhoneNumber.phoneNumber],
      initialMessage,
      conversationName,
    );

    if (!conversationSID) {
      return res.status(500).json({ error: "Failed to create conversation with volunteer" });
    }

    res.status(201).json({ conversationSID });

    const chatLog = await ChatLogModel.create({
      volunteerIds: [volunteerId],
      conversationName,
      conversationSID,
    });

    if (!chatLog) {
      console.error("Failed to create chat log for conversation:", conversationSID);
    }
  } catch (err) {
    next(err);
  }
};

type ManyVolunteerChatInfo = {
  volunteerIds: string[];
  // Should be replaced with text format refrence in the near future
  conversationName: string;
  initialMessage: string;
};

export const createManyVolunteerConversations: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const { volunteerIds, conversationName, initialMessage } = req.body as ManyVolunteerChatInfo;

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: validationErrorParser(errors) });
  }

  try {
    const conversationSIDs = await Promise.all(
      volunteerIds.map(async (volunteerId) => {
        const volunteerPhoneNumber = await volunteerModel
          .findById(volunteerId)
          .select("phoneNumber");
        if (!volunteerPhoneNumber) {
          throw new Error(`Could not find volunteer's phone number for ID: ${volunteerId}`);
        }

        const conversationSID = await createVolunteerConversationTwilio(
          [volunteerPhoneNumber.phoneNumber],
          initialMessage,
          conversationName,
        );

        if (!conversationSID) {
          throw new Error(`Failed to create conversation with volunteer: ${volunteerId}`);
        }

        return conversationSID;
      }),
    );

    res.status(201).json({ conversationSIDs });
  } catch (err) {
    next(err);
  }
};

export const getChatsByVolunteerId: RequestHandler = async (req, res, next) => {
  const volunteerId = req.params.volunteerId;

  try {
    const chatLogs = await ChatLogModel.find({ volunteerIds: volunteerId });
    res.status(200).json(chatLogs);
  } catch (err) {
    next(err);
  }
};

export const getChatsByConversationSID: RequestHandler = async (req, res, next) => {
  const conversationSID = req.params.conversationSID;

  try {
    const chatLogs = await ChatLogModel.find({ conversationSID });
    res.status(200).json(chatLogs);
  } catch (err) {
    next(err);
  }
};

export const getAllChats: RequestHandler = async (req, res, next) => {
  try {
    const chatLogs = await ChatLogModel.find();
    res.status(200).json(chatLogs);
  } catch (err) {
    next(err);
  }
};

export const deleteChatLogByConversationSID: RequestHandler = async (req, res, next) => {
  const conversationSID = req.params.conversationSID;

  try {
    const result = await ChatLogModel.deleteOne({ conversationSID });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ error: "Could not find chat log with the provided conversation SID" });
    }

    res.status(200).json({ message: "Chat log deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const deleteChatsByVolunteerId: RequestHandler = async (req, res, next) => {
  const volunteerId = req.params.volunteerId;

  try {
    const result = await ChatLogModel.deleteMany({ volunteerIds: volunteerId });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ error: "Could not find chat logs for the provided volunteer ID" });
    }

    res.status(200).json({ message: "Chat logs deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const deleteAllChats: RequestHandler = async (req, res, next) => {
  try {
    await ChatLogModel.deleteMany({});
    res.status(200).json({ message: "All chat logs deleted successfully" });
  } catch (err) {
    next(err);
  }
};
