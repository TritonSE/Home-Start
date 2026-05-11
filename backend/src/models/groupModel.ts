import { model, Schema } from "mongoose";

import type { InferSchemaType } from "mongoose";

const groupSchema = new Schema({
  name: { type: String, required: true, trim: true, unique: true },
});

type Group = InferSchemaType<typeof groupSchema>;

export default model<Group>("Group", groupSchema);
