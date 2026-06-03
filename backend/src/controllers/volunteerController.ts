import { PassThrough } from "node:stream";

import csvParser from "csv-parser";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

import TagModel from "../models/tagModel";
import VolunteerAssignmentModel from "../models/volunteerAssignmentModel";
import VolunteerModel from "../models/volunteerModel";
import validationErrorParser from "../util/validationErrorParser";
import { batchCreateVolunteerValidator } from "../validators/volunteerValidator";

import type { Request, RequestHandler } from "express";
import type { MongoBulkWriteError, WriteError } from "mongodb";
import type { Types } from "mongoose";
import type { Buffer } from "node:buffer";

// eslint-disable-next-line regexp/no-super-linear-backtracking
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_NUMBER_REGEX = /^\(?\d{3}\)?[-\s.]?\d{3}[-\s.]?\d{4}$/;

export const getVolunteer: RequestHandler = async (req, res, next) => {
  const volunteerId = req.params.id;

  try {
    const volunteer = await VolunteerModel.findById(volunteerId)
      .populate("groupTagIds")
      .populate("programTagIds");

    if (!volunteer) {
      throw createHttpError(404, "Could not find volunteer");
    }

    res.status(200).json(volunteer);
  } catch (err) {
    next(err);
  }
};
export const getVolunteers: RequestHandler = async (req, res, next) => {
  try {
    const volunteers = await VolunteerModel.find()
      .populate("groupTagIds")
      .populate("programTagIds");
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
      throw createHttpError(404, "Could not find volunteer");
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
      throw createHttpError(404, "Could not find volunteer");
    }
    res.status(200).json(volunteer);
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
  assignmentName?: string;
  projectName?: string;
  shiftNames?: string[];
};

type CreateVolunteerImportBody = CreateVolunteerBody;

type VolunteerImportKey = string;

const makeVolunteerImportKey = (body: CreateVolunteerImportBody): VolunteerImportKey => {
  const email = body.email.trim().toLowerCase();
  const phoneNumber = body.phoneNumber.trim();
  return email ? `email:${email}` : `phone:${phoneNumber}`;
};

export const createVolunteer: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    status = "new",
  } = req.body as CreateVolunteerBody;
  try {
    validationErrorParser(errors);

    const volunteer = await VolunteerModel.findOne({ email });
    if (volunteer) {
      throw createHttpError(409, "Volunteer with this email already exists");
    }

    const newVolunteer = await VolunteerModel.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      status,
    });
    res.status(201).json(newVolunteer);
  } catch (err) {
    next(err);
  }
};

type UpdateVolunteerBody = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  tags?: string[];
  groupTagIds?: string[] | null;
  programTagIds?: string[] | null;
  status?: "returning" | "new";
  volunteerTypeTags?: string[];
  events?: string[];
  additionalNotes?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  birthday?: string | Date;
  preferredPronouns?: string;
  hours?: number;
  mediaConsent?: "yes" | "no";
  faceConsent?: "yes" | "no";
  nameConsent?: "no" | "first" | "full";
};

export const updateVolunteer: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const volunteerId = req.params.id;
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    tags,
    groupTagIds,
    programTagIds,
    status,
    volunteerTypeTags,
    events,
    additionalNotes,
    address,
    birthday,
    preferredPronouns,
    hours,
    mediaConsent,
    faceConsent,
    nameConsent,
  } = req.body as UpdateVolunteerBody;

  try {
    validationErrorParser(errors);

    const updatePayload: Record<string, unknown> = {
      firstName,
      lastName,
      email,
      phoneNumber,
      volunteerTypeTags,
      events,
      additionalNotes,
      address,
      birthday,
      preferredPronouns,
      hours,
      mediaConsent,
      faceConsent,
      nameConsent,
      effectiveDate: new Date(),
    };

    if (Array.isArray(tags)) {
      updatePayload.tags = tags;
    }
    if (groupTagIds !== undefined) {
      updatePayload.groupTagIds = groupTagIds;
    }
    if (programTagIds !== undefined) {
      updatePayload.programTagIds = programTagIds;
    }
    if (status === "new" || status === "returning") {
      updatePayload.status = status;
    }

    const volunteer = await VolunteerModel.findByIdAndUpdate(volunteerId, updatePayload, {
      returnDocument: "after",
      runValidators: true,
    })
      .populate("groupTagIds")
      .populate("programTagIds");

    if (!volunteer) {
      return next(createHttpError(404, "Could not find volunteer"));
    }

    res.status(200).json(volunteer);
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
      throw createHttpError(404, "Could not find volunteer");
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
      throw createHttpError(404, "Could not find volunteer");
    }
    res.status(200).send();
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
  const { firstName, lastName, email, phoneNumber, status } = body;

  return {
    firstName,
    lastName,
    email,
    phoneNumber,
    status,
  };
};

