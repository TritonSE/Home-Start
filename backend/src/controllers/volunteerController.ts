import { PassThrough } from "node:stream";

import csvParser from "csv-parser";
import { validationResult } from "express-validator";
import createError from "http-errors";
import { Types } from "mongoose";

import TagModel from "../models/tagModel";
import VolunteerModel from "../models/volunteerModel";
import validationErrorParser from "../util/validationErrorParser";
import { batchCreateVolunteerValidator } from "../validators/volunteerValidator";

import type { RequestHandler } from "express";
import type { MongoBulkWriteError, WriteError } from "mongodb";
import type { Buffer } from "node:buffer";

// eslint-disable-next-line regexp/no-super-linear-backtracking
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_NUMBER_REGEX = /^\(?\d{3}\)?[-\s.]?\d{3}[-\s.]?\d{4}$/;

const defaultPopulateConfig = [{ path: "tags" }];

export const getVolunteer: RequestHandler = async (req, res, next) => {
  const volunteerId = req.params.id;

  try {
    const volunteer = await VolunteerModel.findById(volunteerId).populate(defaultPopulateConfig);

    if (!volunteer) {
      throw createError(404, "Could not find volunteer");
    }

    res.status(200).json(volunteer);
  } catch (err) {
    next(err);
  }
};
export const getVolunteers: RequestHandler = async (req, res, next) => {
  try {
    const volunteers = await VolunteerModel.find().populate(defaultPopulateConfig);
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
    const volunteer = await VolunteerModel.findOne({ email }).populate(defaultPopulateConfig);
    if (!volunteer) {
      throw createError(404, "Could not find volunteer");
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
    const volunteer = await VolunteerModel.findOne({ phoneNumber }).populate(defaultPopulateConfig);
    if (!volunteer) {
      throw createError(404, "Could not find volunteer");
    }
    res.status(200).json(volunteer);
  } catch (err) {
    next(err);
  }
};

export const getTagsAssignedToVolunteer: RequestHandler = async (req, res, next) => {
  const volunteerId = req.params.id;

  try {
    const volunteer = await VolunteerModel.findById(volunteerId).populate("tags");
    if (!volunteer) {
      throw createError(404, "Could not find volunteer");
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
  status?: "returning" | "new";
};

export const createVolunteer: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    tags = [],
    status = "new",
  } = req.body as CreateVolunteerBody;
  try {
    validationErrorParser(errors);

    const volunteer = await VolunteerModel.findOne({ email });
    if (volunteer) {
      throw createError(409, "Volunteer with this email already exists");
    }

    const newVolunteer = await VolunteerModel.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      tags,
      status,
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
    }).populate(defaultPopulateConfig);

    if (!volunteer) {
      throw createError(404, "Could not find volunteer");
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
    const volunteer = await VolunteerModel.findByIdAndUpdate(
      volunteerId,
      {
        $addToSet: { tags: { $each: tags } },
      },
      { new: true },
    ).populate(defaultPopulateConfig);

    if (!volunteer) {
      throw createError(404, "Could not find volunteer");
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
    const volunteer = await VolunteerModel.findByIdAndUpdate(
      volunteerId,
      {
        $pullAll: { tags },
      },
      { new: true },
    ).populate(defaultPopulateConfig);

    if (!volunteer) {
      throw createError(404, "Could not find volunteer");
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
      throw createError(404, "Could not find volunteer");
    }
    res.status(200).json({ message: "Volunteer deleted successfully" });
  } catch (err) {
    next(err);
  }
};

type UpdateVolunteerOp = {
  u: {
    $set: CreateVolunteerBody;
  };
};

const normalizeVolunteerForBulkWrite = (body: CreateVolunteerBody) => {
  const { tags, ...rest } = body;
  const temp = {
    ...rest,
    ...(tags && {
      tags: tags.map((id) => new Types.ObjectId(id)),
    }),
  };
  return temp;
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
          $set: normalizeVolunteerForBulkWrite(body),
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

const statusKeyToEnum = (key: string): string => {
  key = key.trim().toUpperCase();
  if (key === "R") {
    return "returning";
  } else if (key === "N") {
    return "new";
  } else {
    return key;
  }
};

const createCSVCreationBody = (data: Record<string, string>): CreateVolunteerBody => {
  const result = {
    firstName: data.First,
    lastName: data.Last,
    email: data.Email,
    phoneNumber: data.Phone,
    status: statusKeyToEnum(data.New),
    tags: data.Tags ? data.Tags.split(",").map((tag) => tag.trim()) : [],
  } as CreateVolunteerBody;
  return result;
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
      throw createError(400, "No CSV file attached");
    }

    const parsedVolunteers = await parseVolunteersHelper(req.file.buffer);

    const mockReq = { body: { volunteers: parsedVolunteers } } as unknown as Request;
    await Promise.all(batchCreateVolunteerValidator.map(async (v) => v.run(mockReq)));

    const errors = validationResult(mockReq);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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

    const wouldCreate = parsedVolunteers
      .filter((v) => !existingSet.has(v.email) && !existingSet.has(v.phoneNumber))
      .map((v) => v.email);

    const wouldUpdate = parsedVolunteers
      .filter((v) => existingSet.has(v.email) || existingSet.has(v.phoneNumber))
      .map((v) => v.email);

    res.status(200).json({
      message: "CSV parsed successfully",
      volunteerInfo: parsedVolunteers,
      total: parsedVolunteers.length,
      wouldCreateCount: wouldCreate.length,
      wouldUpdateCount: wouldUpdate.length,
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
      throw createError(400, "No CSV file attached");
    }

    const volunteerCreationBodies = await parseVolunteersHelper(req.file.buffer);

    const bulkOps = volunteerCreationBodies.map((body) => ({
      updateOne: {
        filter: {
          $or: [{ email: body.email }, { phoneNumber: body.phoneNumber }],
        },
        update: {
          $set: normalizeVolunteerForBulkWrite(body),
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

export const getSelectedVolunteers: RequestHandler = async (req, res, next) => {
  const { events, statuses } = req.body as { events: string[]; statuses: string[] };
  try {
    const volunteerFilter: {
      tags?: { $in: Types.ObjectId[] };
      status?: { $in: string[] };
    } = {};

    if (events.length > 0) {
      const tagEventsMap = await TagModel.find({
        name: { $in: events },
        type: "Event",
      }).select("_id");

      const tagEvents = tagEventsMap.map((tag) => tag._id);

      if (tagEvents.length !== events.length) {
        return res.status(400).json({ error: "One or more event tags not found" });
      }

      volunteerFilter.tags = { $in: tagEvents };
    }

    if (statuses.length > 0) {
      volunteerFilter.status = { $in: statuses };
    }

    const volunteersMap = await VolunteerModel.find(volunteerFilter).select(
      "_id firstName lastName email phoneNumber",
    );

    return res.status(200).json(volunteersMap);
  } catch (err) {
    next(err);
  }
};

export const getVolunteerRows: RequestHandler = async (req, res, next) => {
  try {
    const volunteers = await VolunteerModel.find();
    const volunteerRows = volunteers.map((volunteer) => ({
      id: volunteer._id,
      firstName: volunteer.firstName,
      lastName: volunteer.lastName,
      tags: ["intern", "volunter"],
    }));
    res.status(200).json(volunteerRows);
  } catch (err) {
    next(err);
  }
};
