import { model, Schema } from "mongoose";

import type { InferSchemaType } from "mongoose";

const volunteerSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  tags: {
    type: [String],
    default: [],
    required: true,
  },
  jobNumber: {
    type: String,
  },
  new: {
    type: Boolean,
  },
  group: {
    type: String,
  },
  interestAcknowledged: {
    type: Boolean,
  },
  appRec: {
    type: Boolean,
  },
  position: {
    type: String,
  },
  confirmEmail: {
    type: Boolean,
  },
  assignRemindEmail: {
    type: Boolean,
  },
  completed: {
    type: Boolean,
  },
  inPhone: {
    type: Boolean,
  },
  inAbila: {
    type: Boolean,
  },
  inMailChimp: {
    type: Boolean,
  },
  notes: {
    type: String,
  },
});

type Volunteer = InferSchemaType<typeof volunteerSchema>;

export default model<Volunteer>("Volunteer", volunteerSchema);
