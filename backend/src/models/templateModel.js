"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const templateSchema = new mongoose_1.Schema({
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
    required: function () {
      return this.type === "email";
    },
  },
});
exports.default = (0, mongoose_1.model)("Template", templateSchema);
