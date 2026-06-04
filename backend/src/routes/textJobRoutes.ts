import express from "express";

import { createTextJob, getTextJob } from "../controllers/textJobController";
import { verifyToken } from "../middleware/auth";

const router = express.Router();

router.post("/", verifyToken, createTextJob);
router.get("/:id", getTextJob);

export default router;
