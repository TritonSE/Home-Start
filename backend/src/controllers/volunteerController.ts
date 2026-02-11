import { PassThrough } from "node:stream";

import csvParser from "csv-parser";
import { validationResult } from "express-validator";
import createError from "http-errors";

import VolunteerModel from "../models/volunteerModel";
import validationErrorParser from "../util/validationErrorParser";

import type { RequestHandler } from "express";
import type { MongoBulkWriteError, WriteError } from "mongodb";
import type { Buffer } from "node:buffer";

// eslint-disable-next-line regexp/no-super-linear-backtracking
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_NUMBER_REGEX = /^\(?\d{3}\)?[-\s.]?\d{3}[-\s.]?\d{4}$/;

export const getVolunteer: RequestHandler = async (req, res, next) => {
  const volunteerId = req.params.id;

  try {
    const volunteer = await VolunteerModel.findById(volunteerId);

    if (!volunteer) {
      return res.status(404).json({ error: "Could not find volunteer" });
    }

    res.status(200).json(volunteer);
  } catch (err) {
    next(err);
  }
};
export const getVolunteers: RequestHandler = async (req, res, next) => {
  try {
    const volunteers = await VolunteerModel.find();
    res.status(200).json(volunteers);
  } catch (err) {
    next(err);
  }
};

type VolunteerByEmailBody = {
  email: string;
};

export const getVolunteerByEmail: RequestHandler = async (req, res, next) => {
  const { email } = req.body as VolunteerByEmailBody;

  try {
    const volunteer = await VolunteerModel.findOne({ email });
    if (!volunteer) {
      return res.status(404).json({ error: "Could not find volunteer" });
    }
    res.status(200).json(volunteer);
  } catch (err) {
    next(err);
  }
};

type VolunteerByPhoneNumberBody = {
  phoneNumber: string;
};

export const getVolunteerPhoneNumber: RequestHandler = async (req, res, next) => {
  const { phoneNumber } = req.body as VolunteerByPhoneNumberBody;

  try {
    const volunteer = await VolunteerModel.findOne({ phoneNumber });
    if (!volunteer) {
      return res.status(404).json({ error: "Could not find volunteer" });
    }
    res.status(200).json(volunteer);
  } catch (err) {
    next(err);
  }
};

export const getTagsAssignedToVolunteer: RequestHandler = async (req, res, next) => {
  const volunteerId = req.params.id;

  try {
    const volunteer = await VolunteerModel.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ error: "Could not find volunteer" });
    }
    res.status(200).json(volunteer.tags);
  } catch (err) {
    next(err);
  }
};

type CreateVolunteerBody = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  tags?: string[];
};

export const createVolunteer: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const { firstName, lastName, email, phoneNumber, tags = [] } = req.body as CreateVolunteerBody;
  try {
    validationErrorParser(errors);

    const volunteer = await VolunteerModel.findOne({ email });
    if (volunteer) {
      return res.status(409).json({ error: "Volunteer with this email already exists" });
    }

    const newVolunteer = await VolunteerModel.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      tags,
    });
    res.status(201).json(newVolunteer);
  } catch (err) {
    next(err);
  }
};

type UpdateVolunteerContactBody = {
  email: string;
  phoneNumber: string;
};

export const updateVolunteerContact: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const volunteerId = req.params.id;
  const { email, phoneNumber } = req.body as UpdateVolunteerContactBody;

  try {
    validationErrorParser(errors);

    const volunteer = await VolunteerModel.findByIdAndUpdate(volunteerId, {
      phoneNumber,
      email,
    });

    if (!volunteer) {
      return res.status(404).json({ error: "Could not find volunteer" });
    }

    res.status(200).json(volunteer);
  } catch (err) {
    next(err);
  }
};

type AssignTagsBody = {
  tags: string[];
};

