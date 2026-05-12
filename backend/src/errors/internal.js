"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalError = void 0;
const errors_1 = require("./errors");
const NO_APP_PORT = "Could not find app port env variable";
const NO_FRONTEND_ORIGIN = "Could not find frontend origin env variable";
const NO_DATABASE_URL = "Could not find DATABASE_URL env variable";
const NO_FIREBASE_SERVICE_ACCOUNT = "FIREBASE_SERVICE_ACCOUNT is not defined in .env";
class InternalError extends errors_1.CustomError {}
exports.InternalError = InternalError;
InternalError.NO_APP_PORT = new InternalError(0, 500, NO_APP_PORT);
InternalError.NO_FRONTEND_ORIGIN = new InternalError(0, 500, NO_FRONTEND_ORIGIN);
InternalError.NO_DATABASE_URL = new InternalError(0, 500, NO_DATABASE_URL);
InternalError.NO_FIREBASE_SERVICE_ACCOUNT = new InternalError(0, 500, NO_FIREBASE_SERVICE_ACCOUNT);
