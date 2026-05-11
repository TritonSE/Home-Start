import { body, param, query } from "express-validator";

const makeParamIDValidator = () =>
  param("id")
    .exists()
    .withMessage("_id is required")
    .bail()
    .isMongoId()
    .withMessage("_id must be a MongoDB object ID");

const makePageValidator = () =>
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer");

const makeLimitValidator = () =>
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be an integer between 1 and 100");

const makeQueryTypeValidator = () =>
  query("type")
    .optional()
    .isIn(["text", "email"])
    .withMessage("type must be either 'text' or 'email'");

const makeQueryStatusValidator = () =>
  query("status")
    .optional()
    .isIn(["sent", "pending"])
    .withMessage("status must be either 'sent' or 'pending'");

const makeQueryRecipientValidator = () =>
  query("recipient").optional().isMongoId().withMessage("recipient must be a MongoDB object ID");

const makeRecipientsValidator = () =>
  body("recipients")
    .exists()
    .withMessage("recipients is required")
    .bail()
    .isArray({ min: 1 })
    .withMessage("recipients must be a non-empty array")
    .bail();

const makeRecipientIdsValidator = () =>
  body("recipients.*").isMongoId().withMessage("each recipient must be a MongoDB object ID");

const makeTypeValidator = () =>
  body("type")
    .exists()
    .withMessage("type is required")
    .bail()
    .isString()
    .withMessage("type must be a string")
    .bail()
    .isIn(["text", "email"])
    .withMessage("type must be either 'text' or 'email'");

const makeSubjectValidator = () =>
  body("subject")
    .if(body("type").equals("email"))
    .exists()
    .withMessage("subject is required for email messages")
    .bail()
    .isString()
    .withMessage("subject must be a string")
    .bail()
    .notEmpty()
    .withMessage("subject cannot be empty");

const makeBodyValidator = () =>
  body("body")
    .exists()
    .withMessage("body is required")
    .bail()
    .isString()
    .withMessage("body must be a string")
    .bail()
    .notEmpty()
    .withMessage("body cannot be empty");

const makeStatusValidator = () =>
  body("status")
    .optional()
    .isString()
    .withMessage("status must be a string")
    .bail()
    .isIn(["sent", "pending"])
    .withMessage("status must be either 'sent' or 'pending'");

export const getMessagesValidator = [
  makePageValidator(),
  makeLimitValidator(),
  makeQueryTypeValidator(),
  makeQueryStatusValidator(),
  makeQueryRecipientValidator(),
];

export const getMessageValidator = [makeParamIDValidator()];

export const createMessageValidator = [
  makeRecipientsValidator(),
  makeRecipientIdsValidator(),
  makeTypeValidator(),
  makeSubjectValidator(),
  makeBodyValidator(),
  makeStatusValidator(),
];
