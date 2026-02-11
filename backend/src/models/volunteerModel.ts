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
  status: {
    type: String,
    enum: ["returning", "new"],
  },
});

type Volunteer = InferSchemaType<typeof volunteerSchema>;

export default model<Volunteer>("Volunteer", volunteerSchema);
