import { validationResult } from "express-validator";

import TemplateModel from "../models/templateModel";
import validationErrorParser from "../util/validationErrorParser";

import type { RequestHandler } from "express";

export const getTemplate: RequestHandler = async (req, res, next) => {
  const templateId = req.params.id;

  try {
    const template = await TemplateModel.findById(templateId);
    if (!template) {
      return res.status(404).json({ error: "Could not find template" });
    }

    res.status(200).json(template);
  } catch (err) {
    next(err);
  }
};

export const getTemplates: RequestHandler = async (req, res, next) => {
  try {
    const templates = await TemplateModel.find();
    res.status(200).json(templates);
  } catch (err) {
    next(err);
  }
};

type TemplateCreationBody = {
  title: string;
  message: string;
  type: "text" | "email";
  subject?: string;
};

export const createTemplate: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const { title, message, type, subject } = req.body as TemplateCreationBody;

  try {
    validationErrorParser(errors);

    if (type === "email" && !subject) {
      return res.status(400).json({ error: "Email template requires subject" });
    }

    const template = await TemplateModel.findOne({ title });
    if (template) {
      return res.status(409).json({ error: "Template with this title aleady exists" });
    }

    const newTemplate = await TemplateModel.create({
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

export const updateTemplate: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const templateId = req.params.id;
  const { title, message, type, subject } = req.body as TemplateCreationBody;

  try {
    validationErrorParser(errors);

    if (type === "email" && !subject) {
      return res.status(400).json({ error: "Email template requires subject" });
    }

    const template = await TemplateModel.findByIdAndUpdate(templateId, {
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

export const deleteTemplate: RequestHandler = async (req, res, next) => {
  const templateId = req.params.id;

  try {
    const template = await TemplateModel.findByIdAndDelete(templateId);
    if (!template) {
      return res.status(404).json({ error: "Could not find template" });
    }
    res.status(200).json({ message: "Template deleted successfully" });
  } catch (err) {
    next(err);
  }
};
