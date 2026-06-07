import { model, Schema } from "mongoose";

import type { InferSchemaType } from "mongoose";

const recipientSchema = new Schema(
  {
    firstName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
  },
  { _id: false },
);

const textJobSchema = new Schema({
  jobId: { type: String, required: true, unique: true },
  message: { type: String, required: true },
  recipients: { type: [recipientSchema], required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 },
});

type TextJob = InferSchemaType<typeof textJobSchema>;

export default model<TextJob>("TextJob", textJobSchema);
