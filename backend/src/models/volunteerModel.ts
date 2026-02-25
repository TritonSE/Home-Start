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
  statusTags: {
    type: [String],
    default: [],
  },
  volunteerTypeTags: {
    type: [String],
    default: [],
  },
  events: {
    type: [String],
    default: [],
  },
  additionalNotes: {
    type: String,
    default: "",
  },
});

type Volunteer = InferSchemaType<typeof volunteerSchema>;

export default model<Volunteer>("Volunteer", volunteerSchema);
