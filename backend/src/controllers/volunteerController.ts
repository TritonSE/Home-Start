import { PassThrough } from "node:stream";

import csvParser from "csv-parser";
import { validationResult } from "express-validator";
import createError from "http-errors";

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
const PHONE_NUMBER_REGEX = /^\+?1?\d{10}$|^\(?\d{3}\)?[-\s.]?\d{3}[-\s.]?\d{4}$/;

export const getVolunteer: RequestHandler = async (req, res, next) => {
  const volunteerId = req.params.id;

  try {
    const volunteer = await VolunteerModel.findById(volunteerId)
      .populate("groupTagIds")
      .populate("programTagIds");

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
    const volunteer = await VolunteerModel.findOne({ phoneNumber });
    if (!volunteer) {
      throw createError(404, "Could not find volunteer");
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
  address?: VolunteerAddressInfo;
  birthday?: string;
  preferredPronouns?: string;
  effectiveDate?: string;
  mediaConsent?: "yes" | "no";
  faceConsent?: "yes" | "no";
  nameConsent?: "first" | "full" | "no";
  assignmentName?: string;
  projectName?: string;
  shiftNames?: string[];
};

type VolunteerCreationBody = CreateVolunteerBody;

type VolunteerAddressInfo = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
};

type NormalizedVolunteerCSVFormat = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: "returning" | "new" | undefined;

  address: VolunteerAddressInfo;

  birthday: string;
  preferredPronouns: string;
  effectiveDate: string;

  mediaConsent: string;
  faceConsent: string;
  nameConsent: string;

  // differs from standard schema format, just while processing csv
  assignmentName: string;
  projectName: string;
};

type VolunteerImportKey = string;

const makeVolunteerImportKey = (body: CreateVolunteerBody): VolunteerImportKey => {
  const email = body.email.trim().toLowerCase();
  const phoneNumber = body.phoneNumber.trim();
  return email ? `email:${email}` : `phone:${phoneNumber}`;
};

const toDate = (value: string | undefined): Date | undefined => {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

export const createVolunteer: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    status = "new",
    address,
    birthday,
    preferredPronouns,
    effectiveDate,
    mediaConsent,
    faceConsent,
    nameConsent,
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
      status,
      dateCreated: new Date(),
      ...(address && { address }),
      ...(toDate(birthday) && { birthday: toDate(birthday) }),
      ...(preferredPronouns && { preferredPronouns }),
      ...(toDate(effectiveDate) && { effectiveDate: toDate(effectiveDate) }),
      ...(mediaConsent && { mediaConsent }),
      ...(faceConsent && { faceConsent }),
      ...(nameConsent && { nameConsent }),
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
      return res.status(404).json({ error: "Could not find volunteer" });
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
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    status,
    address,
    birthday,
    preferredPronouns,
    effectiveDate,
    mediaConsent,
    faceConsent,
    nameConsent,
  } = body;

  const birthdayDate = toDate(birthday);
  const effectiveDateDate = toDate(effectiveDate);

  return {
    firstName,
    lastName,
    email,
    phoneNumber,
    ...(status && { status }),
    ...(address && { address }),
    ...(birthdayDate && { birthday: birthdayDate }),
    ...(preferredPronouns && { preferredPronouns }),
    ...(effectiveDateDate && { effectiveDate: effectiveDateDate }),
    ...(mediaConsent && { mediaConsent }),
    ...(faceConsent && { faceConsent }),
    ...(nameConsent && { nameConsent }),
  };
};

const normalizeCsvText = (value: unknown) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
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

    const volunteersByKey = new Map<VolunteerImportKey, CreateVolunteerBody>();
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
          $set: { ...normalizeVolunteerForBulkWrite(body), effectiveDate: new Date() },
          $setOnInsert: { dateCreated: new Date() },
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
          volunteer: CreateVolunteerBody;
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

      const assignmentOps = [...groupedAssignments.values()].flatMap((entry) => {
        const volunteer =
          volunteerByKey.get(entry.volunteer.email) ??
          volunteerByKey.get(entry.volunteer.phoneNumber);

        if (!volunteer) {
          throw createError(400, `Could not resolve volunteer for ${entry.volunteer.email}`);
        }

        const assignmentTag = tagByName.get(entry.assignmentTag);
        const projectTag = tagByName.get(entry.projectTag);

        if (!assignmentTag || assignmentTag.type !== "assignment") {
          // TEMP
          console.info(
            `Assignment "${entry.assignmentTag}" does not exist and needs to be created.`,
          );
          return [];
        }

        if (!projectTag || projectTag.type !== "project") {
          // TEMP
          console.info(`Project "${entry.projectTag}" does not exist and needs to be created.`);
          return [];
        }

        const shiftTagIds = [...entry.shiftNames]
          .map((shiftName) => tagByName.get(shiftName))
          .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag))
          .filter((tag) => tag.type === "shift")
          .map((tag) => tag._id);

        return [
          {
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
          },
        ];
      });

      if (assignmentOps.length > 0) {
        await VolunteerAssignmentModel.bulkWrite(assignmentOps, { ordered: false });
      }
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

