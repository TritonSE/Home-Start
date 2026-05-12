"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const addressSchema = new mongoose_1.Schema(
  {
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
  },
  { _id: false },
);
const volunteerSchema = new mongoose_1.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  status: {
    type: String,
    enum: ["returning", "new"],
    default: "new",
  },
  address: { type: addressSchema, default: undefined },
  birthday: { type: Date },
  preferredPronouns: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  effectiveDate: { type: Date },
  hours: { type: Number },
  wageRate: { type: Number },
  // Keep volunteer->group and volunteer->program as explicit singular tag refs.
  // We removed the generic `tags` list to avoid duplication and make the model explicit.
  groupTagId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Tag", default: null },
  programTagId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Tag", default: null },
  additionalNotes: { type: String },
  mediaConsent: {
    type: String,
    enum: ["yes", "no"],
    default: "no",
  },
  faceConsent: {
    type: String,
    enum: ["yes", "no"],
    default: "no",
  },
  nameConsent: {
    type: String,
    enum: ["first", "full", "no"],
    default: "no",
  },
});
exports.default = (0, mongoose_1.model)("Volunteer", volunteerSchema);
