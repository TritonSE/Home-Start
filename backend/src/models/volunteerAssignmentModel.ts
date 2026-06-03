import { model, Schema } from "mongoose";

import type { InferSchemaType } from "mongoose";

const volunteerAssignmentSchema = new Schema({
  volunteerId: {
    type: Schema.Types.ObjectId,
    ref: "Volunteer",
    required: true,
  },
  assignmentTagId: {
    type: Schema.Types.ObjectId,
    ref: "Tag",
    required: true,
  },
  projectTagId: {
    type: Schema.Types.ObjectId,
    ref: "Tag",
  },
  shiftTagIds: {
    type: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    default: [],
  },
});

volunteerAssignmentSchema.index(
  { volunteerId: 1, assignmentTagId: 1 },
  { unique: true, sparse: true },
);

type VolunteerAssignment = InferSchemaType<typeof volunteerAssignmentSchema>;

export default model<VolunteerAssignment>("VolunteerAssignment", volunteerAssignmentSchema);
