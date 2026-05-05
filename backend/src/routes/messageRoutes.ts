import express from "express";

import * as message from "../controllers/messageController";
import * as MessageValidator from "../validators/messageValidator";

const router = express.Router();

router.get("/:id", MessageValidator.getMessageValidator, message.getMessage);
router.get("/", MessageValidator.getMessagesValidator, message.getMessages);

router.post("/", MessageValidator.createMessageValidator, message.createMessage);

export default router;
