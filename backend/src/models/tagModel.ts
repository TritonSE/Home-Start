import { model, Schema } from "mongoose";

import type { InferSchemaType } from "mongoose";

const tagSchema = new Schema({
  name: { type: String, required: true, trim: true },
  color: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ["assignment", "project", "shift", "program", "group"],
    required: true,
  },
});

tagSchema.index({ name: 1, type: 1 }, { unique: true });

type Tag = InferSchemaType<typeof tagSchema>;

export default model<Tag>("Tag", tagSchema);