const normalizeCsvText = (value: unknown) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const parseCsvList = (value: unknown) => {
  const text = normalizeCsvText(value);

  if (!text) {
    return [] as string[];
  }

  return text
    .split(/[,|;]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export const uploadVolunteerBatch: RequestHandler<
  object,
  object,
  { volunteers: CreateVolunteerImportBody[] }
> = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    validationErrorParser(errors);

    const { volunteers } = req.body;

    const volunteersByKey = new Map<VolunteerImportKey, CreateVolunteerImportBody>();
    for (const body of volunteers) {
      volunteersByKey.set(makeVolunteerImportKey(body), body);
    }

    const uniqueVolunteers = [...volunteersByKey.values()];

    const bulkOps = uniqueVolunteers.map((body) => ({
      updateOne: {
        filter: {
          $or: [{ email: body.email }, { phoneNumber: body.phoneNumber }],
        },
        update: {
          $set: normalizeVolunteerForBulkWrite(body),
          // Mongo operator to set a field to the current date
          $currentDate: { updated: true as const },
        },
        upsert: true,
      },
    }));
    // Continue writing others even if one fails
    const createdVolunteers = await VolunteerModel.bulkWrite(bulkOps, { ordered: false });

    const assignmentRows = volunteers.filter(
      (volunteer) => volunteer.assignmentName && volunteer.projectName,
    );

    if (assignmentRows.length > 0) {
      const uniqueNames = new Set<string>();
      for (const volunteer of assignmentRows) {
        if (volunteer.assignmentName) uniqueNames.add(volunteer.assignmentName);
        if (volunteer.projectName) uniqueNames.add(volunteer.projectName);
        for (const shiftName of volunteer.shiftNames ?? []) {
          uniqueNames.add(shiftName);
        }
      }

      const [allTags, savedVolunteers] = await Promise.all([
        TagModel.find({ name: { $in: [...uniqueNames] } }),
        VolunteerModel.find({
          $or: uniqueVolunteers.flatMap((volunteer) => [
            { email: volunteer.email },
            { phoneNumber: volunteer.phoneNumber },
          ]),
        }),
      ]);

      const tagByName = new Map(allTags.map((tag) => [tag.name, tag]));
      const volunteerByKey = new Map<string, (typeof savedVolunteers)[number]>();
      for (const volunteer of savedVolunteers) {
        volunteerByKey.set(volunteer.email, volunteer);
        volunteerByKey.set(volunteer.phoneNumber, volunteer);
      }

      const groupedAssignments = new Map<
        string,
        {
          volunteer: CreateVolunteerImportBody;
          assignmentTag: string;
          projectTag: string;
          shiftNames: Set<string>;
        }
      >();

      for (const row of assignmentRows) {
        const key = makeVolunteerImportKey(row);
        const assignmentKey = `${key}|${row.assignmentName}|${row.projectName}`;
        const current = groupedAssignments.get(assignmentKey);

        if (current) {
          for (const shiftName of row.shiftNames ?? []) {
            current.shiftNames.add(shiftName);
          }
          continue;
        }

        groupedAssignments.set(assignmentKey, {
          volunteer: row,
          assignmentTag: row.assignmentName ?? "",
          projectTag: row.projectName ?? "",
          shiftNames: new Set(row.shiftNames ?? []),
        });
      }

      const assignmentOps = [...groupedAssignments.values()].map((entry) => {
        const volunteer =
          volunteerByKey.get(entry.volunteer.email) ??
          volunteerByKey.get(entry.volunteer.phoneNumber);

        if (!volunteer) {
          throw createHttpError(400, `Could not resolve volunteer for ${entry.volunteer.email}`);
        }

        const assignmentTag = tagByName.get(entry.assignmentTag);
        const projectTag = tagByName.get(entry.projectTag);

        if (!assignmentTag || assignmentTag.type !== "assignment") {
          throw createHttpError(400, `Unknown assignment tag: ${entry.assignmentTag}`);
        }

        if (!projectTag || projectTag.type !== "project") {
          throw createHttpError(400, `Unknown project tag: ${entry.projectTag}`);
        }

        const shiftTagIds = [...entry.shiftNames]
          .map((shiftName) => tagByName.get(shiftName))
          .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag))
          .filter((tag) => tag.type === "shift")
          .map((tag) => tag._id);

        return {
          updateOne: {
            filter: {
              volunteerId: volunteer._id,
              assignmentTagId: assignmentTag._id,
              projectTagId: projectTag._id,
            },
            update: {
              $addToSet: { shiftTagIds: { $each: shiftTagIds } },
            },
            upsert: true,
          },
        };
      });

      await VolunteerAssignmentModel.bulkWrite(assignmentOps, { ordered: false });
    }

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

