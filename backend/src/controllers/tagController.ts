import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Types } from "mongoose";

import ProjectProgramMapModel from "../models/projectProgramMapModel";
import TagModel from "../models/tagModel";
import VolunteerAssignmentModel from "../models/volunteerAssignmentModel";
import validationErrorParser from "../util/validationErrorParser";

import type { RequestHandler } from "express";
import type mongoose from "mongoose";
export const getTag: RequestHandler = async (req, res, next) => {
  const tagId = req.params.id;

  try {
    const tag = await TagModel.findById(tagId);

    if (!tag) {
      throw createHttpError(404, "Could not find tag");
    }

    res.status(200).json(tag);
  } catch (err) {
    next(err);
  }
};

export const getTags: RequestHandler = async (req, res, next) => {
  try {
    const { name, type } = req.query;
    const filter: Record<string, any> = {};

    if (typeof name === "string" && name.trim() !== "") {
      filter.name = { $regex: name, $options: "i" };
    }

    if (typeof type === "string" && type.trim() !== "") {
      filter.type = type;
    }

    const tags = await TagModel.find(filter);
    res.status(200).json(tags);
  } catch (err) {
    next(err); // Matches your other controllers
  }
};

export const getProjectProgramMaps: RequestHandler = async (req, res, next) => {
  try {
    const projectProgramMaps = await ProjectProgramMapModel.find()
      .populate("projectTagId")
      .populate("programTagId");

    res.status(200).json(projectProgramMaps);
  } catch (err) {
    next(err);
  }
};

type TagCreationBody = {
  name: string;
  color: string;
  type: "assignment" | "project" | "shift" | "program" | "group";
};

export const createTag: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const { name, color, type } = req.body as TagCreationBody;

  try {
    validationErrorParser(errors);

    const tag = await TagModel.findOne({ name, type });
    if (tag) {
      throw createHttpError(409, "Tag with this name and type already exists");
    }

    const newTag = await TagModel.create({
      name,
      color,
      type,
    });
    res.status(201).json(newTag);
  } catch (err) {
    next(err);
  }
};

type TagUpdateBody = {
  name: string;
  color: string;
};

export const updateTag: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const tagId = req.params.id;
  const { name, color } = req.body as TagUpdateBody;

  try {
    validationErrorParser(errors);

    const tag = await TagModel.findById(tagId);
    if (!tag) {
      throw createHttpError(404, "Could not find tag");
    }

    const duplicateTag = await TagModel.findOne({
      _id: { $ne: tagId },
      name,
      type: tag.type,
    });
    if (duplicateTag) {
      throw createHttpError(409, "Tag with this name and type already exists");
    }

    tag.name = name;
    tag.color = color;
    await tag.save();

    res.status(200).json(tag);
  } catch (err) {
    next(err);
  }
};

export const deleteTag: RequestHandler = async (req, res, next) => {
  const rawTagId = req.params.id as string | string[];
  const tagId = Array.isArray(rawTagId) ? rawTagId[0] : rawTagId;

  try {
    const tagObjectId = new Types.ObjectId(tagId);
    const tag = await TagModel.findById(tagId);

    if (!tag) {
      throw createHttpError(404, "Could not find tag");
    }

    const shiftTagFilter: mongoose.QueryFilter<Record<string, unknown>> = {
      shiftTagIds: { $in: [tagObjectId] },
    };
    const shiftTagUpdate: mongoose.UpdateQuery<Record<string, unknown>> = {
      $pull: { shiftTagIds: tagObjectId },
    };

    await VolunteerAssignmentModel.updateMany(shiftTagFilter, shiftTagUpdate);
    await VolunteerAssignmentModel.deleteMany({
      $or: [{ assignmentTagId: tagId }, { projectTagId: tagId }],
    });
    await ProjectProgramMapModel.deleteMany({
      $or: [{ projectTagId: tagId }, { programTagId: tagId }],
    });

    await TagModel.findByIdAndDelete(tagId);

    res.status(200).send();
  } catch (err) {
    next(err);
  }
};
