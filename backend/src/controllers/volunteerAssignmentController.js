"use strict";
const __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVolunteerAssignment =
  exports.updateVolunteerAssignment =
  exports.createVolunteerAssignment =
  exports.getVolunteerAssignmentsByVolunteerId =
  exports.getVolunteerAssignments =
    void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const volunteerAssignmentModel_1 = __importDefault(require("../models/volunteerAssignmentModel"));
const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const isStringArray = (value) =>
  Array.isArray(value) && value.every((entry) => typeof entry === "string");
const getVolunteerAssignments = async (req, res, next) => {
  try {
    const assignments = await volunteerAssignmentModel_1.default
      .find()
      .populate("assignmentTagId")
      .populate("projectTagId")
      .populate("shiftTagIds");
    res.status(200).json(assignments);
  } catch (err) {
    next(err);
  }
};
exports.getVolunteerAssignments = getVolunteerAssignments;
const getVolunteerAssignmentsByVolunteerId = async (req, res, next) => {
  const volunteerId = req.params.volunteerId;
  try {
    const assignments = await volunteerAssignmentModel_1.default
      .find({ volunteerId })
      .populate("assignmentTagId")
      .populate("projectTagId")
      .populate("shiftTagIds");
    res.status(200).json(assignments);
  } catch (err) {
    next(err);
  }
};
exports.getVolunteerAssignmentsByVolunteerId = getVolunteerAssignmentsByVolunteerId;
const createVolunteerAssignment = async (req, res, next) => {
  const body = req.body;
  const record = body ?? {};
  const volunteerId = record.volunteerId;
  const assignmentTagId = record.assignmentTagId;
  const projectTagId = record.projectTagId;
  const shiftTagIds = record.shiftTagIds;
  try {
    if (
      !isNonEmptyString(volunteerId) ||
      !isNonEmptyString(assignmentTagId) ||
      !isNonEmptyString(projectTagId)
    ) {
      throw (0, http_errors_1.default)(
        400,
        "Missing required fields: volunteerId, assignmentTagId, projectTagId",
      );
    }
    const assignment = await volunteerAssignmentModel_1.default.create({
      volunteerId,
      assignmentTagId,
      projectTagId,
      shiftTagIds: isStringArray(shiftTagIds) ? shiftTagIds : [],
    });
    await assignment.populate(["assignmentTagId", "projectTagId", "shiftTagIds"]);
    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
};
exports.createVolunteerAssignment = createVolunteerAssignment;
const updateVolunteerAssignment = async (req, res, next) => {
  const assignmentId = req.params.id;
  const body = req.body;
  const record = body ?? {};
  const assignmentTagId = record.assignmentTagId;
  const projectTagId = record.projectTagId;
  const shiftTagIds = record.shiftTagIds;
  try {
    const update = {};
    if (isNonEmptyString(assignmentTagId)) update.assignmentTagId = assignmentTagId;
    if (isNonEmptyString(projectTagId)) update.projectTagId = projectTagId;
    if (shiftTagIds === undefined || shiftTagIds === null) {
      // leave untouched
    } else if (isStringArray(shiftTagIds)) {
      update.shiftTagIds = shiftTagIds;
    } else {
      throw (0, http_errors_1.default)(400, "shiftTagIds must be an array of strings");
    }
    const assignment = await volunteerAssignmentModel_1.default
      .findByIdAndUpdate(assignmentId, update, {
        returnDocument: "after",
      })
      .populate("assignmentTagId")
      .populate("projectTagId")
      .populate("shiftTagIds");
    if (!assignment) {
      throw (0, http_errors_1.default)(404, "Assignment not found");
    }
    res.status(200).json(assignment);
  } catch (err) {
    next(err);
  }
};
exports.updateVolunteerAssignment = updateVolunteerAssignment;
const deleteVolunteerAssignment = async (req, res, next) => {
  const assignmentId = req.params.id;
  try {
    const assignment = await volunteerAssignmentModel_1.default.findByIdAndDelete(assignmentId);
    if (!assignment) {
      throw (0, http_errors_1.default)(404, "Assignment not found");
    }
    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (err) {
    next(err);
  }
};
exports.deleteVolunteerAssignment = deleteVolunteerAssignment;