const createCSVCreationBody = (data: Record<string, string>): CreateVolunteerImportBody => {
  const assignmentName = normalizeCsvText(data.Assignment || data["Volunteer Type"] || data.Role);
  const projectName = normalizeCsvText(data.Project || data.Event);
  const shiftNames = parseCsvList(data.Shift || data.Shifts);

  const result = {
    firstName: data.First,
    lastName: data.Last,
    email: data.Email,
    phoneNumber: data.Phone,
    status: statusKeyToEnum(data.New),
    ...(assignmentName ? { assignmentName } : {}),
    ...(projectName ? { projectName } : {}),
    ...(shiftNames.length ? { shiftNames } : {}),
  } as CreateVolunteerImportBody;
  return result;
};

const parseVolunteersHelper = async (fileBuffer: Buffer) => {
  const parsedVolunteers: CreateVolunteerImportBody[] = [] as CreateVolunteerImportBody[];
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
          reject(createHttpError(400, `Invalid volunteer data: ${JSON.stringify(data)}`));
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
      throw createHttpError(400, "No CSV file attached");
    }

    const parsedVolunteers = await parseVolunteersHelper(req.file.buffer);

    const mockReq = { body: { volunteers: parsedVolunteers } } as unknown as Request;
    await Promise.all(batchCreateVolunteerValidator.map(async (v) => v.run(mockReq)));

    const errors = validationResult(mockReq);
    if (!errors.isEmpty()) {
      return next(createHttpError(400, { errors: errors.array() }));
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
      throw createHttpError(400, "No CSV file attached");
    }

    const volunteerCreationBodies = await parseVolunteersHelper(req.file.buffer);

    const bulkOps = volunteerCreationBodies.map((body) => ({
      updateOne: {
        filter: {
          $or: [{ email: body.email }, { phoneNumber: body.phoneNumber }],
        },
        update: {
          $set: normalizeVolunteerForBulkWrite(body),
          // Mongo operator to set a field to the current date
          $currentDate: { updated: true as const },
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
      status?: { $in: Array<"new" | "returning"> };
    } = {};

    if (events.length > 0) {
      const tagEventsMap = await TagModel.find({
        name: { $in: events },
        type: "project" as const,
      }).select("_id");

      const tagEvents = tagEventsMap.map((tag) => tag._id);

      if (tagEvents.length !== events.length) {
        return next(createHttpError(400, "One or more event tags not found"));
      }

      volunteerFilter.tags = { $in: tagEvents };
    }

    const selectedStatuses = statuses.filter(
      (status): status is "new" | "returning" => status === "new" || status === "returning",
    );

    if (selectedStatuses.length > 0) {
      volunteerFilter.status = { $in: selectedStatuses };
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
    }));
    res.status(200).json(volunteerRows);
  } catch (err) {
    next(err);
  }
};
