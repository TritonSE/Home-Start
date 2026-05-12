"use strict";
const __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTemplate =
  exports.updateTemplate =
  exports.createTemplate =
  exports.getTemplates =
  exports.getTemplate =
    void 0;
const express_validator_1 = require("express-validator");
const templateModel_1 = __importDefault(require("../models/templateModel"));
const validationErrorParser_1 = __importDefault(require("../util/validationErrorParser"));
const getTemplate = async (req, res, next) => {
  const templateId = req.params.id;
  try {
    const template = await templateModel_1.default.findById(templateId);
    if (!template) {
      return res.status(404).json({ error: "Could not find template" });
    }
    res.status(200).json(template);
  } catch (err) {
    next(err);
  }
};
exports.getTemplate = getTemplate;
const getTemplates = async (req, res, next) => {
  try {
    const templates = await templateModel_1.default.find();
    res.status(200).json(templates);
  } catch (err) {
    next(err);
  }
};
exports.getTemplates = getTemplates;
const createTemplate = async (req, res, next) => {
  const errors = (0, express_validator_1.validationResult)(req);
  const { title, message, type, subject } = req.body;
  try {
    (0, validationErrorParser_1.default)(errors);
    if (type === "email" && !subject) {
      return res.status(400).json({ error: "Email template requires subject" });
    }
    const template = await templateModel_1.default.findOne({ title });
    if (template) {
      return res.status(409).json({ error: "Template with this title aleady exists" });
    }
    const newTemplate = await templateModel_1.default.create({
      title,
      message,
      type,
      subject,
    });
    res.status(201).json(newTemplate);
  } catch (err) {
    next(err);
  }
};
exports.createTemplate = createTemplate;
const updateTemplate = async (req, res, next) => {
  const errors = (0, express_validator_1.validationResult)(req);
  const templateId = req.params.id;
  const { title, message, type, subject } = req.body;
  try {
    (0, validationErrorParser_1.default)(errors);
    if (type === "email" && !subject) {
      return res.status(400).json({ error: "Email template requires subject" });
    }
    const template = await templateModel_1.default.findByIdAndUpdate(templateId, {
      title,
      message,
      type,
      subject,
    });
    if (!template) {
      return res.status(404).json({ error: "Could not find template" });
    }
    res.status(200).json(template);
  } catch (err) {
    next(err);
  }
};
exports.updateTemplate = updateTemplate;
const deleteTemplate = async (req, res, next) => {
  const templateId = req.params.id;
  try {
    const template = await templateModel_1.default.findByIdAndDelete(templateId);
    if (!template) {
      return res.status(404).json({ error: "Could not find template" });
    }
    res.status(200).json({ message: "Template deleted successfully" });
  } catch (err) {
    next(err);
  }
};
exports.deleteTemplate = deleteTemplate;
