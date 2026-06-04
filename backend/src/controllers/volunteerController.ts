import { PassThrough } from "node:stream";

import csvParser from "csv-parser";
import { validationResult } from "express-validator";
import createError from "http-errors";

import { getAutoTagColor } from "../../../shared/colorOptions";
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

type ProjectProgramPair = {
  projectName: string;
  programName: string;
};

const rawProjectProgramPairs: ProjectProgramPair[] = [
  { projectName: "Administrative Internship", programName: "Administrative" },
  { projectName: "Administrative Volunteer", programName: "Administrative" },
  { projectName: "Adopt a Family 2017", programName: "Philanthropy" },
  { projectName: "BackPack Drive 2022", programName: "Communities in Action" },
  { projectName: "BackPack Drive 2024", programName: "Communities in Action" },
  { projectName: "BHS Internship", programName: "Behavioral Health Services" },
  { projectName: "BHS Volunteer", programName: "Behavioral Health Services" },
  { projectName: "Blue Ribbon Broadcast 2021", programName: "Philanthropy" },
  { projectName: "Blue Ribbon Gala 2017", programName: "Philanthropy" },
  { projectName: "Blue Ribbon Gala 2018", programName: "Philanthropy" },
  { projectName: "Blue Ribbon Gala 2019", programName: "Philanthropy" },
  { projectName: "Blue Ribbon Gala 2022", programName: "Philanthropy" },
  { projectName: "Blue Ribbon Gala 2023", programName: "Philanthropy" },
  { projectName: "Blue Ribbon Gala 2024", programName: "Philanthropy" },
  { projectName: "Blue Ribbon Gala 2025", programName: "Philanthropy" },
  { projectName: "Blue Ribbon Gala Past", programName: "Philanthropy" },
  { projectName: "Board of Directors", programName: "Executive" },
  { projectName: "Bright Futures Candle", programName: "Finances" },
  { projectName: "CalFresh Program", programName: "Communities in Action" },
  { projectName: "CINA Internship", programName: "Communities in Action" },
  { projectName: "CINA Volunteer", programName: "Communities in Action" },
  { projectName: "Clinical Supervision", programName: "Behavioral Health Services" },
  { projectName: "Committee", programName: "Philanthropy" },
  { projectName: "CSF Internship", programName: "Community Services for Families" },
  { projectName: "CSF Volunteer", programName: "Community Services for Families" },
  { projectName: "DV Internship", programName: "Maternity Housing Program" },
  { projectName: "DV Volunteer", programName: "Maternity Housing Program" },
  { projectName: "East Youth Walk 2022", programName: "Maternity Housing Program" },
  { projectName: "East Youth Walk 2024", programName: "Maternity Housing Program" },
  { projectName: "EITC Volunteer", programName: "Communities in Action" },
  { projectName: "Event Committee", programName: "Philanthropy" },
  { projectName: "Executive Internship", programName: "Executive" },
  { projectName: "Executive Strategy", programName: "Executive" },
  { projectName: "F5FS Internship", programName: "First 5 First Steps" },
  { projectName: "F5FS Volunteer", programName: "First 5 First Steps" },
  { projectName: "Finances Committee", programName: "Finances" },
  { projectName: "Fiscal Internship", programName: "Finances" },
  { projectName: "Fiscal Volunteer", programName: "Finances" },
  { projectName: "Food Distribution", programName: "Family Self-Sufficiency Program" },
  { projectName: "FSS", programName: "Family Self-Sufficiency Program" },
  { projectName: "Hallo-Wine 2016", programName: "Philanthropy" },
  { projectName: "Hallo-Wine 2017", programName: "Philanthropy" },
  { projectName: "Hallo-Wine 2018", programName: "Philanthropy" },
  { projectName: "Hallo-Wine 2019", programName: "Philanthropy" },
  { projectName: "Hallo-Wine 2020", programName: "Philanthropy" },
  { projectName: "Hallo-Wine 2021", programName: "Philanthropy" },
  { projectName: "Hallo-Wine 2022", programName: "Philanthropy" },
  { projectName: "Hallo-Wine 2023", programName: "Philanthropy" },
  { projectName: "Hallo-Wine 2024", programName: "Philanthropy" },
  { projectName: "Hallo-Wine 2025", programName: "Philanthropy" },
  { projectName: "Hallo-Wine Past", programName: "Philanthropy" },
  { projectName: "Holiday Dropoff 2019", programName: "Philanthropy" },
  { projectName: "Housing Outreach Intern", programName: "Maternity Housing Program" },
  { projectName: "Housing Outreach Volunteer", programName: "Maternity Housing Program" },
  { projectName: "HR Internship", programName: "Human Resources" },
  { projectName: "HR Volunteer", programName: "Human Resources" },
  { projectName: "MHP Health Clinics", programName: "Maternity Housing Program" },
  { projectName: "MHP Internship", programName: "Maternity Housing Program" },
  { projectName: "MHP Volunteer", programName: "Maternity Housing Program" },
  { projectName: "Personnel Committee", programName: "Human Resources" },
  { projectName: "Philanthropy Internship", programName: "Philanthropy" },
  { projectName: "Philanthropy Resources Committee", programName: "Philanthropy" },
  { projectName: "Philanthropy Volunteer", programName: "Philanthropy" },
  { projectName: "PR Marketing", programName: "Philanthropy" },
  { projectName: "Rapid Rehousing Intern", programName: "Maternity Housing Program" },
  { projectName: "Rapid ReHousing Volunteer", programName: "Maternity Housing Program" },
  { projectName: "Storage Facility", programName: "Administrative" },
  { projectName: "Targeted Home Visiting", programName: "Maternity Housing Program" },
  { projectName: "Thrift Boutique", programName: "Finances" },
  { projectName: "Thrift Boutique Committee", programName: "Finances" },
  { projectName: "Toy Distribution 2016", programName: "Philanthropy" },
  { projectName: "Toy Distribution 2017", programName: "Philanthropy" },
  { projectName: "Toy Distribution 2018", programName: "Philanthropy" },
  { projectName: "Toy Distribution 2019", programName: "Philanthropy" },
  { projectName: "Toy Distribution 2020", programName: "Philanthropy" },
  { projectName: "Toy Distribution 2021", programName: "Philanthropy" },
  { projectName: "Toy Distribution 2022", programName: "Philanthropy" },
  { projectName: "Toy Distribution 2023", programName: "Philanthropy" },
  { projectName: "Toy Distribution 2024", programName: "Philanthropy" },
  { projectName: "VITA", programName: "Communities in Action" },
  { projectName: "VP Internship", programName: "Human Resources" },
  { projectName: "VP Volunteer", programName: "Human Resources" },
];

