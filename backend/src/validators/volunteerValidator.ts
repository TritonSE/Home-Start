import { body, param } from "express-validator";

const makeParamIDValidator = () =>
  param("id")
    .exists()
    .withMessage("_id is required")
    .bail()
    .isMongoId()
    .withMessage("_id must be a MongoDB object ID");

const makeFirstNameValidator = () =>
  body("firstName")
    .exists()
    .withMessage("name is required")
    .bail()
    .isString()
    .withMessage("name must be a string")
    .bail()
    .notEmpty()
    .withMessage("name cannot be empty")
    .bail();

const makeLastNameValidator = () =>
  body("lastName")
    .exists()
    .withMessage("name is required")
    .bail()
    .isString()
    .withMessage("name must be a string")
    .bail()
    .notEmpty()
    .withMessage("name cannot be empty")
    .bail();

const makeEmailValidator = () =>
  body("email")
    .exists()
    .withMessage("email is required")
    .bail()
    .isEmail()
    .withMessage("email must be a valid email address");

const makePhoneValidator = () =>
  body("phoneNumber")
    .exists()
    .withMessage("phone is required")
    .bail() // What kind of phone number do we want to enforce?
    .isMobilePhone("any")
    .withMessage("phoneNumber must be a valid mobile phone number");

const tagsValidator = () => body("tags").optional().isArray();

export const createVolunteerValidator = [
  makeFirstNameValidator(),
  makeLastNameValidator(),
  makeEmailValidator(),
  makePhoneValidator(),
  tagsValidator(),
];

export const updateVolunteerContactValidator = [
  makeParamIDValidator(),
  makeEmailValidator(),
  makePhoneValidator(),
];

export const assignVolunteerTagsValidator = [makeParamIDValidator(), tagsValidator()];

export const removeVolunteerTagsValidator = [makeParamIDValidator(), tagsValidator()];
