import { body, param } from "express-validator";

const makeParamIDValidator = () =>
  param("id")
    .exists()
    .withMessage("_id is required")
    .bail()
    .isMongoId()
    .withMessage("_id must be a MongoDB object ID");

// const makeBodyIDValidator = () =>
//   body("_id")
//     .exists()
//     .withMessage("_id is required")
//     .bail()
//     .isMongoId()
//     .withMessage("_id must be a MongoDB object ID");

const makeFirstNameValidator = (path = "firstName") =>
  body(path)
    .exists()
    .withMessage("name is required")
    .bail()
    .isString()
    .withMessage("name must be a string")
    .bail()
    .notEmpty()
    .withMessage("name cannot be empty")
    .bail();

const makeLastNameValidator = (path = "lastName") =>
  body(path)
    .exists()
    .withMessage("name is required")
    .bail()
    .isString()
    .withMessage("name must be a string")
    .bail()
    .notEmpty()
    .withMessage("name cannot be empty")
    .bail();

const makeEmailValidator = (path = "email") =>
  body(path)
    .exists()
    .withMessage("email is required")
    .bail()
    .isEmail()
    .withMessage("email must be a valid email address");

const makePhoneValidator = (path = "phoneNumber") =>
  body(path)
    .exists()
    .withMessage("phone is required")
    .bail() // What kind of phone number do we want to enforce?
    .isMobilePhone("any")
    .withMessage("phoneNumber must be a valid mobile phone number")
    .customSanitizer((value: string) => value.replace(/\D/g, ""));

const tagsValidator = () => body("tags").optional().isArray();

const batchUploadVolunteersValidator = () =>
  body("volunteers")
    .exists()
    .withMessage("volunteers is required")
    .bail()
    .isArray()
    .withMessage("volunteers must be an array")
    .bail();

export const batchCreateVolunteerValidator = [
  batchUploadVolunteersValidator(),
  makeFirstNameValidator("volunteers.*.firstName"),
  makeLastNameValidator("volunteers.*.lastName"),
  makeEmailValidator("volunteers.*.email"),
  makePhoneValidator("volunteers.*.phoneNumber"),
];

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
