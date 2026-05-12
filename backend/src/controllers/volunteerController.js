"use strict";
const __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVolunteerRows =
  exports.getSelectedVolunteers =
  exports.createVolunteersCsv =
  exports.parseVolunteersCsv =
  exports.uploadVolunteerBatch =
  exports.deleteVolunteer =
  exports.updateVolunteerContact =
  exports.updateVolunteer =
  exports.createVolunteer =
  exports.getVolunteerPhoneNumber =
  exports.getVolunteerByEmail =
  exports.getVolunteers =
  exports.getVolunteer =
    void 0;
const node_stream_1 = require("node:stream");
const csv_parser_1 = __importDefault(require("csv-parser"));
const express_validator_1 = require("express-validator");
const http_errors_1 = __importDefault(require("http-errors"));
const tagModel_1 = __importDefault(require("../models/tagModel"));
const volunteerAssignmentModel_1 = __importDefault(require("../models/volunteerAssignmentModel"));
const volunteerModel_1 = __importDefault(require("../models/volunteerModel"));
const validationErrorParser_1 = __importDefault(require("../util/validationErrorParser"));
const volunteerValidator_1 = require("../validators/volunteerValidator");
// eslint-disable-next-line regexp/no-super-linear-backtracking
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_NUMBER_REGEX = /^\(?\d{3}\)?[-\s.]?\d{3}[-\s.]?\d{4}$/;
const getVolunteer = async (req, res, next) => {
  const volunteerId = req.params.id;
  try {
    const volunteer = await volunteerModel_1.default.findById(volunteerId);
    if (!volunteer) {
      throw (0, http_errors_1.default)(404, "Could not find volunteer");
    }
    res.status(200).json(volunteer);
  } catch (err) {
    next(err);
  }
};
exports.getVolunteer = getVolunteer;
const getVolunteers = async (req, res, next) => {
  try {
    const volunteers = await volunteerModel_1.default.find();
    res.status(200).json(volunteers);
  } catch (err) {
    next(err);
  }
};
exports.getVolunteers = getVolunteers;
const getVolunteerByEmail = async (req, res, next) => {
  const { email } = req.body;
  try {
    const volunteer = await volunteerModel_1.default.findOne({ email });
    if (!volunteer) {
      throw (0, http_errors_1.default)(404, "Could not find volunteer");
    }
    res.status(200).json(volunteer);
  } catch (err) {
    next(err);
  }
};
exports.getVolunteerByEmail = getVolunteerByEmail;
const getVolunteerPhoneNumber = async (req, res, next) => {
  const { phoneNumber } = req.body;
  try {
    const volunteer = await volunteerModel_1.default.findOne({ phoneNumber });
    if (!volunteer) {
      throw (0, http_errors_1.default)(404, "Could not find volunteer");
    }
    res.status(200).json(volunteer);
  } catch (err) {
    next(err);
  }
};
exports.getVolunteerPhoneNumber = getVolunteerPhoneNumber;
const makeVolunteerImportKey = (body) => {
  const email = body.email.trim().toLowerCase();
  const phoneNumber = body.phoneNumber.trim();
  return email ? `email:${email}` : `phone:${phoneNumber}`;
};
const createVolunteer = async (req, res, next) => {
  const errors = (0, express_validator_1.validationResult)(req);
  const { firstName, lastName, email, phoneNumber, status = "new" } = req.body;
  try {
    (0, validationErrorParser_1.default)(errors);
    const volunteer = await volunteerModel_1.default.findOne({ email });
    if (volunteer) {
      throw (0, http_errors_1.default)(409, "Volunteer with this email already exists");
    }
    const newVolunteer = await volunteerModel_1.default.create({
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
exports.createVolunteer = createVolunteer;
const updateVolunteer = async (req, res, next) => {
  const errors = (0, express_validator_1.validationResult)(req);
  const volunteerId = req.params.id;
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    tags,
    status,
    volunteerTypeTags,
    events,
    additionalNotes,
    address,
    birthday,
    preferredPronouns,
    hours,
    startDate,
    endDate,
    mediaConsent,
    faceConsent,
    nameConsent,
  } = req.body;
  try {
    (0, validationErrorParser_1.default)(errors);
    const updatePayload = {
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
      startDate,
      endDate,
      mediaConsent,
      faceConsent,
      nameConsent,
      effectiveDate: new Date(),
    };
    if (Array.isArray(tags)) {
      updatePayload.tags = tags;
    }
    if (status === "new" || status === "returning") {
      updatePayload.status = status;
    }
    const volunteer = await volunteerModel_1.default.findByIdAndUpdate(volunteerId, updatePayload, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!volunteer) {
      return res.status(404).json({ error: "Could not find volunteer" });
    }
    res.status(200).json(volunteer);
  } catch (err) {
    next(err);
  }
};
exports.updateVolunteer = updateVolunteer;
const updateVolunteerContact = async (req, res, next) => {
  const errors = (0, express_validator_1.validationResult)(req);
  const volunteerId = req.params.id;
  const { email, phoneNumber } = req.body;
  try {
    (0, validationErrorParser_1.default)(errors);
    const volunteer = await volunteerModel_1.default.findByIdAndUpdate(volunteerId, {
      phoneNumber,
      email,
    });
    if (!volunteer) {
      throw (0, http_errors_1.default)(404, "Could not find volunteer");
    }
    res.status(200).json(volunteer);
  } catch (err) {
    next(err);
  }
};
exports.updateVolunteerContact = updateVolunteerContact;
const deleteVolunteer = async (req, res, next) => {
  const volunteerId = req.params.id;
  try {
    const volunteer = await volunteerModel_1.default.findByIdAndDelete(volunteerId);
    if (!volunteer) {
      throw (0, http_errors_1.default)(404, "Could not find volunteer");
    }
    res.status(200).json({ message: "Volunteer deleted successfully" });
  } catch (err) {
    next(err);
  }
};
exports.deleteVolunteer = deleteVolunteer;
const normalizeVolunteerForBulkWrite = (body) => {
  const { firstName, lastName, email, phoneNumber, status } = body;
  return {
    firstName,
    lastName,
    email,
    phoneNumber,
    status,
  };
};
const normalizeCsvText = (value) => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
};
const parseCsvList = (value) => {
  const text = normalizeCsvText(value);
  if (!text) {
    return [];
  }
  return text
    .split(/[,|;]/)
    .map((item) => item.trim())
    .filter(Boolean);
};
const uploadVolunteerBatch = async (req, res, next) => {
  const errors = (0, express_validator_1.validationResult)(req);
  try {
    (0, validationErrorParser_1.default)(errors);
    const { volunteers } = req.body;
    const volunteersByKey = new Map();
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
          $currentDate: { updated: true },
        },
        upsert: true,
      },
    }));
    // Continue writing others even if one fails
    const createdVolunteers = await volunteerModel_1.default.bulkWrite(bulkOps, { ordered: false });
    const assignmentRows = volunteers.filter(
      (volunteer) => volunteer.assignmentName && volunteer.projectName,
    );
    if (assignmentRows.length > 0) {
      const uniqueNames = new Set();
      for (const volunteer of assignmentRows) {
        if (volunteer.assignmentName) uniqueNames.add(volunteer.assignmentName);
        if (volunteer.projectName) uniqueNames.add(volunteer.projectName);
        for (const shiftName of volunteer.shiftNames ?? []) {
          uniqueNames.add(shiftName);
        }
      }
      const [allTags, savedVolunteers] = await Promise.all([
        tagModel_1.default.find({ name: { $in: [...uniqueNames] } }),
        volunteerModel_1.default.find({
          $or: uniqueVolunteers.flatMap((volunteer) => [
            { email: volunteer.email },
            { phoneNumber: volunteer.phoneNumber },
          ]),
        }),
      ]);
      const tagByName = new Map(allTags.map((tag) => [tag.name, tag]));
      const volunteerByKey = new Map();
      for (const volunteer of savedVolunteers) {
        volunteerByKey.set(volunteer.email, volunteer);
        volunteerByKey.set(volunteer.phoneNumber, volunteer);
      }
      const groupedAssignments = new Map();
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
          throw (0, http_errors_1.default)(
            400,
            `Could not resolve volunteer for ${entry.volunteer.email}`,
          );
        }
        const assignmentTag = tagByName.get(entry.assignmentTag);
        const projectTag = tagByName.get(entry.projectTag);
        if (!assignmentTag || assignmentTag.type !== "assignment") {
          throw (0, http_errors_1.default)(400, `Unknown assignment tag: ${entry.assignmentTag}`);
        }
        if (!projectTag || projectTag.type !== "project") {
          throw (0, http_errors_1.default)(400, `Unknown project tag: ${entry.projectTag}`);
        }
        const shiftTagIds = [...entry.shiftNames]
          .map((shiftName) => tagByName.get(shiftName))
          .filter((tag) => Boolean(tag))
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
      await volunteerAssignmentModel_1.default.bulkWrite(assignmentOps, { ordered: false });
    }
    res.status(200).json({
      message: "Volunteers created successfully",
      created: createdVolunteers.upsertedCount,
      updated: createdVolunteers.modifiedCount,
    });
  } catch (err) {
    if (err?.name === "MongoBulkWriteError") {
      const typedErr = err;
      const failedBodies = [];
      const writeErrors = Array.isArray(typedErr.writeErrors)
        ? typedErr.writeErrors
        : [typedErr.writeErrors];
      for (const writeError of writeErrors) {
        const body = writeError.err?.op?.u?.$set;
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
exports.uploadVolunteerBatch = uploadVolunteerBatch;
const validateVolunteer = (volunteer) => {
  const typedVolunteer = volunteer;
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
const statusKeyToEnum = (key) => {
  key = key.trim().toUpperCase();
  if (key === "R") {
    return "returning";
  } else if (key === "N") {
    return "new";
  } else {
    return key;
  }
};
const createCSVCreationBody = (data) => {
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
  };
  return result;
};
const parseVolunteersHelper = async (fileBuffer) => {
  const parsedVolunteers = [];
  const bufferStream = new node_stream_1.PassThrough();
  bufferStream.end(fileBuffer);
  await new Promise((resolve, reject) => {
    bufferStream
      .pipe((0, csv_parser_1.default)())
      .on("data", (data) => {
        if (data.Count === "0") {
          return;
        }
        const creationBody = createCSVCreationBody(data);
        const valid = validateVolunteer(creationBody);
        if (!valid) {
          bufferStream.destroy();
          reject(
            (0, http_errors_1.default)(400, `Invalid volunteer data: ${JSON.stringify(data)}`),
          );
          return;
        }
        parsedVolunteers.push(creationBody);
      })
      .on("end", resolve)
      .on("error", reject);
  });
  return parsedVolunteers;
};
const parseVolunteersCsv = async (req, res, next) => {
  try {
    if (req.file === undefined) {
      throw (0, http_errors_1.default)(400, "No CSV file attached");
    }
    const parsedVolunteers = await parseVolunteersHelper(req.file.buffer);
    const mockReq = { body: { volunteers: parsedVolunteers } };
    await Promise.all(
      volunteerValidator_1.batchCreateVolunteerValidator.map(async (v) => v.run(mockReq)),
    );
    const errors = (0, express_validator_1.validationResult)(mockReq);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const emails = parsedVolunteers.map((v) => v.email);
    const phoneNumbers = parsedVolunteers.map((v) => v.phoneNumber);
    const existing = await volunteerModel_1.default.find({
      // Find all in one await
      $or: [{ email: { $in: emails } }, { phoneNumber: { $in: phoneNumbers } }],
    });
    const existingSet = new Set();
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
exports.parseVolunteersCsv = parseVolunteersCsv;
const createVolunteersCsv = async (req, res, next) => {
  try {
    if (req.file === undefined) {
      throw (0, http_errors_1.default)(400, "No CSV file attached");
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
          $currentDate: { updated: true },
        },
        upsert: true,
      },
    }));
    // Continue writing others even if one fails
    const createdVolunteers = await volunteerModel_1.default.bulkWrite(bulkOps, { ordered: false });
    res.status(200).json({
      message: "Volunteers created successfully",
      created: createdVolunteers.upsertedCount,
      updated: createdVolunteers.modifiedCount,
    });
  } catch (err) {
    if (err?.name === "MongoBulkWriteError") {
      const typedErr = err;
      const failedBodies = [];
      const writeErrors = Array.isArray(typedErr.writeErrors)
        ? typedErr.writeErrors
        : [typedErr.writeErrors];
      for (const writeError of writeErrors) {
        const body = writeError.err?.op?.u?.$set;
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
exports.createVolunteersCsv = createVolunteersCsv;
const getSelectedVolunteers = async (req, res, next) => {
  const { events, statuses } = req.body;
  try {
    const volunteerFilter = {};
    if (events.length > 0) {
      const tagEventsMap = await tagModel_1.default
        .find({
          name: { $in: events },
          type: "Event",
        })
        .select("_id");
      const tagEvents = tagEventsMap.map((tag) => tag._id);
      if (tagEvents.length !== events.length) {
        return res.status(400).json({ error: "One or more event tags not found" });
      }
      volunteerFilter.tags = { $in: tagEvents };
    }
    if (statuses.length > 0) {
      volunteerFilter.status = { $in: statuses };
    }
    const volunteersMap = await volunteerModel_1.default
      .find(volunteerFilter)
      .select("_id firstName lastName email phoneNumber");
    return res.status(200).json(volunteersMap);
  } catch (err) {
    next(err);
  }
};
exports.getSelectedVolunteers = getSelectedVolunteers;
const getVolunteerRows = async (req, res, next) => {
  try {
    const volunteers = await volunteerModel_1.default.find();
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
exports.getVolunteerRows = getVolunteerRows;
