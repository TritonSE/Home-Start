import createError from "http-errors";

import VolunteerAssignmentModel from "../models/volunteerAssignmentModel";

import type { RequestHandler } from "express";

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
  const { volunteerId, assignmentTagId, projectTagId, shiftTagIds } = req.body;

  try {
    if (!volunteerId || !assignmentTagId || !projectTagId) {
      throw createError(400, "Missing required fields: volunteerId, assignmentTagId, projectTagId");
    }

    const assignment = await VolunteerAssignmentModel.create({
      volunteerId,
      assignmentTagId,
      projectTagId,
      shiftTagIds: shiftTagIds || [],
    });

    await assignment.populate(["assignmentTagId", "projectTagId", "shiftTagIds"]);

    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
};

export const updateVolunteerAssignment: RequestHandler = async (req, res, next) => {
  const assignmentId = req.params.id;
  const { assignmentTagId, projectTagId, shiftTagIds } = req.body;

  try {
    const assignment = await VolunteerAssignmentModel.findByIdAndUpdate(
      assignmentId,
      {
        assignmentTagId,
        projectTagId,
        shiftTagIds,
      },
      { new: true },
    )
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
