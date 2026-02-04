import { PassThrough } from "node:stream";

import csvParser from "csv-parser";
import { validationResult } from "express-validator";
import createError from "http-errors";

import VolunteerModel from "../models/volunteerModel";
import validationErrorParser from "../util/validationErrorParser";

import type { RequestHandler } from "express";

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
    const createdVolunteers = await VolunteerModel.bulkWrite(bulkOps, { ordered: false });

    res.status(200).json({
      message: "Volunteers created successfully",
      created: createdVolunteers.upsertedCount,
      updated: createdVolunteers.modifiedCount,
    });
  } catch (err) {
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

export const uploadVolunteersCsv: RequestHandler = async (req, res, next) => {
  try {
    if (req.file === undefined) {
      return res.status(400).json({ error: "No CSV file attached" });
    }

    const volunteerCreationBodies: CreateVolunteerBody[] = [] as CreateVolunteerBody[];
    const bufferStream = new PassThrough();
    bufferStream.end(req.file.buffer);

    await new Promise<void>((resolve, reject) => {
      bufferStream
        .pipe(csvParser())
        .on("data", (data: Record<string, string>) => {
          const valid = validateVolunteer(data);

          if (!valid) {
            bufferStream.destroy();
            reject(createError(400, `Invalid volunteer data: ${JSON.stringify(data)}`));
            return;
          }

          const { tags, ...otherData } = data;
          const creationBody = {
            ...otherData,
            tags: tags.split(" "),
          } as CreateVolunteerBody;

          volunteerCreationBodies.push(creationBody);
        })
        .on("end", resolve)
        .on("error", reject);
    });

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
    const createdVolunteers = await VolunteerModel.bulkWrite(bulkOps, { ordered: false });

    res.status(200).json({
      message: "Volunteers created successfully",
      created: createdVolunteers.upsertedCount,
      updated: createdVolunteers.modifiedCount,
    });
  } catch (err) {
    next(err);
  }
};
