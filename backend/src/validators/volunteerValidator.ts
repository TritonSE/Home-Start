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
    .bail()
    .custom((value: string) => {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length !== 10) {
        throw new Error("phoneNumber must be a valid phone number");
      }
      return true;
    });

const tagsValidator = () => body("tags").optional().isArray();
const statusTagsValidator = () => body("statusTags").optional().isArray();
const volunteerTypeTagsValidator = () => body("volunteerTypeTags").optional().isArray();
const eventsValidator = () => body("events").optional().isArray();
const additionalNotesValidator = () => body("additionalNotes").optional().isString();

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
