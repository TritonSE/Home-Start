import createError from "http-errors";

import VolunteerAssignmentModel from "../models/volunteerAssignmentModel";

import type { RequestHandler } from "express";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === "string");

export const getVolunteerAssignments: RequestHandler = async (req, res, next) => {
  try {
    const assignments = await VolunteerAssignmentModel.find()
      .populate("assignmentTagId")
      .populate("projectTagId")
      .populate("shiftTagIds");

    res.status(200).json(assignments);
  } catch (err) {
    next(err);
  }
};

export const getVolunteerAssignmentsByVolunteerId: RequestHandler = async (req, res, next) => {
  const volunteerId = req.params.volunteerId;

  try {
    const assignments = await VolunteerAssignmentModel.find({ volunteerId })
      .populate("assignmentTagId")
      .populate("projectTagId")
      .populate("shiftTagIds");

    res.status(200).json(assignments);
  } catch (err) {
    next(err);
  }
};

export const createVolunteerAssignment: RequestHandler = async (req, res, next) => {
  const body: unknown = req.body;
  const record = (body ?? {}) as Record<string, unknown>;
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
      throw createError(400, "Missing required fields: volunteerId, assignmentTagId, projectTagId");
    }

    const assignment = await VolunteerAssignmentModel.create({
      volunteerId,
      assignmentTagId,
      projectTagId,
      shiftTagIds: isStringArray(shiftTagIds) ? shiftTagIds : [],
    });

    if (!assignment) {
      throw createError(500, "Failed to create volunteer assignment");
    }

    await assignment.populate(["assignmentTagId", "projectTagId", "shiftTagIds"]);

    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
};

export const updateVolunteerAssignment: RequestHandler = async (req, res, next) => {
  const assignmentId = req.params.id;
  const body: unknown = req.body;
  const record = (body ?? {}) as Record<string, unknown>;
  const assignmentTagId = record.assignmentTagId;
  const projectTagId = record.projectTagId;
  const shiftTagIds = record.shiftTagIds;
  const removeShiftTagIds = record.removeShiftTagIds;

  try {
    const update: Record<string, unknown> = {};
    if (isNonEmptyString(assignmentTagId)) update.assignmentTagId = assignmentTagId;
    if (isNonEmptyString(projectTagId)) update.projectTagId = projectTagId;
    if (shiftTagIds === undefined || shiftTagIds === null) {
      // leave untouched
    } else if (isStringArray(shiftTagIds)) {
      update.$addToSet = { shiftTagIds: { $each: shiftTagIds } };
    } else {
      throw createError(400, "shiftTagIds must be an array of strings");
    }

    if (removeShiftTagIds === undefined || removeShiftTagIds === null) {
      // leave untouched
    } else if (isStringArray(removeShiftTagIds)) {
      if (removeShiftTagIds.length > 0) {
        update.$pull = { shiftTagIds: { $in: removeShiftTagIds } };
      }
    } else {
      throw createError(400, "removeShiftTagIds must be an array of strings");
    }

    const assignment = await VolunteerAssignmentModel.findByIdAndUpdate(assignmentId, update, {
      returnDocument: "after",
    })
      .populate("assignmentTagId")
      .populate("projectTagId")
      .populate("shiftTagIds");

    if (!assignment) {
      throw createError(404, "Assignment not found");
    }

    res.status(200).json(assignment);
  } catch (err) {
    next(err);
  }
};

export const deleteVolunteerAssignment: RequestHandler = async (req, res, next) => {
  const assignmentId = req.params.id;

  try {
    const assignment = await VolunteerAssignmentModel.findByIdAndDelete(assignmentId);

    if (!assignment) {
      throw createError(404, "Assignment not found");
    }

    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (err) {
    next(err);
  }
};
