"use strict";
const __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceAccountJson = exports.port = exports.frontend_origin = exports.database_url = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const errors_1 = require("./errors");
// Retrieve .env variables
dotenv_1.default.config({ quiet: true });
if (!process.env.PORT) throw errors_1.InternalError.NO_APP_PORT;
const port = process.env.PORT;
exports.port = port;
if (!process.env.FRONTEND_ORIGIN) throw errors_1.InternalError.NO_FRONTEND_ORIGIN;
const frontend_origin = process.env.FRONTEND_ORIGIN;
exports.frontend_origin = frontend_origin;
if (!process.env.DATABASE_URL) throw errors_1.InternalError.NO_DATABASE_URL;
const database_url = process.env.DATABASE_URL;
exports.database_url = database_url;
if (!process.env.FIREBASE_SERVICE_ACCOUNT) throw errors_1.InternalError.NO_FIREBASE_SERVICE_ACCOUNT;
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
exports.serviceAccountJson = serviceAccountJson;
