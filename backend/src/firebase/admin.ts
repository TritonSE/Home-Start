import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

import { serviceAccountJson } from "../config";

import type { ServiceAccount } from "firebase-admin";

const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;

// Initialize Firebase Admin with service account
const app = initializeApp({
  credential: cert(serviceAccount),
});

export const auth = getAuth(app);
