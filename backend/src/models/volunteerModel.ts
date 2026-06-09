import { model, Schema } from "mongoose";

import type { InferSchemaType } from "mongoose";

const addressSchema = new Schema(
  {
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
  },
  { _id: false },
);

const volunteerSchema = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
  phoneNumber: { type: String },
  status: {
    type: String,
    enum: ["returning", "new"],
    default: "new",
  },
  address: { type: addressSchema, default: undefined },
  birthday: { type: Date },
  preferredPronouns: { type: String },
  dateCreated: { type: Date },
  effectiveDate: { type: Date },
  hours: { type: Number },
  wageRate: { type: Number },
  groupTagIds: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  programTagIds: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
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

type Volunteer = InferSchemaType<typeof volunteerSchema>;

export default model<Volunteer>("Volunteer", volunteerSchema);
