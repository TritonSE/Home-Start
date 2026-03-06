import { model, Schema } from "mongoose";

import type { InferSchemaType } from "mongoose";

const templateSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["text", "email"],
  },
  subject: {
    type: String,
    required: function (this: Template) {
      return this.type === "email";
    },
  },
});

type Template = InferSchemaType<typeof templateSchema>;

export default model<Template>("Template", templateSchema);
