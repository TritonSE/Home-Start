import { model, Schema } from "mongoose";

import type { InferSchemaType } from "mongoose";

const tagSchema = new Schema({
  name: { type: String, required: true },
  // Color is a hex string
  color: { type: String, required: true },
  type: { 
    type: String,
    enum: ["Volunteer Type", "Event"],
    required: true
  },
});

type Tag = InferSchemaType<typeof tagSchema>;

export default model<Tag>("Tag", tagSchema);
