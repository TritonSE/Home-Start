"use strict";
/**
 * Initializes mongoose and express.
 */
const __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
async function startServer() {
  try {
    await mongoose_1.default.connect(config_1.database_url);
    console.info("Database Connected");
    app_1.default.listen(config_1.port, () => {
      console.info(`Listening on port ${config_1.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}
startServer().catch((err) => {
  console.error("Unhandled startup error:", err);
  process.exit(1);
});
