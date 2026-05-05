import { model, Schema } from "mongoose";

import type { InferSchemaType } from "mongoose";

const messageSchema = new Schema({
  recipients: {
    type: [Schema.Types.ObjectId],
    ref: "Volunteer",
    required: true,
    default: [],
  },
  type: {
    type: String,
    enum: ["text", "email"],
    required: true,
  },
  subject: {
    type: String,
    default: null,
  },
  body: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["sent", "pending"],
    default: "sent",
    required: true,
  },
});

type Message = InferSchemaType<typeof messageSchema>;

export default model<Message>("Message", messageSchema);