const statusKeyToEnum = (key: string): "returning" | "new" | undefined => {
  const normalized = key.trim().toLowerCase();
  if (normalized === "r" || normalized === "return" || normalized === "returning")
    return "returning";
  if (normalized === "n" || normalized === "new") return "new";
  return undefined;
};

const normalizeCSVData = (data: Record<string, string>): NormalizedVolunteerCSVFormat => {
  return {
    firstName: normalizeCsvText(data["First Name"]),
    lastName: normalizeCsvText(data["Last Name"]),
    email: normalizeCsvText(data.Email),
    phoneNumber: normalizeCsvText(data.Cell),
    status: statusKeyToEnum(data.Status ?? ""),
    address: {
      line1: normalizeCsvText(data.Address1),
      line2: normalizeCsvText(data.Address2),
      city: normalizeCsvText(data.City),
      state: normalizeCsvText(data.State),
      zip: normalizeCsvText(data.Zip),
    },
    birthday: normalizeCsvText(data.Birthday),
    preferredPronouns: normalizeCsvText(data["NEW Pronouns"]),
    effectiveDate: normalizeCsvText(data["Effective Date (date record was updated)"]),
    mediaConsent: normalizeCsvText(data["NEW Media Consent"]),
    faceConsent: normalizeCsvText(data["NEW Face"]),
    nameConsent: normalizeCsvText(data["NEW Name Consent"]),
    assignmentName: normalizeCsvText(data.assignment),
    projectName: normalizeCsvText(data.project),
  };
};

const toConsentYesNo = (value: string): "yes" | "no" | undefined => {
  const v = value.trim().toLowerCase();
  if (v === "yes") return "yes";
  if (v === "no") return "no";
  return undefined;
};

const toConsentName = (value: string): "first" | "full" | "no" | undefined => {
  const v = value.trim().toLowerCase();
  if (v === "first") return "first";
  if (v === "full") return "full";
  if (v === "no") return "no";
  return undefined;
};

const normalizePhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return digits;
};

const parseCreationBody = (data: NormalizedVolunteerCSVFormat): VolunteerCreationBody => {
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phoneNumber: normalizePhoneNumber(data.phoneNumber),
    status: data.status,
    address: data.address,
    birthday: data.birthday || undefined,
    preferredPronouns: data.preferredPronouns || undefined,
    effectiveDate: data.effectiveDate || undefined,
    mediaConsent: toConsentYesNo(data.mediaConsent),
    faceConsent: toConsentYesNo(data.faceConsent),
    nameConsent: toConsentName(data.nameConsent),
    assignmentName: data.assignmentName || undefined,
    projectName: data.projectName || undefined,
  };
};

