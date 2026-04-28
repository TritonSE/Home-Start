import { model, Schema } from "mongoose";

import type { InferSchemaType } from "mongoose";

const projectProgramMapSchema = new Schema({
  projectTagId: {
    type: Schema.Types.ObjectId,
    ref: "Tag",
    required: true,
    unique: true,
  },
  programTagId: {
    type: Schema.Types.ObjectId,
    ref: "Tag",
    required: true,
  },
});

type ProjectProgramMap = InferSchemaType<typeof projectProgramMapSchema>;

export default model<ProjectProgramMap>("ProjectProgramMap", projectProgramMapSchema);
