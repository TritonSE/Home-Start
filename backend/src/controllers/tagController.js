"use strict";
const __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTag =
  exports.createTag =
  exports.getProjectProgramMaps =
  exports.getTags =
  exports.getTag =
    void 0;
const express_validator_1 = require("express-validator");
const http_errors_1 = __importDefault(require("http-errors"));
const projectProgramMapModel_1 = __importDefault(require("../models/projectProgramMapModel"));
const tagModel_1 = __importDefault(require("../models/tagModel"));
const volunteerAssignmentModel_1 = __importDefault(require("../models/volunteerAssignmentModel"));
const validationErrorParser_1 = __importDefault(require("../util/validationErrorParser"));
const getTag = async (req, res, next) => {
  const tagId = req.params.id;
  try {
    const tag = await tagModel_1.default.findById(tagId);
    if (!tag) {
      throw (0, http_errors_1.default)(404, "Could not find tag");
    }
    res.status(200).json(tag);
  } catch (err) {
    next(err);
  }
};
exports.getTag = getTag;
const getTags = async (req, res, next) => {
  try {
    const tags = await tagModel_1.default.find();
    res.status(200).json(tags);
  } catch (err) {
    next(err);
  }
};
exports.getTags = getTags;
const getProjectProgramMaps = async (req, res, next) => {
  try {
    const projectProgramMaps = await projectProgramMapModel_1.default
      .find()
      .populate("projectTagId")
      .populate("programTagId");
    res.status(200).json(projectProgramMaps);
  } catch (err) {
    next(err);
  }
};
exports.getProjectProgramMaps = getProjectProgramMaps;
const createTag = async (req, res, next) => {
  const errors = (0, express_validator_1.validationResult)(req);
  const { name, color, type } = req.body;
  try {
    (0, validationErrorParser_1.default)(errors);
    const tag = await tagModel_1.default.findOne({ name });
    if (tag) {
      throw (0, http_errors_1.default)(409, "Tag with this name already exists");
    }
    const newTag = await tagModel_1.default.create({
      name,
      color,
      type,
    });
    res.status(201).json(newTag);
  } catch (err) {
    next(err);
  }
};
exports.createTag = createTag;
const deleteTag = async (req, res, next) => {
  const tagId = req.params.id;
  try {
    const tag = await tagModel_1.default.findById(tagId);
    if (!tag) {
      throw (0, http_errors_1.default)(404, "Could not find tag");
    }
    await volunteerAssignmentModel_1.default.updateMany(
      { shiftTagIds: tagId },
      { $pull: { shiftTagIds: tagId } },
    );
    await volunteerAssignmentModel_1.default.deleteMany({
      $or: [{ assignmentTagId: tagId }, { projectTagId: tagId }],
    });
    await projectProgramMapModel_1.default.deleteMany({
      $or: [{ projectTagId: tagId }, { programTagId: tagId }],
    });
    await tagModel_1.default.findByIdAndDelete(tagId);
    res.status(200).json({ message: "Tag deleted successfully" });
  } catch (err) {
    next(err);
  }
};
exports.deleteTag = deleteTag;
