import { body } from "express-validator";

const makeNameValidator = () =>
  body("name")
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
  body("color")
    .exists()
    .withMessage("color is required")
    .bail()
    .isHexColor()
    .withMessage("color must be a valid hex color")
    .bail();

const makeTypeValidator = () =>
  body("type")
    .exists()
    .withMessage("type is required")
    .bail()
    .isString()
    .withMessage("type must be a string")
    .bail()
    .notEmpty()
    .withMessage("type cannot be empty")
    .bail();

export const createTagValidator = [makeNameValidator(), makeColorValidator(), makeTypeValidator()];
