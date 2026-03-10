import { model, Schema } from "mongoose";

import type { InferSchemaType } from "mongoose";

const chatLogModel = new Schema({
  volunteerIds: { type: [Schema.Types.ObjectId], required: true },
  conversationName: { type: String, required: true },
  conversationSID: { type: String, required: true },
});

type ChatLog = InferSchemaType<typeof chatLogModel>;

export default model<ChatLog>("ChatLog", chatLogModel);
