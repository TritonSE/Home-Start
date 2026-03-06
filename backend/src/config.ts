import dotenv from "dotenv";

import { InternalError } from "./errors";

// Retrieve .env variables
dotenv.config({ quiet: true });

if (!process.env.PORT) throw InternalError.NO_APP_PORT;
const port = process.env.PORT;

if (!process.env.FRONTEND_ORIGIN) throw InternalError.NO_FRONTEND_ORIGIN;
const frontend_origin = process.env.FRONTEND_ORIGIN;

if (!process.env.DATABASE_URL) throw InternalError.NO_DATABASE_URL;
const database_url = process.env.DATABASE_URL;

if (!process.env.FIREBASE_SERVICE_ACCOUNT) throw InternalError.NO_FIREBASE_SERVICE_ACCOUNT;
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!process.env.TWILIO_ACCOUNT_SID) throw InternalError.NO_TWILIO_ACCOUNT_SID;
if (!process.env.TWILIO_AUTH_TOKEN) throw InternalError.NO_TWILIO_AUTH_TOKEN;
if (!process.env.TWILIO_PHONE_NUMBER) throw InternalError.NO_TWILIO_PHONE_NUMBER;
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

export {
  database_url,
  frontend_origin,
  port,
  serviceAccountJson,
  twilioAccountSid,
  twilioAuthToken,
  twilioPhoneNumber,
};
