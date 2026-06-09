import { body, param } from "express-validator";

const makeParamIDValidator = () =>
  param("id")
    .exists()
    .withMessage("_id is required")
    .bail()
    .isMongoId()
    .withMessage("_id must be a MongoDB object ID");

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

const tagsValidator = () => body("tags").optional().isArray();
const statusValidator = () => body("status").optional().isIn(["new", "returning"]);
const volunteerTypeTagsValidator = () => body("volunteerTypeTags").optional().isArray();
const eventsValidator = () => body("events").optional().isArray();
const additionalNotesValidator = () => body("additionalNotes").optional().isString();

const isValidEmail = (value: string) => {
  const atIndex = value.indexOf("@");
  const lastAtIndex = value.lastIndexOf("@");
  const dotAfterAtIndex = value.indexOf(".", atIndex + 2);
  return (
    atIndex > 0 &&
    atIndex === lastAtIndex &&
    dotAfterAtIndex > atIndex + 1 &&
    dotAfterAtIndex < value.length - 1 &&
    !value.includes(" ")
  );
};

const hasValidNameAndContact = (volunteer: unknown, requireName: boolean) => {
  const row = volunteer as {
    firstName?: unknown;
    lastName?: unknown;
    email?: unknown;
    phoneNumber?: unknown;
  };
  const firstName = typeof row.firstName === "string" ? row.firstName.trim() : "";
  const lastName = typeof row.lastName === "string" ? row.lastName.trim() : "";
  const email = typeof row.email === "string" ? row.email.trim() : "";
  const phoneNumber = typeof row.phoneNumber === "string" ? row.phoneNumber : "";
  const digitsOnly = phoneNumber.replace(/\D/g, "");

  if (requireName && !firstName && !lastName) {
    throw new Error("volunteer must have at least a first name or last name");
  }
  if (!email && !digitsOnly) {
    throw new Error("volunteer must have at least an email or phone number");
  }
  if (email && !isValidEmail(email)) {
    throw new Error("email must be a valid email address");
  }
  if (digitsOnly && digitsOnly.length !== 10) {
    throw new Error("phoneNumber must be a valid phone number");
  }

  row.phoneNumber = digitsOnly;
  return true;
};

const nameAndContactValidator = () =>
  body().custom((volunteer) => hasValidNameAndContact(volunteer, true));

const contactValidator = () =>
  body().custom((volunteer) => hasValidNameAndContact(volunteer, false));

const batchUploadVolunteersValidator = () =>
  body("volunteers")
    .exists()
    .withMessage("volunteers is required")
    .bail()
    .isArray()
    .withMessage("volunteers must be an array")
    .bail();

const batchVolunteerNameAndContactValidator = () =>
  body("volunteers.*").custom((volunteer: unknown) => hasValidNameAndContact(volunteer, true));

export const batchCreateVolunteerValidator = [
  batchUploadVolunteersValidator(),
  batchVolunteerNameAndContactValidator(),
];

export const createVolunteerValidator = [
  nameAndContactValidator(),
  tagsValidator(),
  statusValidator(),
  volunteerTypeTagsValidator(),
  eventsValidator(),
  additionalNotesValidator(),
];

export const updateVolunteerValidator = [
  makeParamIDValidator(),
  nameAndContactValidator(),
  tagsValidator(),
  statusValidator(),
  volunteerTypeTagsValidator(),
  eventsValidator(),
  additionalNotesValidator(),
];

export const updateVolunteerContactValidator = [makeParamIDValidator(), contactValidator()];

export const assignVolunteerTagsValidator = [makeParamIDValidator(), tagsValidator()];

export const removeVolunteerTagsValidator = [makeParamIDValidator(), tagsValidator()];
