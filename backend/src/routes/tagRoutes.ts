import express from "express";

import * as tag from "../controllers/tagController";
import * as TagValidator from "../validators/tagValidator";

const router = express.Router();

router.get("/", tag.getTags);
router.get("/project-program-maps", tag.getProjectProgramMaps);
router.get("/:id", tag.getTag);
router.put("/:id", TagValidator.updateTagValidator, tag.updateTag);
router.delete("/:id", tag.deleteTag);

router.post("/", TagValidator.createTagValidator, tag.createTag);

export default router;
