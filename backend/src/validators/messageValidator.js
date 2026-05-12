"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessageValidator =
  exports.getMessageValidator =
  exports.getMessagesValidator =
    void 0;
const express_validator_1 = require("express-validator");
const makeParamIDValidator = () =>
  (0, express_validator_1.param)("id")
    .exists()
    .withMessage("_id is required")
    .bail()
    .isMongoId()
    .withMessage("_id must be a MongoDB object ID");
const makePageValidator = () =>
  (0, express_validator_1.query)("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer");
const makeLimitValidator = () =>
  (0, express_validator_1.query)("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be an integer between 1 and 100");
const makeQueryTypeValidator = () =>
  (0, express_validator_1.query)("type")
    .optional()
    .isIn(["text", "email"])
    .withMessage("type must be either 'text' or 'email'");
const makeQueryStatusValidator = () =>
  (0, express_validator_1.query)("status")
    .optional()
    .isIn(["sent", "pending"])
    .withMessage("status must be either 'sent' or 'pending'");
const makeQueryRecipientValidator = () =>
  (0, express_validator_1.query)("recipient")
    .optional()
    .isMongoId()
    .withMessage("recipient must be a MongoDB object ID");
const makeRecipientsValidator = () =>
  (0, express_validator_1.body)("recipients")
    .exists()
    .withMessage("recipients is required")
    .bail()
    .isArray({ min: 1 })
    .withMessage("recipients must be a non-empty array")
    .bail();
const makeRecipientIdsValidator = () =>
  (0, express_validator_1.body)("recipients.*")
    .isMongoId()
    .withMessage("each recipient must be a MongoDB object ID");
const makeTypeValidator = () =>
  (0, express_validator_1.body)("type")
    .exists()
    .withMessage("type is required")
    .bail()
    .isString()
    .withMessage("type must be a string")
    .bail()
    .isIn(["text", "email"])
    .withMessage("type must be either 'text' or 'email'");
const makeSubjectValidator = () =>
  (0, express_validator_1.body)("subject")
    .if((0, express_validator_1.body)("type").equals("email"))
    .exists()
    .withMessage("subject is required for email messages")
    .bail()
    .isString()
    .withMessage("subject must be a string")
    .bail()
    .notEmpty()
    .withMessage("subject cannot be empty");
const makeBodyValidator = () =>
  (0, express_validator_1.body)("body")
    .exists()
    .withMessage("body is required")
    .bail()
    .isString()
    .withMessage("body must be a string")
    .bail()
    .notEmpty()
    .withMessage("body cannot be empty");
const makeStatusValidator = () =>
  (0, express_validator_1.body)("status")
    .optional()
    .isString()
    .withMessage("status must be a string")
    .bail()
    .isIn(["sent", "pending"])
    .withMessage("status must be either 'sent' or 'pending'");
exports.getMessagesValidator = [
  makePageValidator(),
  makeLimitValidator(),
  makeQueryTypeValidator(),
  makeQueryStatusValidator(),
  makeQueryRecipientValidator(),
];
exports.getMessageValidator = [makeParamIDValidator()];
exports.createMessageValidator = [
  makeRecipientsValidator(),
  makeRecipientIdsValidator(),
  makeTypeValidator(),
  makeSubjectValidator(),
  makeBodyValidator(),
  makeStatusValidator(),
];
