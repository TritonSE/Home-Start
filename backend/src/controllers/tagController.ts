import { validationResult } from "express-validator";
import createHttpError from "http-errors";

import TagModel from "../models/tagModel";
import VolunteerModel from "../models/volunteerModel";
import validationErrorParser from "../util/validationErrorParser";

import type { RequestHandler } from "express";
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
    const tags = await TagModel.find();
    res.status(200).json(tags);
  } catch (err) {
    next(err);
  }
};

type TagCreationBody = {
  name: string;
  color: string;
  type: string;
};

export const createTag: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const { name, color, type } = req.body as TagCreationBody;

  try {
    validationErrorParser(errors);

    const tag = await TagModel.findOne({ name });
    if (tag) {
      throw createHttpError(409, "Tag with this name already exists");
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

export const deleteTag: RequestHandler = async (req, res, next) => {
  const tagId = req.params.id;

  try {
    const tag = await TagModel.findById(tagId);

    if (!tag) {
      throw createHttpError(404, "Could not find tag");
    }

    await VolunteerModel.updateMany({ tags: tagId }, { $pull: { tags: tagId } });

    await TagModel.findByIdAndDelete(tagId);

    res.status(200).json({ message: "Tag deleted successfully" });
  } catch (err) {
    next(err);
  }
};