export const assignTagsToVolunteer: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const volunteerId = req.params.id;

  try {
    validationErrorParser(errors);

    const { tags } = req.body as AssignTagsBody;
    const volunteer = await VolunteerModel.findByIdAndUpdate(volunteerId, {
      $addToSet: { tags: { $each: tags } },
    });

    if (!volunteer) {
      return res.status(404).json({ error: "Could not find volunteer" });
    }

    res.status(200).json(volunteer);
  } catch (err) {
    next(err);
  }
};

type RemoveTagsFromVolunteerBody = {
  tags: string[];
};

export const removeTagsFromVolunteer: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const volunteerId = req.params.id;

  try {
    validationErrorParser(errors);

    const { tags } = req.body as RemoveTagsFromVolunteerBody;
    const volunteer = await VolunteerModel.findByIdAndUpdate(volunteerId, {
      $pullAll: { tags },
    });

    if (!volunteer) {
      return res.status(404).json({ error: "Could not find volunteer" });
    }

    res.status(200).json(volunteer);
  } catch (err) {
    next(err);
  }
};

export const deleteVolunteer: RequestHandler = async (req, res, next) => {
  const volunteerId = req.params.id;

  try {
    const volunteer = await VolunteerModel.findByIdAndDelete(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ error: "Could not find volunteer" });
    }
    res.status(200).json({ message: "Volunteer deleted successfully" });
  } catch (err) {
    next(err);
  }
};

type UpdateVolunteerOp = {
  u: {
    $set: {
      email: string;
    };
  };
};

export const uploadVolunteerBatch: RequestHandler<
  object,
  object,
  { volunteers: CreateVolunteerBody[] }
> = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    validationErrorParser(errors);

    const { volunteers } = req.body;
    const bulkOps = volunteers.map((body) => ({
      updateOne: {
        filter: {
          $or: [{ email: body.email }, { phoneNumber: body.phoneNumber }],
        },
        update: {
          $set: body,
        },
        upsert: true,
      },
    }));
    // Continue writing others even if one fails
    const createdVolunteers = await VolunteerModel.bulkWrite(bulkOps, { ordered: false });

    res.status(200).json({
      message: "Volunteers created successfully",
      created: createdVolunteers.upsertedCount,
      updated: createdVolunteers.modifiedCount,
    });
  } catch (err: any) {
    if ((err as MongoBulkWriteError)?.name === "MongoBulkWriteError") {
      const typedErr = err as MongoBulkWriteError;
      const failedBodies = [];
      const writeErrors: WriteError[] = Array.isArray(typedErr.writeErrors)
        ? (typedErr.writeErrors as WriteError[])
        : [typedErr.writeErrors as WriteError];
      for (const writeError of writeErrors) {
        const body = (writeError.err?.op as UpdateVolunteerOp)?.u?.$set;
        failedBodies.push(body);
      }
      res.status(500).json({
        message: "Error creating volunteers",
        created: typedErr.result.upsertedCount,
        updated: typedErr.result.modifiedCount,
        failed: failedBodies,
      });
      return;
    }
    next(err);
  }
};

const validateVolunteer = (volunteer: unknown) => {
  const typedVolunteer = volunteer as CreateVolunteerBody;
  if (!typedVolunteer?.firstName || !typedVolunteer?.lastName) {
    return false;
  }
  if (!typedVolunteer?.email || !EMAIL_REGEX.test(typedVolunteer.email)) {
    return false;
  }
  if (!typedVolunteer?.phoneNumber || !PHONE_NUMBER_REGEX.test(typedVolunteer.phoneNumber)) {
    return false;
  }
  return true;
};

const statusKeyToString = (key: string): string => {
  if (key === "R") {
    return "returning";
  } else if (key === "N") {
    return "new";
  } else {
    return key;
  }
};

const createCSVCreationBody = (data: Record<string, string>): CreateVolunteerBody => {
  return {
    firstName: data.First,
    lastName: data.Last,
    email: data.Email,
    phoneNumber: data.Phone,
    status: statusKeyToString(data.New),
  } as CreateVolunteerBody;
};

