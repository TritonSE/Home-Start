"use strict";
const __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_errors_1 = require("http-errors");
require("./firebase/admin");
const config_1 = require("./config");
const auth_1 = require("./middleware/auth");
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const tagRoutes_1 = __importDefault(require("./routes/tagRoutes"));
const templateRoutes_1 = __importDefault(require("./routes/templateRoutes"));
const volunteerAssignmentRoutes_1 = __importDefault(require("./routes/volunteerAssignmentRoutes"));
const volunteerRoutes_1 = __importDefault(require("./routes/volunteerRoutes"));
const handleError = (error, req, res, _next) => {
  // 500 is the "internal server error" error code, this will be our fallback
  let statusCode = 500;
  let errorMessage = "An error has occurred.";
  // check is necessary because anything can be thrown, type is not guaranteed
  if ((0, http_errors_1.isHttpError)(error)) {
    // error.status is unique to the http error class, it allows us to pass status codes with errors
    statusCode = error.status;
    errorMessage = error.message;
  }
  // prefer custom http errors but if they don't exist, fallback to default
  else if (error instanceof Error) {
    errorMessage = error.message;
  }
  res.status(statusCode).json({ error: errorMessage });
};
const app = (0, express_1.default)();
// Provide json body-parser middleware
app.use(express_1.default.json());
app.use(
  (0, cors_1.default)({
    origin: config_1.frontend_origin,
  }),
);
app.use("/api/volunteer", auth_1.verifyToken, volunteerRoutes_1.default);
app.use("/api/volunteerAssignment", auth_1.verifyToken, volunteerAssignmentRoutes_1.default);
app.use("/api/tag", auth_1.verifyToken, tagRoutes_1.default);
app.use("/api/messages", auth_1.verifyToken, messageRoutes_1.default);
app.use("/api/template", auth_1.verifyToken, templateRoutes_1.default);
app.use("/api/message", auth_1.verifyToken, messageRoutes_1.default);
app.use(handleError);
exports.default = app;
