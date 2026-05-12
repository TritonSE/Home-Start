"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");

const config_1 = require("../config");
const serviceAccount = JSON.parse(config_1.serviceAccountJson);
// Initialize Firebase Admin with service account
const app = (0, app_1.initializeApp)({
  credential: (0, app_1.cert)(serviceAccount),
});
exports.auth = (0, auth_1.getAuth)(app);
