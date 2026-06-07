import mongoose from "mongoose";

import app from "../app";
import { database_url } from "../config";

void mongoose.connect(database_url);

export default app;
