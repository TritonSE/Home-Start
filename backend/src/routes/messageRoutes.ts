import express from "express";

import * as message from "../controllers/messageController";

const router = express.Router();

router.post("/send-email", message.sendEmails);

export default router;
