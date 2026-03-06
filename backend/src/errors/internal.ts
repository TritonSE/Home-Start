import { CustomError } from "./errors";

const NO_APP_PORT = "Could not find app port env variable";
const NO_FRONTEND_ORIGIN = "Could not find frontend origin env variable";
const NO_DATABASE_URL = "Could not find DATABASE_URL env variable";
const NO_FIREBASE_SERVICE_ACCOUNT = "FIREBASE_SERVICE_ACCOUNT is not defined in .env";
const NO_TWILIO_ACCOUNT_SID = "TWILIO_ACCOUNT_SID is not defined in .env";
const NO_TWILIO_AUTH_TOKEN = "TWILIO_AUTH_TOKEN is not defined in .env";
const NO_TWILIO_PHONE_NUMBER = "TWILIO_PHONE_NUMBER is not defined in .env";

export class InternalError extends CustomError {
  static NO_APP_PORT = new InternalError(0, 500, NO_APP_PORT);
  static NO_FRONTEND_ORIGIN = new InternalError(0, 500, NO_FRONTEND_ORIGIN);
  static NO_DATABASE_URL = new InternalError(0, 500, NO_DATABASE_URL);
  static NO_FIREBASE_SERVICE_ACCOUNT = new InternalError(0, 500, NO_FIREBASE_SERVICE_ACCOUNT);
  static NO_TWILIO_ACCOUNT_SID = new InternalError(0, 500, NO_TWILIO_ACCOUNT_SID);
  static NO_TWILIO_AUTH_TOKEN = new InternalError(0, 500, NO_TWILIO_AUTH_TOKEN);
  static NO_TWILIO_PHONE_NUMBER = new InternalError(0, 500, NO_TWILIO_PHONE_NUMBER);
}
