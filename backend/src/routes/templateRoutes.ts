import express from "express";

import * as template from "../controllers/templateController";
import * as TemplateValidator from "../validators/templateValidator";

const router = express.Router();

router.get("/:id", template.getTemplate);
router.get("/", template.getTemplates);
router.delete("/:id", template.deleteTemplate);

router.post("/", TemplateValidator.createTemplateValidator, template.createTemplate);
router.put("/:id", TemplateValidator.createTemplateValidator, template.updateTemplate);

export default router;
