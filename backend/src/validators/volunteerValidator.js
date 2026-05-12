"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeVolunteerTagsValidator =
  exports.assignVolunteerTagsValidator =
  exports.updateVolunteerContactValidator =
  exports.updateVolunteerValidator =
  exports.createVolunteerValidator =
  exports.batchCreateVolunteerValidator =
    void 0;
const express_validator_1 = require("express-validator");
const makeParamIDValidator = () =>
  (0, express_validator_1.param)("id")
    .exists()
    .withMessage("_id is required")
    .bail()
    .isMongoId()
    .withMessage("_id must be a MongoDB object ID");
const makeFirstNameValidator = (path = "firstName") =>
  (0, express_validator_1.body)(path)
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
  (0, express_validator_1.body)(path)
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
  (0, express_validator_1.body)(path)
    .exists()
    .withMessage("email is required")
    .bail()
    .isEmail()
    .withMessage("email must be a valid email address");
const makePhoneValidator = (path = "phoneNumber") =>
  (0, express_validator_1.body)(path)
    .exists()
    .withMessage("phone is required")
    .bail()
    .custom((value) => {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length !== 10) {
        throw new Error("phoneNumber must be a valid phone number");
      }
      return true;
    })
    .customSanitizer((value) => value.replace(/\D/g, ""));
/*
 * makeStatusValidator is not currently used, but we may want to add a route in the future
const makeStatusValidator = (path = "status") =>
  body(path)
    .optional()
    .isString()
    .withMessage("status must be a string")
    .bail()
    .isIn(["returning", "new"])
    .withMessage("status must be either 'returning' or 'new'");
*/
const tagsValidator = () => (0, express_validator_1.body)("tags").optional().isArray();
const statusValidator = () =>
  (0, express_validator_1.body)("status").optional().isIn(["new", "returning"]);
const volunteerTypeTagsValidator = () =>
  (0, express_validator_1.body)("volunteerTypeTags").optional().isArray();
const eventsValidator = () => (0, express_validator_1.body)("events").optional().isArray();
const additionalNotesValidator = () =>
  (0, express_validator_1.body)("additionalNotes").optional().isString();
const batchUploadVolunteersValidator = () =>
  (0, express_validator_1.body)("volunteers")
    .exists()
    .withMessage("volunteers is required")
    .bail()
    .isArray()
    .withMessage("volunteers must be an array")
    .bail();
exports.batchCreateVolunteerValidator = [
  batchUploadVolunteersValidator(),
  makeFirstNameValidator("volunteers.*.firstName"),
  makeLastNameValidator("volunteers.*.lastName"),
  makeEmailValidator("volunteers.*.email"),
  makePhoneValidator("volunteers.*.phoneNumber"),
];
exports.createVolunteerValidator = [
  makeFirstNameValidator(),
  makeLastNameValidator(),
  makeEmailValidator(),
  makePhoneValidator(),
  tagsValidator(),
  statusValidator(),
  volunteerTypeTagsValidator(),
  eventsValidator(),
  additionalNotesValidator(),
];
exports.updateVolunteerValidator = [
  makeParamIDValidator(),
  makeFirstNameValidator(),
  makeLastNameValidator(),
  makeEmailValidator(),
  makePhoneValidator(),
  tagsValidator(),
  statusValidator(),
  volunteerTypeTagsValidator(),
  eventsValidator(),
  additionalNotesValidator(),
];
exports.updateVolunteerContactValidator = [
  makeParamIDValidator(),
  makeEmailValidator(),
  makePhoneValidator(),
];
exports.assignVolunteerTagsValidator = [makeParamIDValidator(), tagsValidator()];
exports.removeVolunteerTagsValidator = [makeParamIDValidator(), tagsValidator()];
