/**
 * Initializes mongoose and express.
 */

import "module-alias/register";
import mongoose from "mongoose";

import app from "./app";
import env from "./util/validateEnv";

const PORT = env.PORT;
const MONGODB_URI = env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.info("Mongoose connected!");
    app.listen(PORT, () => {
      console.info(`Server running on ${PORT}.`);
    });
  })
  .catch(console.error);