const parseVolunteersHelper = async (fileBuffer: Buffer) => {
  const parsedVolunteers: CreateVolunteerBody[] = [] as CreateVolunteerBody[];
  const bufferStream = new PassThrough();
  bufferStream.end(fileBuffer);

  await new Promise<void>((resolve, reject) => {
    bufferStream
      .pipe(csvParser())
      .on("data", (data: Record<string, string>) => {
        if (data.Count === "0") {
          return;
        }
        const creationBody = createCSVCreationBody(data);

        const valid = validateVolunteer(creationBody);

        if (!valid) {
          bufferStream.destroy();
          reject(createError(400, `Invalid volunteer data: ${JSON.stringify(data)}`));
          return;
        }

        parsedVolunteers.push(creationBody);
      })
      .on("end", resolve)
      .on("error", reject);
  });

  return parsedVolunteers;
};

export const parseVolunteersCsv: RequestHandler = async (req, res, next) => {
  try {
    if (req.file === undefined) {
      return res.status(400).json({ error: "No CSV file attached" });
    }

    const parsedVolunteers = await parseVolunteersHelper(req.file.buffer);

    const emails = parsedVolunteers.map((v) => v.email);
    const phoneNumbers = parsedVolunteers.map((v) => v.phoneNumber);
    const existing = await VolunteerModel.find({
      // Find all in one await
      $or: [{ email: { $in: emails } }, { phoneNumber: { $in: phoneNumbers } }],
    });

    const existingSet = new Set<string>();
    existing.forEach((volunteer) => {
      existingSet.add(volunteer.email);
      existingSet.add(volunteer.phoneNumber);
    });

    const wouldCreate = parsedVolunteers.filter(
      (v) => !existingSet.has(v.email) && !existingSet.has(v.phoneNumber),
    ).length;
    const wouldUpdate = parsedVolunteers.length - wouldCreate;

    res.status(200).json({
      message: "CSV parsed successfully",
      volunteerInfo: parsedVolunteers,
      total: parsedVolunteers.length,
      wouldCreate,
      wouldUpdate,
    });
  } catch (err) {
    next(err);
  }
};

export const createVolunteersCsv: RequestHandler = async (req, res, next) => {
  try {
    if (req.file === undefined) {
      return res.status(400).json({ error: "No CSV file attached" });
    }

    const volunteerCreationBodies = await parseVolunteersHelper(req.file.buffer);

    const bulkOps = volunteerCreationBodies.map((body) => ({
      updateOne: {
        filter: {
          $or: [{ email: body.email }, { phoneNumber: body.phoneNumber }],
        },
        update: {
          $set: body,
        },
        upsert: true,
      },
    }));
    // Continue writing others even if one fails
    const createdVolunteers = await VolunteerModel.bulkWrite(bulkOps, { ordered: false });

    res.status(200).json({
      message: "Volunteers created successfully",
      created: createdVolunteers.upsertedCount,
      updated: createdVolunteers.modifiedCount,
    });
  } catch (err) {
    if ((err as MongoBulkWriteError)?.name === "MongoBulkWriteError") {
      const typedErr = err as MongoBulkWriteError;
      const failedBodies = [];
      const writeErrors: WriteError[] = Array.isArray(typedErr.writeErrors)
        ? (typedErr.writeErrors as WriteError[])
        : [typedErr.writeErrors as WriteError];
      for (const writeError of writeErrors) {
        const body = (writeError.err?.op as UpdateVolunteerOp)?.u?.$set;
        failedBodies.push(body);
      }
      res.status(500).json({
        message: "Error creating volunteers",
        created: typedErr.result.upsertedCount,
        updated: typedErr.result.modifiedCount,
        failed: failedBodies,
      });
      return;
    }
    next(err);
  }
};
