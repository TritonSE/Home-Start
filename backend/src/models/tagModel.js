"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const tagSchema = new mongoose_1.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  color: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ["assignment", "project", "shift", "program", "group"],
    required: true,
  },
});
exports.default = (0, mongoose_1.model)("Tag", tagSchema);