const parseVolunteersHelper = async (fileBuffer: Buffer) => {
  const parsedVolunteers: VolunteerCreationBody[] = [];
  const bufferStream = new PassThrough();
  bufferStream.end(fileBuffer);

  await new Promise<void>((resolve, reject) => {
    bufferStream
      .pipe(csvParser())
      .on("data", (data: Record<string, string>) => {
        if (data.Count === "0") {
          return;
        }
        const normalized = normalizeCSVData(data);
        const creationBody = parseCreationBody(normalized);
        const valid = validateVolunteer(creationBody);

        if (!valid) {
          console.info("Invalid volunteer data:", data);
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

    const seenEmails = new Set<string>();
    for (const v of parsedVolunteers) {
      if (seenEmails.has(v.email)) {
        throw createError(400, `Duplicate email in CSV: ${v.email}`);
      }
      seenEmails.add(v.email);
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

export const getSelectedVolunteers: RequestHandler = async (req, res, next) => {
  const { events, statuses } = req.body as { events: string[]; statuses: string[] };
  try {
    const volunteerFilter: {
      programTagIds?: { $in: Types.ObjectId[] };
      status?: { $in: Array<"new" | "returning"> };
    } = {};

    if (events.length > 0) {
      const tagEventsMap = await TagModel.find({
        name: { $in: events },
        type: "project" as const,
      }).select("_id");

      const tagEvents = tagEventsMap.map((tag) => tag._id);

      if (tagEvents.length !== events.length) {
        return res.status(400).json({ error: "One or more event tags not found" });
      }

      volunteerFilter.programTagIds = { $in: tagEvents };
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

type PopulatedTag = { name: string };
type PopulatedAssignment = {
  volunteerId: Types.ObjectId;
  assignmentTagId: PopulatedTag;
  projectTagId: PopulatedTag;
  shiftTagIds: PopulatedTag[];
};

type VolunteerExportDoc = Awaited<ReturnType<typeof VolunteerModel.findOne>> & object;

type CsvColumn = {
  header: string;
  toCell: (volunteer: VolunteerExportDoc, assignmentName: string, projectName: string) => string;
};

const fmtDate = (date: Date | null | undefined): string =>
  date ? date.toISOString().split("T")[0] : "";

const escapeCsvField = (value: string): string => {
  if (value.includes(",") || value.includes('"') || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const CSV_COLUMNS: CsvColumn[] = [
  { header: "First Name", toCell: (v) => v.firstName },
  { header: "Last Name", toCell: (v) => v.lastName },
  { header: "assignment", toCell: (_, a) => a },
  { header: "project", toCell: (_, __, p) => p },
  { header: "Status", toCell: (v) => v.status ?? "" },
  { header: "Address1", toCell: (v) => v.address?.line1 ?? "" },
  { header: "Address2", toCell: (v) => v.address?.line2 ?? "" },
  { header: "City", toCell: (v) => v.address?.city ?? "" },
  { header: "State", toCell: (v) => v.address?.state ?? "" },
  { header: "Zip", toCell: (v) => v.address?.zip ?? "" },
  { header: "Birthday", toCell: (v) => fmtDate(v.birthday) },
  { header: "Cell", toCell: (v) => v.phoneNumber },
  { header: "Email", toCell: (v) => v.email },
  { header: "NEW Pronouns", toCell: (v) => v.preferredPronouns ?? "" },
  { header: "NEW Media Consent", toCell: (v) => v.mediaConsent ?? "" },
  { header: "NEW Name Consent", toCell: (v) => v.nameConsent ?? "" },
  { header: "NEW Face", toCell: (v) => v.faceConsent ?? "" },
  { header: "Effective Date (date record was updated)", toCell: (v) => fmtDate(v.effectiveDate) },
];

const buildCsvRow = (
  volunteer: VolunteerExportDoc,
  assignmentName: string,
  projectName: string,
): string[] => CSV_COLUMNS.map((col) => col.toCell(volunteer, assignmentName, projectName));

const buildCsv = (rows: string[][]): string =>
  rows.map((row) => row.map(escapeCsvField).join(",")).join("\r\n");

export const exportVolunteersCsv: RequestHandler = async (req, res, next) => {
  try {
    const { ids } = req.body as { ids?: string[] };
    const volunteerFilter = Array.isArray(ids) && ids.length > 0 ? { _id: { $in: ids } } : {};

    const [volunteers, assignments] = await Promise.all([
      VolunteerModel.find(volunteerFilter),
      VolunteerAssignmentModel.find()
        .populate("assignmentTagId")
        .populate("projectTagId")
        .populate("shiftTagIds"),
    ]);

    const assignmentsByVolunteerId = new Map<string, PopulatedAssignment[]>();
    for (const a of assignments) {
      const key = a.volunteerId.toString();
      if (!assignmentsByVolunteerId.has(key)) {
        assignmentsByVolunteerId.set(key, []);
      }
      assignmentsByVolunteerId.get(key)!.push(a as unknown as PopulatedAssignment);
    }

    const rows: string[][] = [CSV_COLUMNS.map((col) => col.header)];

    for (const volunteer of volunteers) {
      const volunteerAssignments = assignmentsByVolunteerId.get(volunteer._id.toString()) ?? [];

      if (volunteerAssignments.length === 0) {
        rows.push(buildCsvRow(volunteer, "", ""));
      } else {
        for (const a of volunteerAssignments) {
          rows.push(
            buildCsvRow(volunteer, a.assignmentTagId?.name ?? "", a.projectTagId?.name ?? ""),
          );
        }
      }
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="volunteers.csv"');
    res.status(200).send(buildCsv(rows));
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
