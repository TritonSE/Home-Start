import { model, Schema } from "mongoose";

import type { InferSchemaType } from "mongoose";

const tagSchema = new Schema({
  name: { type: String, required: true, trim: true, unique: true },
  color: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ["assignment", "project", "shift", "program", "group"],
    required: true,
  },
});

type Tag = InferSchemaType<typeof tagSchema>;

export default model<Tag>("Tag", tagSchema);
