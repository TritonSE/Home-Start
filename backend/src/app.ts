import { json } from "body-parser";
import express from "express";

import { port } from "./config";

// Initialize Express App
const app = express();

// Provide json body-parser middleware
app.use(json());

// Tell app to listen on our port environment variable
app.listen(port, () => {
  console.log(`> Listening on port ${port}`);
});
