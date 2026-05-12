"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
  recipients: {
    type: [mongoose_1.Schema.Types.ObjectId],
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
exports.default = (0, mongoose_1.model)("Message", messageSchema);
