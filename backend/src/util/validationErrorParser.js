"use strict";
const __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
/**
 * Parses through errors thrown by validator (if any exist). Error messages are
 * added to a string and that string is used as the error message for the HTTP
 * error.
 *
 * @param errors the validation result provided by express validator middleware
 */
const validationErrorParser = (errors) => {
  if (!errors.isEmpty()) {
    let errorString = "";
    // parse through errors returned by the validator and append them to the error string
    for (const error of errors.array()) {
      errorString += `${error.msg} `;
    }
    // trim removes the trailing space created in the for loop
    throw (0, http_errors_1.default)(400, errorString.trim());
  }
};
exports.default = validationErrorParser;
