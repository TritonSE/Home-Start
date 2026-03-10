import { body, param } from "express-validator";

const makeParamIDValidator = () =>
  param("id")
    .exists()
    .withMessage("_id is required")
    .bail()
    .isMongoId()
    .withMessage("_id must be a MongoDB object ID");

const makeFirstNameValidator = (path = "firstName") =>
  body(path)
    .exists()
    .withMessage("first name is required")
    .bail()
    .isString()
    .withMessage("first name must be a string")
    .bail()
    .notEmpty()
    .withMessage("first name cannot be empty")
    .bail();

const makeLastNameValidator = (path = "lastName") =>
  body(path)
    .exists()
    .withMessage("last name is required")
    .bail()
    .isString()
    .withMessage("last name must be a string")
    .bail()
    .notEmpty()
    .withMessage("last name cannot be empty")
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
    .bail()
    .custom((value: string) => {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length !== 10) {
        throw new Error("phoneNumber must be a valid phone number");
      }
      return true;
    })
    .customSanitizer((value: string) => value.replace(/\D/g, ""));

const tagsValidator = () => body("tags").optional().isArray();
const statusTagsValidator = () => body("statusTags").optional().isArray();
const volunteerTypeTagsValidator = () => body("volunteerTypeTags").optional().isArray();
const eventsValidator = () => body("events").optional().isArray();
const additionalNotesValidator = () => body("additionalNotes").optional().isString();

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
  statusTagsValidator(),
  volunteerTypeTagsValidator(),
  eventsValidator(),
  additionalNotesValidator(),
];

export const updateVolunteerValidator = [
  makeParamIDValidator(),
  makeFirstNameValidator(),
  makeLastNameValidator(),
  makeEmailValidator(),
  makePhoneValidator(),
  tagsValidator(),
  statusTagsValidator(),
  volunteerTypeTagsValidator(),
  eventsValidator(),
  additionalNotesValidator(),
];

export const updateVolunteerContactValidator = [
  makeParamIDValidator(),
  makeEmailValidator(),
  makePhoneValidator(),
];

export const assignVolunteerTagsValidator = [makeParamIDValidator(), tagsValidator()];

export const removeVolunteerTagsValidator = [makeParamIDValidator(), tagsValidator()];
