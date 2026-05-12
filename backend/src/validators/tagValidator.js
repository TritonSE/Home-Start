"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTagValidator = void 0;
const express_validator_1 = require("express-validator");
const makeNameValidator = () =>
  (0, express_validator_1.body)("name")
    .exists()
    .withMessage("name is required")
    .bail()
    .isString()
    .withMessage("name must be a string")
    .bail()
    .notEmpty()
    .withMessage("name cannot be empty")
    .bail();
const makeColorValidator = () =>
  (0, express_validator_1.body)("color")
    .exists()
    .withMessage("color is required")
    .bail()
    .isHexColor()
    .withMessage("color must be a valid hex color")
    .bail();
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
    .bail()
    .isIn(["assignment", "project", "shift", "program"])
    .withMessage("type must be one of assignment, project, shift, or program")
    .bail();
exports.createTagValidator = [makeNameValidator(), makeColorValidator(), makeTypeValidator()];
