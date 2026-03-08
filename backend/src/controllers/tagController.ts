import { validationResult } from "express-validator";

import TagModel from "../models/tagModel";
import validationErrorParser from "../util/validationErrorParser";

import type { RequestHandler } from "express";

export const getTag: RequestHandler = async (req, res, next) => {
  const tagId = req.params.id;

  try {
    const tag = await TagModel.findById(tagId);

    if (!tag) {
      return res.status(404).json({ error: "Could not find tag" });
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
export const getEventTags: RequestHandler = async (req, res, next) => {
  try {
    const eventTags = await TagModel.find({ type: "Event" }).select("name -_id");
    const tagNames = eventTags.map((tag) => tag.name);
    res.status(200).json(tagNames);
  } catch (err) {
    next(err);
  }
};

export const createTag: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const { name, color, type } = req.body as TagCreationBody;

  try {
    validationErrorParser(errors);

    const tag = await TagModel.findOne({ name });
    if (tag) {
      return res.status(409).json({ error: "Tag with this name already exists" });
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
    const tag = await TagModel.findByIdAndDelete(tagId);
    if (!tag) {
      return res.status(404).json({ error: "Could not find tag" });
    }
    res.status(200).json({ message: "Tag deleted successfully" });
  } catch (err) {
    next(err);
  }
};
