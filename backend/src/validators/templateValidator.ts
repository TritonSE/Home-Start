import { body } from "express-validator";

const makeTitleValidator = () =>
  body("title")
    .exists()
    .withMessage("title is required")
    .bail()
    .isString()
    .withMessage("title must be a string")
    .bail()
    .notEmpty()
    .withMessage("title cannot be empty")
    .bail();

const makeBodyValidator = () => {
  body("message")
    .exists()
    .withMessage("message is required")
    .bail()
    .isString()
    .withMessage("message must be a string");
};

const makeTypeValidator = () => {
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
};

const makeSubjectValidator = () => {
  body("subject")
    .if(body("type").equals("email"))
    .exists()
    .withMessage("subject is required for email templates")
    .bail()
    .isString()
    .withMessage("subject must be a string");
};

export const createTemplateValidator = [
  makeTitleValidator,
  makeBodyValidator,
  makeTypeValidator,
  makeSubjectValidator,
];