const projectProgramNameByProjectName = new Map(
  rawProjectProgramPairs.map(({ projectName, programName }) => [projectName, programName]),
);

const getMappedProgramName = (projectName?: string | null) => {
  if (!projectName) return undefined;
  return projectProgramNameByProjectName.get(projectName.trim());
};

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
  programNames?: string[];
  groupNames?: string[];
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

type TagToCreate = {
  name: string;
  type: "assignment" | "project" | "shift" | "program" | "group";
  color: string;
};

export const uploadVolunteerBatch: RequestHandler<
  object,
  object,
  { volunteers: CreateVolunteerBody[]; tagsToCreate?: TagToCreate[] }
> = async (req, res, next) => {
  const errors = validationResult(req);

  try {
    validationErrorParser(errors);

    const { volunteers, tagsToCreate = [] } = req.body;

    const tagsToCreateByKey = new Map<string, TagToCreate>();
    for (const tag of tagsToCreate) {
      tagsToCreateByKey.set(`${tag.type}:${tag.name}`, tag);
    }

    const allProgramNames = new Set<string>();
    const allGroupNames = new Set<string>();
    for (const v of volunteers) {
      for (const name of v.programNames ?? []) allProgramNames.add(name);
      for (const name of v.groupNames ?? []) allGroupNames.add(name);

      const mappedProgramName = getMappedProgramName(v.projectName);
      if (mappedProgramName) {
        allProgramNames.add(mappedProgramName);
        const key = `program:${mappedProgramName}`;
        if (!tagsToCreateByKey.has(key)) {
          tagsToCreateByKey.set(key, {
            name: mappedProgramName,
            type: "program",
            color: getAutoTagColor(mappedProgramName, "program"),
          });
        }
      }
    }

    const mergedTagsToCreate = [...tagsToCreateByKey.values()];

    if (mergedTagsToCreate.length > 0) {
      await TagModel.bulkWrite(
        mergedTagsToCreate.map((t) => ({
          updateOne: {
            filter: { name: t.name, type: t.type },
            update: { $setOnInsert: { name: t.name, color: t.color, type: t.type } },
            upsert: true,
          },
        })),
        { ordered: false },
      );
    }

    const [programTags, groupTags] = await Promise.all([
      allProgramNames.size > 0
        ? TagModel.find({ name: { $in: [...allProgramNames] }, type: "program" })
        : Promise.resolve([]),
      allGroupNames.size > 0
        ? TagModel.find({ name: { $in: [...allGroupNames] }, type: "group" })
        : Promise.resolve([]),
    ]);

    const programTagByName = new Map(programTags.map((t) => [t.name, t._id]));
    const groupTagByName = new Map(groupTags.map((t) => [t.name, t._id]));

    const volunteersByKey = new Map<VolunteerImportKey, CreateVolunteerBody>();
    for (const body of volunteers) {
      volunteersByKey.set(makeVolunteerImportKey(body), body);
    }

    const uniqueVolunteers = [...volunteersByKey.values()];

    const bulkOps = uniqueVolunteers.map((body) => {
      const programTagIds = body.programNames
        ?.map((n) => programTagByName.get(n))
        .filter((id): id is NonNullable<typeof id> => id !== undefined);
      const groupTagIds = body.groupNames
        ?.map((n) => groupTagByName.get(n))
        .filter((id): id is NonNullable<typeof id> => id !== undefined);

      return {
        updateOne: {
          filter: {
            $or: [{ email: body.email }, { phoneNumber: body.phoneNumber }],
          },
          update: {
            $set: {
              ...normalizeVolunteerForBulkWrite(body),
              effectiveDate: new Date(),
              ...(body.programNames !== undefined && { programTagIds: programTagIds ?? [] }),
              ...(body.groupNames !== undefined && { groupTagIds: groupTagIds ?? [] }),
            },
            $setOnInsert: { dateCreated: new Date() },
          },
          upsert: true,
        },
      };
    });
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

      const tagByKey = new Map(allTags.map((tag) => [`${tag.type}:${tag.name}`, tag]));
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

        const assignmentTag = tagByKey.get(`assignment:${entry.assignmentTag}`);
        const projectTag = entry.projectTag ? tagByKey.get(`project:${entry.projectTag}`) : null;

        if (!assignmentTag || assignmentTag.type !== "assignment") {
          return [];
        }

        const shiftTagIds = [...entry.shiftNames]
          .map((shiftName) => tagByKey.get(`shift:${shiftName}`))
          .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag))
          .filter((tag) => tag.type === "shift")
          .map((tag) => tag._id);

        const filter: {
          volunteerId: Types.ObjectId;
          assignmentTagId: Types.ObjectId;
          projectTagId?: Types.ObjectId;
        } = {
          volunteerId: volunteer._id,
          assignmentTagId: assignmentTag._id,
        };

        if (projectTag && projectTag.type === "project") {
          filter.projectTagId = projectTag._id;
        }

        return [
          {
            updateOne: {
              filter,
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

type NewFormatRawRow = {
  externalId: string;
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
  programs: string[];
  groups: string[];
  assignment: string;
  project: string;
  shift: string;
};

const isNewCsvFormat = (headers: string[]): boolean => headers.includes("constituent id");

const parseSemicolonList = (value: string): string[] =>
  value
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

const normalizeNewFormatRow = (data: Record<string, string>): NewFormatRawRow => ({
  externalId: normalizeCsvText(data["constituent id"]),
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
  programs: parseSemicolonList(normalizeCsvText(data.program ?? "")),
  groups: parseSemicolonList(normalizeCsvText(data.groups ?? "")),
  assignment: normalizeCsvText(data.assignment),
  project: normalizeCsvText(data.project),
  shift: normalizeCsvText(data.shift ?? ""),
});

const aggregateMultiRowVolunteers = (rows: NewFormatRawRow[]): VolunteerCreationBody[] => {
  type VolunteerBlock = {
    base: NewFormatRawRow | null;
    assignments: { assignment: string; project: string; shift: string }[];
  };

  const byId = new Map<string, VolunteerBlock>();

  for (const row of rows) {
    if (!row.externalId) {
      throw createError(400, `Row is missing an ID: "${row.firstName} ${row.lastName}"`);
    }

    if (!byId.has(row.externalId)) {
      byId.set(row.externalId, { base: null, assignments: [] });
    }
    const block = byId.get(row.externalId)!;

    if (row.email || row.phoneNumber) {
      if (block.base === null) {
        block.base = row;
      } else if (
        (row.email && block.base.email && row.email !== block.base.email) ||
        (row.phoneNumber && block.base.phoneNumber && row.phoneNumber !== block.base.phoneNumber) ||
        (row.firstName && block.base.firstName && row.firstName !== block.base.firstName) ||
        (row.lastName && block.base.lastName && row.lastName !== block.base.lastName)
      ) {
        throw createError(
          400,
          `Conflicting personal data for volunteer ID "${row.externalId}": rows have different names or contact info`,
        );
      }
    }

    if (row.assignment) {
      block.assignments.push({
        assignment: row.assignment,
        project: row.project,
        shift: row.shift,
      });
    }
  }

  const result: VolunteerCreationBody[] = [];

  for (const [externalId, block] of byId) {
    if (!block.base) {
      throw createError(
        400,
        `No personal data (email/phone) found for volunteer ID "${externalId}"`,
      );
    }

    const baseFields: VolunteerCreationBody = {
      firstName: block.base.firstName,
      lastName: block.base.lastName,
      email: block.base.email,
      phoneNumber: normalizePhoneNumber(block.base.phoneNumber),
      status: block.base.status,
      address: block.base.address,
      birthday: block.base.birthday || undefined,
      preferredPronouns: block.base.preferredPronouns || undefined,
      effectiveDate: block.base.effectiveDate || undefined,
      mediaConsent: toConsentYesNo(block.base.mediaConsent),
      faceConsent: toConsentYesNo(block.base.faceConsent),
      nameConsent: toConsentName(block.base.nameConsent),
      programNames: block.base.programs,
      groupNames: block.base.groups,
    };

    if (block.assignments.length === 0) {
      result.push(baseFields);
    } else {
      for (const a of block.assignments) {
        result.push({
          ...baseFields,
          assignmentName: a.assignment,
          projectName: a.project,
          shiftNames: a.shift ? [a.shift] : [],
        });
      }
    }
  }

  return result;
};

const parseVolunteersHelper = async (fileBuffer: Buffer) => {
  const parsedVolunteers: VolunteerCreationBody[] = [];
  const bufferStream = new PassThrough();
  bufferStream.end(fileBuffer);

  let detectedNewFormat = false;
  const newFormatRawRows: NewFormatRawRow[] = [];

  await new Promise<void>((resolve, reject) => {
    bufferStream
      .pipe(csvParser())
      .on("headers", (headers: string[]) => {
        detectedNewFormat = isNewCsvFormat(headers);
      })
      .on("data", (data: Record<string, string>) => {
        if (data.Count === "0") {
          return;
        }

        if (detectedNewFormat) {
          newFormatRawRows.push(normalizeNewFormatRow(data));
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
      .on("end", () => {
        if (detectedNewFormat) {
          try {
            const aggregated = aggregateMultiRowVolunteers(newFormatRawRows);
            for (const v of aggregated) {
              if (!validateVolunteer(v)) {
                reject(
                  createError(
                    400,
                    `Invalid volunteer data for ID "${v.email}": missing required fields`,
                  ),
                );
                return;
              }
            }
            parsedVolunteers.push(...aggregated);
          } catch (err) {
            reject(err);
            return;
          }
        }
        resolve();
      })
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

    const uniqueVolunteers = [
      ...new Map(parsedVolunteers.map((v) => [makeVolunteerImportKey(v), v])).values(),
    ];

    const emails = uniqueVolunteers.map((v) => v.email);
    const phoneNumbers = uniqueVolunteers.map((v) => v.phoneNumber);
    const existing = await VolunteerModel.find({
      $or: [{ email: { $in: emails } }, { phoneNumber: { $in: phoneNumbers } }],
    });

    const existingSet = new Set<string>();
    existing.forEach((volunteer) => {
      existingSet.add(volunteer.email);
      existingSet.add(volunteer.phoneNumber);
    });

    const wouldCreate = uniqueVolunteers
      .filter((v) => !existingSet.has(v.email) && !existingSet.has(v.phoneNumber))
      .map((v) => v.email);

    const wouldUpdate = uniqueVolunteers
      .filter((v) => existingSet.has(v.email) || existingSet.has(v.phoneNumber))
      .map((v) => v.email);

    const referencedTags: {
      name: string;
      type: "assignment" | "project" | "shift" | "program" | "group";
    }[] = [];
    for (const v of parsedVolunteers) {
      if (v.assignmentName) referencedTags.push({ name: v.assignmentName, type: "assignment" });
      if (v.projectName) referencedTags.push({ name: v.projectName, type: "project" });
      for (const shiftName of v.shiftNames ?? []) {
        referencedTags.push({ name: shiftName, type: "shift" });
      }
      for (const programName of v.programNames ?? []) {
        referencedTags.push({ name: programName, type: "program" });
      }
      for (const groupName of v.groupNames ?? []) {
        referencedTags.push({ name: groupName, type: "group" });
      }
    }

    const uniqueReferenced = [
      ...new Map(referencedTags.map((t) => [`${t.type}:${t.name}`, t])).values(),
    ];

    const allTagNames = uniqueReferenced.map((t) => t.name);
    const existingTags = await TagModel.find({ name: { $in: allTagNames } });
    const existingTagKeys = new Set(existingTags.map((t) => `${t.type}:${t.name}`));

    const missingTags = uniqueReferenced.filter((t) => !existingTagKeys.has(`${t.type}:${t.name}`));

    res.status(200).json({
      message: "CSV parsed successfully",
      volunteerInfo: parsedVolunteers,
      total: parsedVolunteers.length,
      wouldCreateCount: wouldCreate.length,
      wouldUpdateCount: wouldUpdate.length,
      wouldCreate,
      wouldUpdate,
      missingTags,
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

type CsvRowContext = {
  volunteer: VolunteerExportDoc;
  volunteerId: number;
  assignmentName: string;
  projectName: string;
  shiftName: string;
  programNames: string[];
  groupNames: string[];
};

type CsvColumn = {
  header: string;
  toCell: (ctx: CsvRowContext) => string;
  isDetailColumn?: boolean;
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
  { header: "constituent id", toCell: (ctx) => String(ctx.volunteerId), isDetailColumn: true },
  { header: "First Name", toCell: (ctx) => ctx.volunteer.firstName, isDetailColumn: true },
  { header: "Last Name", toCell: (ctx) => ctx.volunteer.lastName, isDetailColumn: true },
  { header: "program", toCell: (ctx) => ctx.programNames.join("; ") },
  { header: "groups", toCell: (ctx) => ctx.groupNames.join("; ") },
  { header: "assignment", toCell: (ctx) => ctx.assignmentName, isDetailColumn: true },
  { header: "project", toCell: (ctx) => ctx.projectName, isDetailColumn: true },
  { header: "shift", toCell: (ctx) => ctx.shiftName, isDetailColumn: true },
  { header: "Status", toCell: (ctx) => ctx.volunteer.status ?? "" },
  { header: "Address1", toCell: (ctx) => ctx.volunteer.address?.line1 ?? "" },
  { header: "Address2", toCell: (ctx) => ctx.volunteer.address?.line2 ?? "" },
  { header: "City", toCell: (ctx) => ctx.volunteer.address?.city ?? "" },
  { header: "State", toCell: (ctx) => ctx.volunteer.address?.state ?? "" },
  { header: "Zip", toCell: (ctx) => ctx.volunteer.address?.zip ?? "" },
  { header: "Birthday", toCell: (ctx) => fmtDate(ctx.volunteer.birthday) },
  { header: "Cell", toCell: (ctx) => ctx.volunteer.phoneNumber },
  { header: "Email", toCell: (ctx) => ctx.volunteer.email },
  { header: "NEW Pronouns", toCell: (ctx) => ctx.volunteer.preferredPronouns ?? "" },
  { header: "NEW Media Consent", toCell: (ctx) => ctx.volunteer.mediaConsent ?? "" },
  { header: "NEW Name Consent", toCell: (ctx) => ctx.volunteer.nameConsent ?? "" },
  { header: "NEW Face", toCell: (ctx) => ctx.volunteer.faceConsent ?? "" },
  {
    header: "Effective Date (date record was updated)",
    toCell: (ctx) => fmtDate(ctx.volunteer.effectiveDate),
  },
];

const buildCsvRow = (ctx: CsvRowContext, isDetailOnlyRow: boolean = false): string[] =>
  CSV_COLUMNS.map((col) => (isDetailOnlyRow && !col.isDetailColumn ? "" : col.toCell(ctx)));

const buildCsv = (rows: string[][]): string =>
  rows.map((row) => row.map(escapeCsvField).join(",")).join("\r\n");

export const exportVolunteersCsv: RequestHandler = async (req, res, next) => {
  try {
    const { ids } = req.body as { ids?: string[] };
    const volunteerFilter = Array.isArray(ids) && ids.length > 0 ? { _id: { $in: ids } } : {};

    const [volunteers, assignments] = await Promise.all([
      VolunteerModel.find(volunteerFilter).populate("groupTagIds").populate("programTagIds"),
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

    volunteers.forEach((volunteer, volunteerId) => {
      const volunteerAssignments = assignmentsByVolunteerId.get(volunteer._id.toString()) ?? [];
      const programNames = ((volunteer.programTagIds ?? []) as unknown as PopulatedTag[]).map(
        (t) => t.name,
      );
      const groupNames = ((volunteer.groupTagIds ?? []) as unknown as PopulatedTag[]).map(
        (t) => t.name,
      );

      if (volunteerAssignments.length === 0) {
        rows.push(
          buildCsvRow({
            volunteer,
            volunteerId,
            assignmentName: "",
            projectName: "",
            shiftName: "",
            programNames,
            groupNames,
          }),
        );
        return;
      }

      volunteerAssignments.forEach((a, aIdx) => {
        const shifts = a.shiftTagIds ?? [];
        const isFirstRow = aIdx === 0;

        if (shifts.length === 0) {
          rows.push(
            buildCsvRow(
              {
                volunteer,
                volunteerId,
                assignmentName: a.assignmentTagId?.name ?? "",
                projectName: a.projectTagId?.name ?? "",
                shiftName: "",
                programNames: isFirstRow ? programNames : [],
                groupNames: isFirstRow ? groupNames : [],
              },
              !isFirstRow,
            ),
          );
        } else {
          shifts.forEach((shift, sIdx) => {
            const isFirstShift = isFirstRow && sIdx === 0;
            rows.push(
              buildCsvRow(
                {
                  volunteer,
                  volunteerId,
                  assignmentName: a.assignmentTagId?.name ?? "",
                  projectName: a.projectTagId?.name ?? "",
                  shiftName: shift.name,
                  programNames: isFirstShift ? programNames : [],
                  groupNames: isFirstShift ? groupNames : [],
                },
                !isFirstRow,
              ),
            );
          });
        }
      });
    });

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
