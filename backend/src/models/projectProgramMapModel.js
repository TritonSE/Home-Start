"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const projectProgramMapSchema = new mongoose_1.Schema({
  projectTagId: {
    type: mongoose_1.Schema.Types.ObjectId,
    ref: "Tag",
    required: true,
    unique: true,
  },
  programTagId: {
    type: mongoose_1.Schema.Types.ObjectId,
    ref: "Tag",
    required: true,
  },
});
exports.default = (0, mongoose_1.model)("ProjectProgramMap", projectProgramMapSchema);
