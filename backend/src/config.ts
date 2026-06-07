import dotenv from "dotenv";

import { InternalError } from "./errors";

// Retrieve .env variables
dotenv.config({ quiet: true });

const port = process.env.PORT ?? "4000";

if (!process.env.FRONTEND_ORIGIN) throw InternalError.NO_FRONTEND_ORIGIN;
const frontend_origin = process.env.FRONTEND_ORIGIN;

if (!process.env.DATABASE_URL) throw InternalError.NO_DATABASE_URL;
const database_url = process.env.DATABASE_URL;

if (!process.env.FIREBASE_SERVICE_ACCOUNT) throw InternalError.NO_FIREBASE_SERVICE_ACCOUNT;
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

export { database_url, frontend_origin, port, serviceAccountJson };
