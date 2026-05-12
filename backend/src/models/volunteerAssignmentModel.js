"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const volunteerAssignmentSchema = new mongoose_1.Schema({
  volunteerId: {
    type: mongoose_1.Schema.Types.ObjectId,
    ref: "Volunteer",
    required: true,
  },
  assignmentTagId: {
    type: mongoose_1.Schema.Types.ObjectId,
    ref: "Tag",
    required: true,
  },
  projectTagId: {
    type: mongoose_1.Schema.Types.ObjectId,
    ref: "Tag",
    required: true,
  },
  shiftTagIds: {
    type: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Tag" }],
    default: [],
  },
});
volunteerAssignmentSchema.index(
  { volunteerId: 1, assignmentTagId: 1, projectTagId: 1 },
  { unique: true },
);
exports.default = (0, mongoose_1.model)("VolunteerAssignment", volunteerAssignmentSchema);
