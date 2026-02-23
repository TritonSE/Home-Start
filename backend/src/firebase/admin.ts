import dotenv from "dotenv";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

import type { ServiceAccount } from "firebase-admin";

dotenv.config();

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountJson) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT is not defined in .env");
}

const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;

// Initialize Firebase Admin with service account
const app = initializeApp({
  credential: cert(serviceAccount),
});

export const auth = getAuth(app);
