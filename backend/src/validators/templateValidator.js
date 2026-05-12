"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTemplateValidator = void 0;
const express_validator_1 = require("express-validator");
const makeTitleValidator = () =>
  (0, express_validator_1.body)("title")
    .exists()
    .withMessage("title is required")
    .bail()
    .isString()
    .withMessage("title must be a string")
    .bail()
    .notEmpty()
    .withMessage("title cannot be empty")
    .bail();
const makeBodyValidator = () =>
  (0, express_validator_1.body)("message")
    .exists()
    .withMessage("message is required")
    .bail()
    .isString()
    .withMessage("message must be a string");
const makeTypeValidator = () =>
  (0, express_validator_1.body)("type")
    .exists()
    .withMessage("type is required")
    .bail()
    .isString()
    .withMessage("type must be a string")
    .bail()
    .notEmpty()
    .withMessage("type cannot be empty")
    .bail();
const makeSubjectValidator = () =>
  (0, express_validator_1.body)("subject")
    .if((0, express_validator_1.body)("type").equals("email"))
    .exists()
    .withMessage("subject is required for email templates")
    .bail()
    .isString()
    .withMessage("subject must be a string");
exports.createTemplateValidator = [
  makeTitleValidator(),
  makeBodyValidator(),
  makeTypeValidator(),
  makeSubjectValidator(),
];
